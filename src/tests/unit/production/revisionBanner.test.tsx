import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectDetailPage } from '@/features/production/components/project/ProjectDetailPage';
import { signInAs } from '@/tests/support/signIn';
import { assignedProject } from '@/tests/support/projectContext';
import { routeFetch } from '@/tests/support/routeFetch';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/projects/m1',
  useParams: () => ({ projectId: 'm1' }),
  useSearchParams: () => new URLSearchParams('tab=activity'),
}));

const project = (revision: { episodeCount: number; bySeason: { seasonNumber: number; episodeNumbers: number[] }[] }) =>
  assignedProject({ seasons: [], genres: [], ideaFiles: [], studioHandoffs: [], creatorAssignments: [], revision });

afterEach(() => vi.unstubAllGlobals());

describe('ProjectDetailPage revision banner', () => {
  it('stays hidden while no episode is being fixed, although the API always sends the summary', async () => {
    signInAs('admin');
    routeFetch({ '/projects/m1': project({ episodeCount: 0, bySeason: [] }) });
    render(<ProjectDetailPage />);
    await screen.findByRole('heading', { name: 'Mưa Sài Gòn' });
    expect(screen.queryByText(/Đang sửa/)).not.toBeInTheDocument();
  });

  it('names the episodes being fixed, season by season', async () => {
    signInAs('admin');
    routeFetch({ '/projects/m1': project({ episodeCount: 1, bySeason: [{ seasonNumber: 1, episodeNumbers: [2] }] }) });
    render(<ProjectDetailPage />);
    const banner = (await screen.findByText(/Đang sửa 1 tập/)).closest('[role="status"]');
    expect(banner).toHaveTextContent('Đang sửa 1 tập: mùa 1: tập 2');
  });
});
