import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { ChangeStudioModal } from '@/features/production/components/project/HandoffModals';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { ProjectDetail } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

/** In production with 50 M left and the whole project handed to the current studio for 100 M. */
const producing = () =>
  assignedProject({
    status: 'IN_PRODUCTION',
    cost: { budgetVnd: 200_000_000, committedVnd: 150_000_000, remainingVnd: 50_000_000 },
    seasons: [{ id: 's1', seasonNumber: 1, title: null, episodes: [{ id: 'e1' }, { id: 'e2' }] }] as never,
    studioHandoffs: [{ id: 'h1', seasonId: null, milestoneStatus: 'IN_PRODUCTION', offeredFeeVnd: 100_000_000 }] as never,
  } as Partial<ProjectDetail>);

async function fill({ email = 'moi@studio.vn', name = 'Studio Mới', fee = '120000000', kept = '', reason = 'Studio cũ trễ hạn' } = {}) {
  if (name) await userEvent.type(screen.getByLabelText('Tên Studio'), name);
  if (email) await userEvent.type(screen.getByLabelText('Email Studio'), email);
  if (kept) await userEvent.type(screen.getByLabelText('Studio cũ giữ lại'), kept);
  if (fee) await userEvent.type(screen.getByLabelText('Phí đề xuất'), fee);
  if (reason) await userEvent.type(screen.getByLabelText(/Lý do đổi Studio/), reason);
}

const submitButton = () => screen.getByRole('button', { name: 'Đổi Studio' });

beforeEach(() => {
  localStorage.clear();
  vi.mocked(toast.error).mockClear();
  signInAs('admin');
});
afterEach(() => vi.unstubAllGlobals());

describe('ChangeStudioModal', () => {
  it('sends the typed studio, the fee, the kept part and the reason, then reloads and closes', async () => {
    const calls = routeFetch({ '/projects/m1/studio-change': [] });
    const reload = vi.fn(async () => undefined);
    const onClose = vi.fn();
    render(withProject(producing(), <ChangeStudioModal onClose={onClose} />, reload));

    expect(screen.getByText(/Phí đã đề xuất cho Studio cũ: 100\.000\.000/)).toBeInTheDocument();
    await fill({ kept: '20000000' });
    // 50 M left + 100 M freed - 20 M kept.
    expect(screen.getByText(/Tối đa 130\.000\.000/)).toBeInTheDocument();
    await userEvent.click(submitButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const sent = calls.find((c) => c.path === '/projects/m1/studio-change')!;
    expect(sent.method).toBe('POST');
    expect(Object.fromEntries((sent.body as FormData).entries())).toEqual({
      studioEmail: 'moi@studio.vn',
      studioName: 'Studio Mới',
      reason: 'Studio cũ trễ hạn',
      offeredFeeVnd: '120000000',
      forfeitedVnd: '20000000',
    });
    expect(reload).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Đã đổi Studio, gửi brief và hợp đồng mẫu cho Studio mới');
  });

  it('calls the fee a proposal and says the new studio gets a contract to quote and sign', () => {
    routeFetch({});
    render(withProject(producing(), <ChangeStudioModal onClose={vi.fn()} />));

    expect(screen.getByLabelText('Phí đề xuất')).toBeInTheDocument();
    expect(screen.getByText('Phí sản xuất đề xuất cho Studio mới (₫)')).toBeInTheDocument();
    expect(screen.getByText(/phí chính thức là giá ký trong hợp đồng/)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('Studio mới nhận brief kèm hợp đồng mẫu để báo giá và ký trên Studio Web');
  });

  it('blocks a fee above what the budget allows and says the Reviewer must ask for more', async () => {
    routeFetch({});
    render(withProject(producing(), <ChangeStudioModal onClose={vi.fn()} />));

    await fill({ fee: '160000000' });
    expect(screen.getByText(/Vượt ngân sách/)).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('blocks keeping more than the old studio was offered', async () => {
    routeFetch({});
    render(withProject(producing(), <ChangeStudioModal onClose={vi.fn()} />));

    await fill({ kept: '100000001' });
    expect(submitButton()).toBeDisabled();
  });

  it('needs the studio email, a name of two letters or more and a reason of five', async () => {
    routeFetch({});
    render(withProject(producing(), <ChangeStudioModal onClose={vi.fn()} />));

    await fill({ email: '' });
    expect(submitButton()).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Email Studio'), 'moi@studio.vn');
    expect(submitButton()).toBeEnabled();
    await userEvent.clear(screen.getByLabelText(/Lý do đổi Studio/));
    await userEvent.type(screen.getByLabelText(/Lý do đổi Studio/), 'trễ');
    expect(submitButton()).toBeDisabled();
  });

  it('offers a season as the scope and frees only what that season was given', async () => {
    const project = producing();
    render(withProject(project, <ChangeStudioModal onClose={vi.fn()} />));
    routeFetch({});

    await userEvent.selectOptions(screen.getByLabelText('Phạm vi bàn giao'), 's1');
    expect(screen.getByText(/Phí đã đề xuất cho Studio cũ: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Tối đa 50\.000\.000/)).toBeInTheDocument();
  });

  it('shows the refusal of the API and keeps the form open', async () => {
    routeFetch({ '/projects/m1/studio-change': failWith(409, 'Studio email belongs to the current studio') });
    const onClose = vi.fn();
    const reload = vi.fn(async () => undefined);
    render(withProject(producing(), <ChangeStudioModal onClose={onClose} />, reload));

    await fill();
    await userEvent.click(submitButton());

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không thực hiện được', expect.stringContaining('current studio')));
    expect(onClose).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Email Studio')).toHaveValue('moi@studio.vn');
  });
});
