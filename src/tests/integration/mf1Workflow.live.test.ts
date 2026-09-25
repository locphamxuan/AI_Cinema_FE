/**
 * MF-1 end to end through the workspace store, against a running backend.
 * Opt-in: it only runs with MF1_LIVE_API set, e.g.
 *   MF1_LIVE_API=http://localhost:3001/api npx vitest run src/tests/integration/mf1Workflow.live.test.ts
 * Every step calls the same store action the screens call, so a wrong call
 * order or payload fails here even when the mocked unit tests pass.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

const API = process.env.MF1_LIVE_API;
const PASSWORD = process.env.MF1_LIVE_PASSWORD ?? 'Aicinema@123';
const CREATOR = process.env.MF1_LIVE_CREATOR ?? 'creator01@aicinema.com';
const REVIEWER = process.env.MF1_LIVE_REVIEWER ?? 'reviewer01@aicinema.com';

vi.mock('@/components/ui/Toast', () => ({
  toast: {
    error: (title: string, message?: string) => console.error(`[toast] ${title}: ${message ?? ''}`),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe.skipIf(!API)('MF-1 workflow against the live API', () => {
  type Store = typeof import('@/store/useWorkflowStore')['useWorkflowStore'];
  let store: Store;
  let signIn: (email: string) => Promise<void>;
  let episodeId = '';
  const title = `Live MF-1 ${Date.now().toString(36)}`;
  const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

  const state = () => store.getState();
  const episode = () => state().getPackage(episodeId)!;
  const reload = () => state().loadProject(state().activeProjectId);

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_API_URL = API;
    vi.resetModules();
    ({ useWorkflowStore: store } = await import('@/store/useWorkflowStore'));
    const { authService } = await import('@/services/authService');
    signIn = async (email) => {
      const res = await authService.login({ email, password: PASSWORD });
      if (!res.success) throw new Error(`Login of ${email} failed: ${res.message}`);
    };
  });

  it('lets the Reviewer create a project for the Creator', async () => {
    await signIn(REVIEWER);
    const { workflowService } = await import('@/services/workflowService');
    const creators = await workflowService.listUsers('CONTENT_CREATOR');
    const genres = await workflowService.listGenres();
    const creator = creators.data.data.find((u) => u.email === CREATOR)!;

    const created = await state().createProject({
      title,
      creator_id: creator.id,
      genre_ids: [genres.data.data[0].id],
      subtitle_languages: ['vi', 'en'],
      synopsis: 'Kiểm thử MF-1 với API thật',
      episodes: [
        { season_number: 1, duration_minutes: 10 },
        { season_number: 1, duration_minutes: 10 },
        { season_number: 1, duration_minutes: 10 },
      ],
      total_budget_tokens: 5000,
      production_start_date: day(0),
      deadline: day(60),
      planned_release_date: day(90),
      milestones: [{ id: 'm-1', title: 'Kịch bản', startDate: day(0), deadline: day(20), status: 'pending' }],
    });
    expect(created).toBe(true);
    episodeId = state().project.episodes[0].id;
    expect(episode().status).toBe('PLAN_DRAFT');
  });

  it('lets the Creator plan scenes and submit the plan', async () => {
    await signIn(CREATOR);
    await reload();
    state().updateContentBrief(episodeId, {
      script_text: 'Kịch bản tập 1',
      target_duration_minutes: 8,
      estimated_tokens: 400,
      scene_breakdown: [1, 2].map((n) => ({
        scene_number: n,
        title: `Cảnh ${n}`,
        description: `Mô tả cảnh ${n}`,
        target_duration_sec: 120,
        estimated_tokens: 200,
      })),
    });
    expect(await state().submitProductionPlan(episodeId)).toBe(true);
    expect(episode().status).toBe('PLAN_PENDING');
  });

  it('lets the Reviewer approve every field and grant the quota', async () => {
    await signIn(REVIEWER);
    await reload();
    for (const field of ['script', 'duration', 'token'] as const) {
      expect(await state().reviewPlanField(episodeId, field, 'approved')).toBe(true);
    }
    for (const scene of episode().brief.scene_breakdown) {
      expect(await state().reviewScene(episodeId, scene.scene_number, 'approved')).toBe(true);
    }
    expect(await state().allocateQuota(episodeId, 800)).toBe(true);
    expect(episode()).toMatchObject({ status: 'QUOTA_ALLOCATED', quota_allocated: 800 });
  });

  it('lets the Creator generate every scene, top up the quota and hand in the cut', async () => {
    await signIn(CREATOR);
    await reload();
    await state().loadJobs(episodeId);
    for (const row of state().getJobs(episodeId)) {
      state().addGenerationStep(episodeId, row.id, {
        function_type: 'VIDEO',
        prompt: 'Rượt đuổi dưới mưa neon',
        status: 'pending',
        selected_model: '',
        token_cost: 0,
      });
      expect(await state().triggerGenerationJob(episodeId, row.id)).toBe(true);
    }

    expect(await state().requestQuota(episodeId, 300, 'Cần sinh lại cảnh 2')).toBe(true);
    await signIn(REVIEWER);
    await reload();
    const request = episode().quota_requests.find((r) => r.status === 'pending')!;
    expect(await state().approveQuotaRequest(request.id, 200, 'Cấp một phần')).toBe(true);
    expect(episode().quota_allocated).toBe(1000);

    await signIn(CREATOR);
    await reload();
    expect(await state().submitEpisodePackage(episodeId)).toBe(true);
    expect(episode().status).toBe('EPISODE_SUBMITTED');
  });

  it('lets the Reviewer send the cut back and the Creator hand in a new one', async () => {
    await signIn(REVIEWER);
    await reload();
    expect(await state().requestContentChanges(episodeId, 'Cảnh 2 thiếu sáng')).toBe(true);
    expect(episode().status).toBe('CUT_CHANGES_REQUESTED');

    await signIn(CREATOR);
    await reload();
    await state().loadJobs(episodeId);
    const [first] = state().getJobs(episodeId);
    expect(await state().triggerGenerationJob(episodeId, first.id)).toBe(true);
    expect(await state().submitEpisodePackage(episodeId)).toBe(true);
    expect(episode().status).toBe('EPISODE_SUBMITTED');
  });

  it('lets the Reviewer pass compliance and publish the episode', async () => {
    await signIn(REVIEWER);
    await reload();
    const checks = { CONTENT_POLICY: true, LEGAL: true, COPYRIGHT: true, WATERMARK: true, REAL_PERSON_LIKENESS: true };
    expect(await state().passCompliance(episodeId, checks, 'INTRO_OUTRO')).toBe(true);
    expect(episode()).toMatchObject({ status: 'COMPLIANCE_PASSED', is_labelled: true, is_compliant: true });

    expect(await state().publishEpisode(episodeId)).toBe(true);
    expect(episode().status).toBe('PUBLISHED');
  });

  it('lets the Creator complete a milestone with its result', async () => {
    await signIn(CREATOR);
    await reload();
    const [milestone] = state().project.milestones ?? [];
    expect(await state().updateMilestoneStatus(milestone.id, 'completed', 'Xong kịch bản')).toBe(true);
    expect(state().project.milestones?.[0]).toMatchObject({ status: 'completed', result: 'Xong kịch bản' });
  });
});
