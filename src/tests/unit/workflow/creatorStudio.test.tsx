import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreatorStudioPage } from '@/features/workflow/components/creator/studio/CreatorStudioPage';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { initialProject } from '@/tests/fixtures/workflowFixtures';
import type { EpisodePackage, WorkflowState } from '@/types/workflow';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/features/workflow/components/shared/ClipVideo', () => ({ ClipVideo: () => null }));

const produced = initialProject.episodes.find((e) => e.status === 'EPISODE_SUBMITTED')!;

describe('CreatorStudioPage', () => {
  const actions = {
    loadRouting: vi.fn(),
    loadProjects: vi.fn(),
    loadJobs: vi.fn(),
    setActivePackage: vi.fn(),
    triggerGenerationJob: vi.fn().mockResolvedValue(true),
    submitEpisodePackage: vi.fn().mockResolvedValue(true),
  };

  const openStudio = (status: WorkflowState, overrides: Partial<EpisodePackage> = {}) => {
    const episode = { ...produced, status, ...overrides };
    useWorkflowStore.setState({ project: { ...initialProject, episodes: [episode] }, routing: [], ...actions });
    render(<CreatorStudioPage episodeId={episode.id} />);
    return episode;
  };

  beforeEach(() => vi.clearAllMocks());

  it('hands in the cut once every scene is generated, then returns to the workspace', async () => {
    const episode = openStudio('IN_PRODUCTION');

    fireEvent.click(screen.getByRole('button', { name: 'Gửi bản dựng' }));
    const confirm = screen.getAllByRole('button', { name: 'Gửi bản dựng' }).at(-1)!;
    fireEvent.click(confirm);

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/creator'));
    expect(actions.submitEpisodePackage).toHaveBeenCalledWith(episode.id);
  });

  it('holds the submission until every scene is generated', () => {
    openStudio('IN_PRODUCTION', { jobs: produced.jobs.map((j, i) => (i === 0 ? { ...j, status: 'pending' } : j)) });
    expect(screen.getByRole('button', { name: 'Gửi bản dựng' })).toBeDisabled();
  });

  it('regenerates a scene the Reviewer sent back', () => {
    const episode = openStudio('CUT_CHANGES_REQUESTED');
    fireEvent.click(screen.getAllByRole('button', { name: 'Tạo lại' })[0]);
    expect(actions.triggerGenerationJob).toHaveBeenCalledWith(episode.id, episode.jobs[0].id);
  });

  it.each([
    ['EPISODE_SUBMITTED', 'đang chờ Reviewer'],
    ['COMPLIANCE_PASSED', 'đã được duyệt'],
    ['PUBLISHED', 'đã phát hành'],
  ] as const)('locks a %s episode so its cut is not replaced', (status, reason) => {
    openStudio(status);
    expect(screen.getByRole('status')).toHaveTextContent(reason);
    expect(screen.getByRole('button', { name: 'Gửi bản dựng' })).toBeDisabled();
    // Nothing regenerates: the timeline offers no action and the panel's button is off.
    expect(screen.getAllByRole('button', { name: 'Tạo lại' }).every((b) => b.hasAttribute('disabled'))).toBe(true);
    expect(screen.getByRole('button', { name: /Thêm mục/ })).toBeDisabled();
  });
});
