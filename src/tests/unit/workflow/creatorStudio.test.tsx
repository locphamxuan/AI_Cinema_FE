import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreatorStudioPage } from '@/features/workflow/components/creator/studio/CreatorStudioPage';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { initialProject } from '@/tests/fixtures/workflowFixtures';
import type { EpisodePackage, WorkflowState } from '@/types/workflow';
import { api, ok } from '@/tests/support/workflowStoreHarness';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/features/workflow/components/shared/ClipVideo', () => ({ ClipVideo: () => null }));
vi.mock('@/services/workflowService', () => import('@/tests/support/workflowServiceMock'));

const NO_ADVICE = { source: 'rules' as const, summary: 'Cảnh đã đủ.', gaps: [], suggestions: [], previousScene: null, nextScene: null };

const produced = initialProject.episodes.find((e) => e.status === 'EPISODE_SUBMITTED')!;

describe('CreatorStudioPage', () => {
  const actions = {
    loadRouting: vi.fn(),
    loadProjects: vi.fn(),
    loadJobs: vi.fn(),
    setActivePackage: vi.fn(),
    triggerGenerationJob: vi.fn().mockResolvedValue(true),
    regenerateStep: vi.fn().mockResolvedValue(true),
    discardStep: vi.fn().mockResolvedValue(true),
    updateSceneDirection: vi.fn().mockResolvedValue(true),
    resetScene: vi.fn().mockResolvedValue(true),
    addGenerationStep: vi.fn(),
    submitEpisodePackage: vi.fn().mockResolvedValue(true),
  };

  const openStudio = (status: WorkflowState, overrides: Partial<EpisodePackage> = {}) => {
    const episode = { ...produced, status, ...overrides };
    useWorkflowStore.setState({ project: { ...initialProject, episodes: [episode] }, routing: [], ...actions });
    render(<CreatorStudioPage episodeId={episode.id} />);
    return episode;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getSceneAdvice.mockReturnValue(ok({ ...NO_ADVICE }));
    api.getPlanContinuity.mockReturnValue(ok({ source: 'rules', summary: 'Các cảnh nối tiếp nhau hợp lý.', scenes: [] }));
  });

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

  describe('a generated step', () => {
    const openWithGeneratedStep = (overrides: Partial<EpisodePackage> = {}) =>
      openStudio('IN_PRODUCTION', {
        jobs: [
          {
            ...produced.jobs[0],
            generation_steps: [{ id: 'job-9', function_type: 'VIDEO', prompt: 'Toàn cảnh cũ', selected_model: 'ltx-video', status: 'completed', token_cost: 108 }],
          },
        ],
        ...overrides,
      });

    it('is regenerated with the revised prompt', async () => {
      const episode = openWithGeneratedStep();
      fireEvent.click(screen.getByRole('button', { name: 'Sửa mô tả mục này' }));
      fireEvent.change(screen.getByRole('textbox', { name: 'Mô tả mới cho mục này' }), { target: { value: 'Cận cảnh mới' } });
      fireEvent.click(screen.getByRole('button', { name: 'Lưu và tạo lại' }));

      await vi.waitFor(() => expect(actions.regenerateStep).toHaveBeenCalledWith(episode.id, episode.jobs[0].id, 'job-9', 'Cận cảnh mới'));
    });

    it('is removed only after the Creator confirms', async () => {
      const episode = openWithGeneratedStep();
      fireEvent.click(screen.getByRole('button', { name: 'Xóa mục này' }));
      expect(actions.discardStep).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Xóa' }));

      await vi.waitFor(() => expect(actions.discardStep).toHaveBeenCalledWith(episode.id, episode.jobs[0].id, 'job-9'));
    });

    it('is not regenerated when the episode is out of tokens', () => {
      openWithGeneratedStep({ quota_allocated: 200, actual_tokens_used: 200 });
      expect(screen.getByRole('alert')).toHaveTextContent('xin thêm');
      expect(screen.getAllByRole('button', { name: 'Tạo lại' }).at(-1)).toBeDisabled();
    });
  });

  describe('the selected scene', () => {
    it('can be retitled and redescribed', async () => {
      const episode = openStudio('IN_PRODUCTION');
      fireEvent.click(screen.getByRole('button', { name: /Sửa cảnh/ }));
      fireEvent.change(screen.getByRole('textbox', { name: 'Tên cảnh' }), { target: { value: 'Chợ sớm' } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Mô tả cảnh' }), { target: { value: 'Sương phủ chợ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Lưu cảnh' }));

      await vi.waitFor(() =>
        expect(actions.updateSceneDirection).toHaveBeenCalledWith(episode.jobs[0].scene_id, { title: 'Chợ sớm', description: 'Sương phủ chợ' })
      );
    });

    it('is started over only after the Creator confirms', async () => {
      const episode = openStudio('IN_PRODUCTION');
      fireEvent.click(screen.getByRole('button', { name: 'Làm lại cảnh' }));
      expect(actions.resetScene).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Xác nhận làm lại' }));

      await vi.waitFor(() => expect(actions.resetScene).toHaveBeenCalledWith(episode.jobs[0].scene_id));
    });

    it('shows what it lacks and adds a suggested prompt as a draft', async () => {
      api.getSceneAdvice.mockReturnValue(
        ok({
          ...NO_ADVICE,
          source: 'ai',
          summary: 'Cảnh còn thiếu âm thanh.',
          gaps: [
            { aspect: 'audio', message: 'Cảnh chưa có âm thanh nền hoặc nhạc.' },
            { aspect: 'continuity', message: 'Cảnh 1 ban ngày nhưng cảnh này ban đêm.' },
          ],
          suggestions: [{ jobType: 'BACKGROUND_AUDIO', title: 'Âm thanh nền', reason: 'r', prompt: 'Tiếng mưa rơi trên mái tôn' }],
          nextScene: { number: 2, title: 'Chợ quê' },
        })
      );
      const episode = openStudio('IN_PRODUCTION');

      expect(await screen.findByText('Dẫn vào cảnh 2: Chợ quê')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('tab', { name: /Gợi ý/ }));
      expect(screen.getByText('Thiếu: Âm thanh')).toBeInTheDocument();
      expect(screen.getByText('Cảnh 1 ban ngày nhưng cảnh này ban đêm.')).toBeInTheDocument();
      expect(api.getSceneAdvice).toHaveBeenCalledWith(episode.jobs[0].scene_id);
      fireEvent.click(screen.getByRole('button', { name: /Thêm vào cảnh/ }));
      expect(actions.addGenerationStep).toHaveBeenCalledWith(
        episode.id,
        episode.jobs[0].id,
        expect.objectContaining({ function_type: 'AUDIO_MUSIC', prompt: 'Tiếng mưa rơi trên mái tôn' })
      );
      // Adding goes back to the item list so the new draft can be checked.
      expect(screen.getByRole('tab', { name: /Mục/ })).toHaveAttribute('aria-selected', 'true');
    });

    it('flags the scenes that do not cut together in the scene list', async () => {
      const episode = openStudio('IN_PRODUCTION');
      api.getPlanContinuity.mockReturnValue(
        ok({
          source: 'ai',
          summary: 'Cảnh 2 đổi thời gian đột ngột.',
          scenes: [{ sceneId: episode.jobs[1].scene_id, sceneNumber: 2, issues: ['Cảnh 1 ban ngày nhưng cảnh này ban đêm.'] }],
        })
      );
      fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra lại liên kết các cảnh' }));

      expect(await screen.findByText(/1 chỗ các cảnh chưa khớp nhau/)).toBeInTheDocument();
      expect(screen.getByText('Cảnh 1 ban ngày nhưng cảnh này ban đêm.')).toBeInTheDocument();
    });
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
