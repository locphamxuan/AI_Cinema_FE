import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { PosterPanel } from '@/features/production/components/project/PosterPanel';
import { productionService } from '@/services/productionService';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
const saveBlob = vi.fn();
vi.mock('@/lib/format', async (original) => ({
  ...(await original<typeof import('@/lib/format')>()),
  saveBlob: (...args: unknown[]) => saveBlob(...args),
}));

const STUDIO_POSTER = { fileName: 'poster-mua-sai-gon.png', uploadedAt: '2026-11-22T03:00:00.000Z' };
const panel = (studioPoster: typeof STUDIO_POSTER | null, canManage = true) =>
  withProject(assignedProject({ studioPoster, posterUrl: null }), <PosterPanel canManage={canManage} />);

beforeEach(() => {
  vi.mocked(toast.error).mockClear();
  saveBlob.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe('PosterPanel – poster sent by the studio', () => {
  it('lets the Reviewer in charge download the poster the studio sent, next to the upload button', async () => {
    signInAs('reviewer');
    const calls = routeFetch({});
    render(panel(STUDIO_POSTER));

    expect(screen.getByText(/Poster Studio đã nộp:/)).toHaveTextContent('poster-mua-sai-gon.png');
    expect(screen.getByRole('button', { name: 'Tải ảnh' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tải poster của Studio' }));

    await waitFor(() => expect(saveBlob).toHaveBeenCalledWith(expect.any(Blob), 'poster-mua-sai-gon.png'));
    expect(calls.some((c) => c.path === '/projects/m1/studio-poster/content' && c.method === 'GET')).toBe(true);
  });

  it('lets the Admin download it too', () => {
    signInAs('admin');
    routeFetch({});
    render(panel(STUDIO_POSTER, false));
    expect(screen.getByRole('button', { name: 'Tải poster của Studio' })).toBeInTheDocument();
  });

  it('shows nothing before the studio sends a poster, nor to a Creator', () => {
    signInAs('reviewer');
    routeFetch({});
    const { unmount } = render(panel(null));
    expect(screen.queryByText(/Poster Studio đã nộp/)).not.toBeInTheDocument();
    unmount();
    signInAs('creator');
    render(panel(STUDIO_POSTER, false));
    expect(screen.queryByRole('button', { name: 'Tải poster của Studio' })).not.toBeInTheDocument();
  });

  it('says so when the poster cannot be downloaded', async () => {
    signInAs('reviewer');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    render(panel(STUDIO_POSTER));
    await userEvent.click(screen.getByRole('button', { name: 'Tải poster của Studio' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không tải được file', expect.any(String)));
    expect(saveBlob).not.toHaveBeenCalled();
  });

  it('reads the file from the studio poster route of the API', async () => {
    const calls = routeFetch({});
    await productionService.downloadStudioPoster('m1');
    expect(calls[0].path).toBe('/projects/m1/studio-poster/content');
  });
});
