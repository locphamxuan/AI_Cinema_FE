import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { api, fail, ok, resetWorkflowStore } from '@/tests/support/workflowStoreHarness';

vi.mock('@/services/workflowService', () => import('@/tests/support/workflowServiceMock'));

describe('Workflow store — platform settings', () => {
  beforeEach(resetWorkflowStore);

  it('reads the episode limit in minutes, null meaning no limit', async () => {
    api.getPlatformSettings.mockReturnValueOnce(ok({ maxEpisodeDurationSeconds: 2700, updatedAt: null }));
    await useWorkflowStore.getState().loadPlatformSettings();
    expect(useWorkflowStore.getState().maxEpisodeMinutes).toBe(45);

    api.getPlatformSettings.mockReturnValueOnce(ok({ maxEpisodeDurationSeconds: null, updatedAt: null }));
    await useWorkflowStore.getState().loadPlatformSettings();
    expect(useWorkflowStore.getState().maxEpisodeMinutes).toBeNull();
  });

  it('saves the Admin limit in seconds and keeps the old one when refused', async () => {
    useWorkflowStore.setState({ maxEpisodeMinutes: 60 });
    api.updatePlatformSettings.mockReturnValueOnce(ok({ maxEpisodeDurationSeconds: 5400, updatedAt: null }));

    expect(await useWorkflowStore.getState().savePlatformSettings(90)).toBe(true);
    expect(api.updatePlatformSettings).toHaveBeenCalledWith({ maxEpisodeDurationSeconds: 5400 });
    expect(useWorkflowStore.getState().maxEpisodeMinutes).toBe(90);

    api.updatePlatformSettings.mockReturnValueOnce(fail('Forbidden resource'));
    expect(await useWorkflowStore.getState().savePlatformSettings(null)).toBe(false);
    expect(useWorkflowStore.getState().maxEpisodeMinutes).toBe(90);
  });
});
