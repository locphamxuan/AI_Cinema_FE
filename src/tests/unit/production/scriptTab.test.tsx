import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { finalScriptBlockers } from '@/features/production/components/project/FinalScriptReview';
import { ProjectNotesPanel } from '@/features/production/components/project/ProjectNotesPanel';
import { ScriptTab } from '@/features/production/components/project/ScriptTab';
import { useAppStore } from '@/store/useAppStore';
import { assignedProject, STUDIO, withProject } from '@/tests/support/projectContext';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { ProjectScript } from '@/types/production';
import type { WebRole } from '@/lib/permissions';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const person = { id: 'p1', fullName: 'Người Một' };
const script = (overrides: Partial<ProjectScript> = {}): ProjectScript => ({
  projectId: 'm1',
  status: 'SUBMITTED',
  currentVersion: 2,
  finalizedAt: null,
  versions: [
    { id: 'v2', version: 2, content: 'CẢNH 2 - bản mới', note: 'Đổi kết', createdAt: '2026-11-02T00:00:00.000Z', submittedBy: person },
    { id: 'v1', version: 1, content: 'CẢNH 1 - bản cũ', note: null, createdAt: '2026-11-01T00:00:00.000Z', submittedBy: person },
  ],
  reviews: [{ id: 'r1', version: 1, stage: 'REVIEWER', approved: false, comment: 'Cần đổi kết', createdAt: '2026-11-01T10:00:00.000Z', reviewer: person }],
  ...overrides,
});

function signIn(role: WebRole, id: string) {
  signInAs(role);
  useAppStore.setState((s) => ({ user: { ...s.user!, id } }));
}

