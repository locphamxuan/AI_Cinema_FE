import type { StateCreator } from 'zustand';
import { GeneratedAsset } from '@/types/workflow';
import type { ProductionSlice, WorkflowStoreState } from '../types';
import { toast } from '@/components/ui/Toast';

export const createProductionSlice: StateCreator<WorkflowStoreState, [], [], ProductionSlice> = (set, get) => ({
  triggerGenerationJob: async (packageId, jobId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return false;

    const job = pkg.jobs.find((j) => j.id === jobId);
    if (!job) return false;

    // Check token quota
    const currentTokens = pkg.actual_tokens_used;
    const quota = pkg.quota_allocated;
    const cost = job.token_cost;

    if (quota > 0 && currentTokens + cost > quota) {
      toast.error(
        'Vượt quá hạn mức Token Quota!',
        `Đã dùng ${currentTokens}/${quota} Tokens, cần thêm ${cost} Tokens. Vui lòng xin cấp thêm Quota.`
      );
      return false;
    }

    // Step 1: Set to processing
    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'IN_PRODUCTION',
            jobs: ep.jobs.map((j) =>
              j.id === jobId ? { ...j, status: 'processing', progress: 25, updated_at: new Date().toISOString() } : j
            ),
          };
        }),
      },
    }));

    // Step 2: Animated progression simulation
    await new Promise((resolve) => setTimeout(resolve, 600));

    set((state) => ({
      project: {
        ...state.project,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.map((j) => (j.id === jobId ? { ...j, progress: 70 } : j)),
          };
        }),
      },
    }));

    await new Promise((resolve) => setTimeout(resolve, 600));

    // Step 3: Complete job and create output asset
    const newAssetId = `asset-${Date.now()}`;
    const newAsset: GeneratedAsset = {
      id: newAssetId,
      job_id: jobId,
      scene_id: job.scene_id,
      asset_type: 'video',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      duration_seconds: 20,
      resolution: '3840x2160 (4K)',
      file_size_mb: 78.5,
      metadata: {
        fps: 60,
        codec: 'H.265 / HEVC',
        model: job.ai_model,
        seed: Math.floor(Math.random() * 1000000),
        prompt: job.prompt_video,
      },
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      project: {
        ...state.project,
        consumed_tokens: state.project.consumed_tokens + cost,
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'IN_PRODUCTION',
            actual_tokens_used: ep.actual_tokens_used + cost,
            jobs: ep.jobs.map((j) =>
              j.id === jobId
                ? {
                    ...j,
                    status: 'completed',
                    progress: 100,
                    output_asset_id: newAssetId,
                    updated_at: new Date().toISOString(),
                  }
                : j
            ),
            assets: [...ep.assets.filter((a) => a.job_id !== jobId), newAsset],
          };
        }),
      },
    }));

    return true;
  },
});
