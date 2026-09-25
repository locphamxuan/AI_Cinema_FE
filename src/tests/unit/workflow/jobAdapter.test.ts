import { describe, it, expect } from 'vitest';
import { adaptApiProjectToUiProject } from '@/features/workflow/lib/apiAdapter';
import { buildSceneJobs, isDraftStep, latestAttempts } from '@/features/workflow/lib/jobAdapter';
import { apiJob, apiPlan, apiProject } from '@/tests/fixtures/workflowApiFixtures';

const episode = adaptApiProjectToUiProject(apiProject([apiPlan({ status: 'APPROVED' })])).episodes[0];

describe('jobAdapter', () => {
  it('gives every scene of the plan a row, even before any job exists', () => {
    const { jobs } = buildSceneJobs(episode, []);
    expect(jobs.map((j) => [j.id, j.scene_number, j.status])).toEqual([
      ['scene-1', 1, 'pending'],
      ['scene-2', 2, 'pending'],
    ]);
  });

  it('keeps only the newest attempt of a retried job and drops cancelled ones', () => {
    const jobs = [
      apiJob('a1', 'scene-1', { status: 'FAILED' }),
      apiJob('a2', 'scene-1', { parentJobId: 'a1' }),
      apiJob('c1', 'scene-1', { status: 'CANCELLED' }),
    ];
    expect(latestAttempts(jobs).map((j) => j.id)).toEqual(['a2']);
  });

  it('maps jobs to read-only steps with the actual cost, and their outputs to scene assets', () => {
    const { jobs, assets } = buildSceneJobs(episode, [
      apiJob('j1', 'scene-1', { jobType: 'VOICE', generatedAssets: [{ id: 'voice', assetType: 'DUB_AUDIO', durationSeconds: 4 }] }),
      apiJob('j2', 'scene-1'),
    ]);
    const row = jobs[0];

    expect(row.status).toBe('completed');
    expect(row.token_cost).toBe(90);
    expect(row.generation_steps.map((s) => [s.function_type, s.selected_model, isDraftStep(s)])).toEqual([
      ['SCRIPT_VOICE', 'Veo 3', false],
      ['VIDEO', 'Veo 3', false],
    ]);
    // Videos first so the scene preview shows the clip.
    expect(assets.map((a) => [a.id, a.asset_type, a.job_id])).toEqual([
      ['asset-j2', 'video', 'scene-1'],
      ['voice', 'audio', 'scene-1'],
    ]);
  });

  it('marks a scene failed or processing from its saved steps, keeping drafts pending', () => {
    const previous = buildSceneJobs(episode, []).jobs.map((row) =>
      row.id === 'scene-2'
        ? { ...row, generation_steps: [{ id: 'draft-1', function_type: 'VIDEO' as const, prompt: 'x', selected_model: '', status: 'pending' as const, token_cost: 10 }] }
        : row
    );
    const { jobs } = buildSceneJobs(episode, [apiJob('f', 'scene-1', { status: 'FAILED', errorMessage: 'timeout' }), apiJob('r', 'scene-2', { status: 'RUNNING' })], previous);

    expect(jobs[0]).toMatchObject({ status: 'failed', error_message: 'timeout' });
    expect(jobs[1].status).toBe('processing');
    expect(jobs[1].generation_steps.map((s) => s.id)).toEqual(['r', 'draft-1']);
  });
});