const bodyOf = (calls: ReturnType<typeof routeFetch>, path: string) =>
  JSON.parse(calls.find((c) => c.path === path && c.method === 'POST')!.body as string);

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('ScriptTab', () => {
  it('lets the lead Creator write the first version and submit it to the Reviewer', async () => {
    signIn('creator', 'creator-id');
    const calls = routeFetch({ '/projects/m1/script': null, '/projects/m1/script/versions': script({ currentVersion: 1 }) });
    render(withProject(assignedProject(), <ScriptTab />));

    const submit = await screen.findByRole('button', { name: 'Nộp cho Reviewer' });
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Nội dung kịch bản'), 'CẢNH 1');
    await userEvent.click(submit);

    await waitFor(() => expect(bodyOf(calls, '/projects/m1/script/versions')).toEqual({ content: 'CẢNH 1' }));
    // Once submitted the script waits for its review: no editor.
    await waitFor(() => expect(screen.queryByLabelText('Nội dung kịch bản')).not.toBeInTheDocument());
  });

  it('reopens the editor from the latest version once changes were requested', async () => {
    signIn('creator', 'creator-id');
    routeFetch({ '/projects/m1/script': script({ status: 'REVISION_REQUESTED' }) });
    render(withProject(assignedProject(), <ScriptTab />));

    expect(await screen.findByLabelText('Nội dung kịch bản')).toHaveValue('CẢNH 2 - bản mới');
    expect(screen.getByRole('button', { name: 'Nộp cho Reviewer' })).toBeDisabled();
    expect(within(screen.getByRole('list', { name: 'Góp ý kịch bản' })).getByText('Cần đổi kết')).toBeInTheDocument();
  });

  it('keeps a Creator who is not the lead out of the editor', async () => {
    signIn('creator', 'second-id');
    routeFetch({ '/projects/m1/script': null });
    render(withProject(assignedProject(), <ScriptTab />));

    expect(await screen.findByText('Creator chính chưa nộp kịch bản.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nội dung kịch bản')).not.toBeInTheDocument();
  });

  it('lets the Reviewer in charge approve, or send back only with a comment', async () => {
    signIn('reviewer', 'reviewer-id');
    const calls = routeFetch({ '/projects/m1/script': script(), '/projects/m1/script/review': script({ status: 'REVISION_REQUESTED' }) });
    render(withProject(assignedProject(), <ScriptTab />));

    expect(await screen.findByRole('button', { name: 'Duyệt kịch bản' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Yêu cầu sửa' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Gửi yêu cầu sửa' })).toBeDisabled();
    await userEvent.type(within(dialog).getByRole('textbox'), 'Đổi cảnh mở đầu');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Gửi yêu cầu sửa' }));

    await waitFor(() => expect(bodyOf(calls, '/projects/m1/script/review')).toEqual({ approve: false, comment: 'Đổi cảnh mở đầu' }));
  });

  it('makes the Admin pick the studio when the project has none, then approves the Final Script', async () => {
    signIn('admin', 'admin-id');
    const calls = routeFetch({
      '/projects/m1/script': script({ status: 'REVIEWER_APPROVED' }),
      '/projects/m1/script/final-review': script({ status: 'FINAL', finalizedAt: '2026-11-03T00:00:00.000Z' }),
      '/studios': [STUDIO],
    });
    const reload = vi.fn(async () => undefined);
    render(withProject(assignedProject({ studio: null }), <ScriptTab />, reload));

    const approve = await screen.findByRole('button', { name: 'Đồng ý Kịch bản Final' });
    expect(approve).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText('Studio nhận hợp đồng'), await screen.findByRole('option', { name: 'Lumen Studio' }));
    await userEvent.type(screen.getByLabelText('Điều khoản hợp đồng (tuỳ chọn)'), 'Giao đúng hạn');
    await userEvent.click(approve);

    await waitFor(() =>
      expect(bodyOf(calls, '/projects/m1/script/final-review')).toEqual({ approve: true, studioId: 'st1', terms: 'Giao đúng hạn' }),
    );
    await waitFor(() => expect(reload).toHaveBeenCalled());
    // The Final Script is locked.
    expect(await screen.findByText(/không sửa được nữa/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đồng ý Kịch bản Final' })).not.toBeInTheDocument();
  });

  it('blocks the Final Script until the Reviewer planned every episode with a deadline', async () => {
    expect(finalScriptBlockers(assignedProject({ seasons: [] }))).toEqual(['Reviewer chưa lên tập nào cho dự án']);
    const undated = assignedProject({ seasons: [{ episodes: [{ id: 'e3', episodeNumber: 3, title: 'Ba', deliveryDeadline: null }] }] as never });
    expect(finalScriptBlockers(undated)).toEqual(['tập 3 chưa có hạn giao Studio']);

    signIn('admin', 'admin-id');
    routeFetch({ '/projects/m1/script': script({ status: 'REVIEWER_APPROVED' }) });
    render(withProject(undated, <ScriptTab />));
    expect(await screen.findByRole('button', { name: 'Đồng ý Kịch bản Final' })).toBeDisabled();
    expect(screen.getByText(/tập 3 chưa có hạn giao Studio/)).toBeInTheDocument();
  });
});

describe('ProjectNotesPanel', () => {
  const note = { id: 'n1', message: 'Giữ tông trầm', createdAt: '2026-11-01T00:00:00.000Z', author: { id: 'a', fullName: 'An Admin', role: 'ADMIN' } };

  it('lets the lead Creator read and answer the idea notes', async () => {
    signIn('creator', 'creator-id');
    const calls = routeFetch({ '/projects/m1/notes': [note] });
    render(withProject(assignedProject(), <ProjectNotesPanel />));

    expect(await screen.findByText('Giữ tông trầm')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Nội dung trao đổi'), 'Đã rõ');
    await userEvent.click(screen.getByRole('button', { name: /Gửi trao đổi/ }));
    await waitFor(() => expect(bodyOf(calls, '/projects/m1/notes')).toEqual({ message: 'Đã rõ' }));
  });

  it('only lets a Creator outside the lead read', async () => {
    signIn('creator', 'second-id');
    routeFetch({ '/projects/m1/notes': [note] });
    render(withProject(assignedProject(), <ProjectNotesPanel />));

    await screen.findByText('Giữ tông trầm');
    expect(screen.queryByRole('button', { name: /Gửi trao đổi/ })).not.toBeInTheDocument();
  });
});
