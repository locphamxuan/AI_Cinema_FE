/**
 * Maps backend generation jobs onto the Studio's scene rows. Each scene of the
 * plan is one row; each of its (latest-attempt) jobs is one generation step.
 * Draft steps the Creator has not generated yet only live in the store.
 */

import type {
  EpisodePackage,
  GeneratedAsset,
  GenerationFunctionType,
  GenerationJob,
  GenerationStep,
  JobStatus,
} from '@/types/workflow';
import type { ApiGenerationJob, AssetType, GenerationJobStatus, GenerationJobType } from '@/types/workflow-api';

const DRAFT_PREFIX = 'draft-';

export const JOB_TYPE_OF: Record<GenerationFunctionType, GenerationJobType> = {
  VIDEO: 'SCENE_VIDEO',
  IMAGE: 'SCENE_IMAGE',
  SCRIPT_VOICE: 'VOICE',
  AUDIO_MUSIC: 'BACKGROUND_AUDIO',
  CUSTOM: 'CUSTOM',
};

const FUNCTION_OF: Partial<Record<GenerationJobType, GenerationFunctionType>> = {
  SCENE_VIDEO: 'VIDEO',
  SCENE_IMAGE: 'IMAGE',
  VOICE: 'SCRIPT_VOICE',
  SCRIPT: 'SCRIPT_VOICE',
  BACKGROUND_AUDIO: 'AUDIO_MUSIC',
};

/** The Studio function of a backend job type (anything unlisted is a custom function). */
export const functionTypeOf = (jobType: GenerationJobType): GenerationFunctionType => FUNCTION_OF[jobType] ?? 'CUSTOM';

const STEP_STATUS: Record<GenerationJobStatus, JobStatus> = {
  PENDING: 'pending',
  QUEUED: 'pending',
  RUNNING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'failed',
};

const ASSET_KIND: Record<AssetType, GeneratedAsset['asset_type']> = {
  VIDEO: 'video',
  IMAGE: 'image',
  POSTER: 'image',
  THUMBNAIL: 'image',
  DUB_AUDIO: 'audio',
  BACKGROUND_AUDIO: 'audio',
  SCRIPT: 'text',
  SUBTITLE: 'text',
};

export const draftStepId = () => `${DRAFT_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** A step the Creator is still editing — not yet a backend job. */
export const isDraftStep = (step: Pick<GenerationStep, 'id'>) => step.id.startsWith(DRAFT_PREFIX);

const toNumber = (value: number | string | null | undefined): number | null => (value === null || value === undefined ? null : Number(value));

/** A retried job stays for audit; only the newest attempt of each chain counts. */
export function latestAttempts(jobs: ApiGenerationJob[]): ApiGenerationJob[] {
  const superseded = new Set(jobs.map((j) => j.parentJobId).filter(Boolean));
  return jobs.filter((j) => !superseded.has(j.id) && j.status !== 'CANCELLED');
}

function toStep(job: ApiGenerationJob): GenerationStep {
  return {
    id: job.id,
    function_type: functionTypeOf(job.jobType),
    custom_function: job.customFunction ?? undefined,
    prompt: job.rawPrompt ?? '',
    selected_model: job.aiModel.name,
    status: STEP_STATUS[job.status],
    token_cost: toNumber(job.resourceCost) ?? job.estimatedTokenCost,
    output_duration: toNumber(job.outputDurationSeconds) ?? undefined,
  };
}

function rowStatus(steps: GenerationStep[]): JobStatus {
  const saved = steps.filter((s) => !isDraftStep(s));
  if (saved.some((s) => s.status === 'processing')) return 'processing';
  if (saved.some((s) => s.status === 'failed')) return 'failed';
  if (saved.length > 0 && steps.every((s) => s.status === 'completed')) return 'completed';
  return 'pending';
}

/**
 * Builds the Studio rows of an episode from its scenes and backend jobs,
 * keeping the draft steps of `previous` rows (matched by scene id).
 */
export function buildSceneJobs(
  episode: EpisodePackage,
  apiJobs: ApiGenerationJob[],
  previous: GenerationJob[] = []
): { jobs: GenerationJob[]; assets: GeneratedAsset[] } {
  const latest = latestAttempts(apiJobs);
  const assets: GeneratedAsset[] = [];

  const jobs = episode.brief.scene_breakdown
    .filter((scene) => scene.id)
    .map((scene): GenerationJob => {
      const sceneJobs = latest.filter((j) => j.sceneId === scene.id);
      const drafts = previous.find((row) => row.scene_id === scene.id)?.generation_steps.filter(isDraftStep) ?? [];
      const steps = [...sceneJobs.map(toStep), ...drafts];

      for (const job of sceneJobs) {
        for (const asset of job.generatedAssets) {
          assets.push({
            id: asset.id,
            job_id: scene.id!,
            scene_id: scene.id!,
            asset_type: ASSET_KIND[asset.assetType],
            url: asset.storageKey ?? '',
            duration_seconds: asset.durationSeconds ?? null,
            model: job.aiModel.name,
            prompt: job.rawPrompt ?? '',
            created_at: job.createdAt,
          });
        }
      }

      const completed = steps.filter((s) => s.status === 'completed').length;
      return {
        id: scene.id!,
        episode_id: episode.id,
        scene_id: scene.id!,
        scene_number: scene.scene_number,
        title: scene.title,
        generation_steps: steps,
        status: rowStatus(steps),
        progress: steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0,
        token_cost: steps.reduce((sum, s) => sum + s.token_cost, 0),
        error_message: sceneJobs.find((j) => j.errorMessage)?.errorMessage ?? undefined,
        created_at: sceneJobs.at(-1)?.createdAt ?? episode.created_at,
        updated_at: sceneJobs[0]?.createdAt ?? episode.updated_at,
      };
    });

  // Videos first so a scene's preview shows its clip rather than a still or a voice line.
  assets.sort((a, b) => Number(b.asset_type === 'video') - Number(a.asset_type === 'video'));
  return { jobs, assets };
}
