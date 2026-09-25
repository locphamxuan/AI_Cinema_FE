import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReviewerAuditPage } from '@/features/workflow/components/reviewer/audit/ReviewerAuditPage';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { initialProject } from '@/tests/fixtures/workflowFixtures';
import type { WorkflowState } from '@/types/workflow';

vi.mock('@/features/workflow/components/shared/ClipVideo', () => ({ ClipVideo: () => null }));

const submitted = initialProject.episodes.find((e) => e.status === 'EPISODE_SUBMITTED')!;

describe('ReviewerAuditPage', () => {
  const actions = {
    loadProjects: vi.fn(),
    passCompliance: vi.fn().mockResolvedValue(true),
    publishEpisode: vi.fn().mockResolvedValue(true),
    requestContentChanges: vi.fn().mockResolvedValue(true),
  };

  const openAudit = (status: WorkflowState) => {
    const episode = { ...submitted, status };
    useWorkflowStore.setState({ project: { ...initialProject, episodes: [episode] }, ...actions });
    render(<ReviewerAuditPage packageId={episode.id} />);
    return episode;
  };

  beforeEach(() => vi.clearAllMocks());

  it('confirms compliance on a submitted cut with the label shown at intro and outro', () => {
    const episode = openAudit('EPISODE_SUBMITTED');
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đạt chuẩn' }));

    const [id, checks, location] = actions.passCompliance.mock.calls[0];
    expect(id).toBe(episode.id);
    expect(Object.values(checks).every(Boolean)).toBe(true);
    expect(location).toBe('INTRO_OUTRO');
  });

  it('confirms nothing while a manual check is unticked — the cut goes back instead', async () => {
    const episode = openAudit('EPISODE_SUBMITTED');
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByRole('button', { name: 'Xác nhận đạt chuẩn' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Yêu cầu sửa' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Cảnh 2 thiếu sáng' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi phản hồi' }));
    await vi.waitFor(() => expect(actions.requestContentChanges).toHaveBeenCalledWith(episode.id, 'Cảnh 2 thiếu sáng'));
  });

  it.each(['CUT_CHANGES_REQUESTED', 'IN_PRODUCTION'] as const)('decides nothing on a %s episode', (status) => {
    openAudit(status);
    expect(screen.queryByRole('button', { name: 'Yêu cầu sửa' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Xác nhận đạt chuẩn' })).toBeDisabled();
  });

  it('publishes an approved cut', async () => {
    const episode = openAudit('COMPLIANCE_PASSED');
    expect(screen.getByRole('button', { name: 'Đã xác nhận đạt chuẩn' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Phát hành/ }));
    await vi.waitFor(() => expect(actions.publishEpisode).toHaveBeenCalledWith(episode.id, expect.any(String)));
  });
});
