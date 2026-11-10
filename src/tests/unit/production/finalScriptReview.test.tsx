import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { FinalScriptReview } from '@/features/production/components/project/FinalScriptReview';
import { ScriptTab } from '@/features/production/components/project/ScriptTab';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { ProjectScript } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const scriptIn = (status: ProjectScript['status'] = 'REVIEWER_APPROVED'): ProjectScript => ({
  projectId: 'm1',
  status,
  currentVersion: 1,
  finalizedAt: null,
  versions: [{ id: 'v1', version: 1, content: 'CẢNH 1', note: null, createdAt: '2026-11-01T00:00:00.000Z', submittedBy: { id: 'c', fullName: 'Creator Một' } }],
  reviews: [],
});

const bodyOf = (calls: ReturnType<typeof routeFetch>) =>
  JSON.parse(calls.find((c) => c.path === '/projects/m1/script/final-review')!.body as string);

beforeEach(() => {
  localStorage.clear();
  vi.mocked(toast.error).mockClear();
  signInAs('admin');
});
afterEach(() => vi.unstubAllGlobals());

describe('FinalScriptReview', () => {
  it('sends the script back to the Creator with the reason of the Admin', async () => {
    const calls = routeFetch({ '/projects/m1/script/final-review': scriptIn('REVISION_REQUESTED') });
    const onDecided = vi.fn();
    render(withProject(assignedProject(), <FinalScriptReview onDecided={onDecided} />));

    await userEvent.click(screen.getByRole('button', { name: 'Yêu cầu sửa' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByRole('textbox'), 'Kết phim quá vội');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Gửi yêu cầu sửa' }));

    await waitFor(() => expect(onDecided).toHaveBeenCalledWith(expect.objectContaining({ status: 'REVISION_REQUESTED' })));
    expect(bodyOf(calls)).toEqual({ approve: false, comment: 'Kết phim quá vội' });
  });

  it('approves for the studio of the project with the platform terms when none are typed', async () => {
    const calls = routeFetch({ '/projects/m1/script/final-review': scriptIn('FINAL') });
    const onDecided = vi.fn();
    render(withProject(assignedProject(), <FinalScriptReview onDecided={onDecided} />));

    expect(screen.getByText('Lumen Studio')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Đồng ý Kịch bản Final' }));

    await waitFor(() => expect(onDecided).toHaveBeenCalled());
    expect(bodyOf(calls)).toEqual({ approve: true });
  });

  it('cannot approve while an episode has no delivery deadline, and says which one', () => {
    routeFetch({});
    const project = assignedProject({
      seasons: [
        {
          id: 's1',
          episodes: [
            { id: 'e1', episodeNumber: 1, title: 'Một', deliveryDeadline: '2027-01-01T00:00:00.000Z' },
            { id: 'e2', episodeNumber: 2, title: 'Hai', deliveryDeadline: null },
          ],
        },
      ] as never,
    });
    render(withProject(project, <FinalScriptReview onDecided={vi.fn()} />));

    expect(screen.getByRole('status')).toHaveTextContent('tập 2 chưa có hạn giao Studio');
    expect(screen.getByRole('button', { name: 'Đồng ý Kịch bản Final' })).toBeDisabled();
  });

  it('cannot approve before the Reviewer planned any episode', () => {
    routeFetch({});
    render(withProject(assignedProject({ seasons: [] }), <FinalScriptReview onDecided={vi.fn()} />));
    expect(screen.getByRole('status')).toHaveTextContent('Reviewer chưa lên tập nào cho dự án');
  });

  it('needs a studio picked when the project has none', async () => {
    routeFetch({ '/studios': [{ id: 'st2', name: 'Nova Studio' }] });
    render(withProject(assignedProject({ studio: null }), <FinalScriptReview onDecided={vi.fn()} />));

    const approve = screen.getByRole('button', { name: 'Đồng ý Kịch bản Final' });
    expect(approve).toBeDisabled();
    await screen.findByRole('option', { name: 'Nova Studio' });
    await userEvent.selectOptions(screen.getByLabelText('Studio nhận hợp đồng'), 'st2');
    expect(approve).toBeEnabled();
  });

  it('shows the refusal of the API and decides nothing', async () => {
    routeFetch({ '/projects/m1/script/final-review': failWith(409, 'The script is SUBMITTED (expected REVIEWER_APPROVED)') });
    const onDecided = vi.fn();
    render(withProject(assignedProject(), <FinalScriptReview onDecided={onDecided} />));

    await userEvent.click(screen.getByRole('button', { name: 'Đồng ý Kịch bản Final' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không thực hiện được', expect.stringContaining('SUBMITTED')));
    expect(onDecided).not.toHaveBeenCalled();
  });
});

describe('ScriptTab gating of the Final Script decision', () => {
  it('is offered to the Admin once the Reviewer approved the script', async () => {
    routeFetch({ '/projects/m1/script': scriptIn() });
    render(withProject(assignedProject(), <ScriptTab />));
    expect(await screen.findByRole('button', { name: 'Đồng ý Kịch bản Final' })).toBeInTheDocument();
  });

  it('is not offered to the Reviewer in charge', async () => {
    signInAs('reviewer');
    routeFetch({ '/projects/m1/script': scriptIn() });
    render(withProject(assignedProject({ reviewerId: 'reviewer-id' }), <ScriptTab />));
    expect(await screen.findByText('CẢNH 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đồng ý Kịch bản Final' })).not.toBeInTheDocument();
  });

  it('is not offered on a script still waiting for the Reviewer', async () => {
    routeFetch({ '/projects/m1/script': scriptIn('SUBMITTED') });
    render(withProject(assignedProject(), <ScriptTab />));
    expect(await screen.findByText('CẢNH 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đồng ý Kịch bản Final' })).not.toBeInTheDocument();
  });
});
