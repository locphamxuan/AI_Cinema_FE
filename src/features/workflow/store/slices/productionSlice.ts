import type { StateCreator } from 'zustand';
import { GeneratedAsset } from '@/types/workflow';
import type { ProductionSlice, WorkflowStoreState } from '../types';
import { withProjectUpdate } from './projectRoster';

export const createProductionSlice: StateCreator<WorkflowStoreState, [], [], ProductionSlice> = (set, get) => ({
  triggerGenerationJob: async (packageId, jobId) => {
    const pkg = get().getPackage(packageId);
    if (!pkg) return false;

    const job = pkg.jobs.find((j) => j.id === jobId);
    if (!job || job.generation_steps.length === 0) return false;

    // Check token quota
    const currentTokens = pkg.actual_tokens_used;
    const quota = pkg.quota_allocated;
    const cost = job.generation_steps.reduce((sum, s) => sum + s.token_cost, 0);

    if (quota > 0 && currentTokens + cost > quota) {
      alert(`Vượt quá hạn mức Token Quota đã cấp (${currentTokens}/${quota} Tokens, Cần: ${cost})!`);
      return false;
    }

    // Step 1: Set job + every step to processing
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'IN_PRODUCTION',
            jobs: ep.jobs.map((j) =>
              j.id === jobId
                ? {
                    ...j,
                    status: 'processing',
                    progress: 25,
                    generation_steps: j.generation_steps.map((s) => ({ ...s, status: 'processing' })),
                    updated_at: new Date().toISOString(),
                  }
                : j
            ),
          };
        }),
      }))
    );

    // Step 2: Animated progression simulation
    await new Promise((resolve) => setTimeout(resolve, 600));

    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            jobs: ep.jobs.map((j) => (j.id === jobId ? { ...j, progress: 70 } : j)),
          };
        }),
      }))
    );

    await new Promise((resolve) => setTimeout(resolve, 600));

    // Step 3: Complete job + every step, create one output asset for the scene
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
        model: job.generation_steps.map((s) => s.selected_model).join(', '),
        seed: Math.floor(Math.random() * 1000000),
        prompt: job.generation_steps.map((s) => s.prompt).join(' | '),
      },
      created_at: new Date().toISOString(),
    };

    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        consumed_tokens: project.consumed_tokens + cost,
        episodes: project.episodes.map((ep) => {
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
                    token_cost: cost,
                    generation_steps: j.generation_steps.map((s) => ({ ...s, status: 'completed' })),
                    output_asset_id: newAssetId,
                    updated_at: new Date().toISOString(),
                  }
                : j
            ),
            assets: [...ep.assets.filter((a) => a.job_id !== jobId), newAsset],
          };
        }),
      }))
    );

    return true;
  },
});
