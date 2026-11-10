import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { IdeaFilesPanel } from '@/features/production/components/project/IdeaFilesPanel';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import type { IdeaFile } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const file = (overrides: Partial<IdeaFile>): IdeaFile => ({
  id: 'f1',
  fileName: 'y-tuong.pdf',
  purpose: 'IDEA',
  version: 2,
  mimeType: 'application/pdf',
  sizeBytes: 2048,
  createdAt: '2026-11-01T00:00:00.000Z',
  ...overrides,
});

const project = () =>
  assignedProject({ ideaFiles: [file({}), file({ id: 'f2', fileName: 'tom-tat.docx', purpose: 'SYNOPSIS', version: 1 })] });

const panel = (canManage: boolean, reload = vi.fn(async () => undefined), purpose: 'IDEA' | 'SYNOPSIS' = 'IDEA') =>
  withProject(project(), <IdeaFilesPanel canManage={canManage} purpose={purpose} />, reload);

beforeEach(() => {
  vi.mocked(toast.error).mockClear();
  vi.mocked(toast.success).mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe('IdeaFilesPanel', () => {
  it('lists only the files of its purpose, with their version', () => {
    routeFetch({});
    render(panel(false));
    expect(screen.getByText('y-tuong.pdf')).toBeInTheDocument();
    expect(screen.getByText(/· v2 ·/)).toBeInTheDocument();
    expect(screen.queryByText('tom-tat.docx')).not.toBeInTheDocument();
  });

  it('gives a viewer who cannot manage downloads but no upload or delete', () => {
    routeFetch({});
    render(panel(false));
    expect(screen.getByRole('button', { name: 'Tải y-tuong.pdf' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tải lên' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Xoá / })).not.toBeInTheDocument();
  });

  it('uploads a file with its purpose and reloads the project', async () => {
    const calls = routeFetch({ '/projects/m1/idea-files': file({ id: 'f3', purpose: 'SYNOPSIS' }) });
    const reload = vi.fn(async () => undefined);
    const { container } = render(panel(true, reload, 'SYNOPSIS'));

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(['nội dung'], 'tom-tat-2.txt', { type: 'text/plain' }));

    await waitFor(() => expect(reload).toHaveBeenCalled());
    const sent = calls.find((c) => c.path === '/projects/m1/idea-files')!;
    expect(sent.method).toBe('POST');
    expect(((sent.body as FormData).get('file') as File).name).toBe('tom-tat-2.txt');
    expect(toast.success).toHaveBeenCalledWith('Đã tải tệp tóm tắt');
  });

  it('asks before deleting a version, then deletes it', async () => {
    const calls = routeFetch({ '/projects/m1/idea-files/f1': null });
    const reload = vi.fn(async () => undefined);
    render(panel(true, reload));

    await userEvent.click(screen.getByRole('button', { name: 'Xoá y-tuong.pdf v2' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('không còn đi kèm brief gửi Studio');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xoá file' }));

    await waitFor(() => expect(reload).toHaveBeenCalled());
    expect(calls.some((c) => c.path === '/projects/m1/idea-files/f1' && c.method === 'DELETE')).toBe(true);
  });

  it('shows the refusal and keeps the dialog when the delete fails', async () => {
    routeFetch({ '/projects/m1/idea-files/f1': failWith(409, 'The project is no longer open') });
    const reload = vi.fn(async () => undefined);
    render(panel(true, reload));

    await userEvent.click(screen.getByRole('button', { name: 'Xoá y-tuong.pdf v2' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Xoá file' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không thực hiện được', expect.stringContaining('no longer open')));
    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('says so when a file cannot be downloaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    render(panel(false));
    await userEvent.click(screen.getByRole('button', { name: 'Tải y-tuong.pdf' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không tải được file', expect.any(String)));
  });
});
