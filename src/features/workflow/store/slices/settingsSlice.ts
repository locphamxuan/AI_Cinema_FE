import type { StateCreator } from 'zustand';
import { workflowService } from '@/services/workflowService';
import { DEFAULT_MAX_EPISODE_MINUTES } from '@/features/workflow/lib/limits';
import type { SettingsSlice, WorkflowStoreState } from '../types';
import { apiResult } from './apiResult';

const toMinutes = (seconds: number | null) => (seconds === null ? null : Math.floor(seconds / 60));

export const createSettingsSlice: StateCreator<WorkflowStoreState, [], [], SettingsSlice> = (set) => ({
  maxEpisodeMinutes: DEFAULT_MAX_EPISODE_MINUTES,

  loadPlatformSettings: async () => {
    const res = await workflowService.getPlatformSettings();
    // Keep the default when the settings cannot be read; the backend still enforces its own limit.
    if (res.success) set({ maxEpisodeMinutes: toMinutes(res.data.maxEpisodeDurationSeconds) });
  },

  savePlatformSettings: async (maxEpisodeMinutes) => {
    const saved = await apiResult(
      workflowService.updatePlatformSettings({ maxEpisodeDurationSeconds: maxEpisodeMinutes === null ? null : maxEpisodeMinutes * 60 }),
      'Không lưu được cài đặt'
    );
    if (!saved) return false;
    set({ maxEpisodeMinutes: toMinutes(saved.maxEpisodeDurationSeconds) });
    return true;
  },
});
