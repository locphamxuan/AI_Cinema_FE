import { describe, it, expect } from 'vitest';
import { adaptApiProjectToUiProject } from '@/features/workflow/lib/apiAdapter';
import { apiPackage, apiPlan, apiPlanReview, apiProject } from '@/tests/fixtures/workflowApiFixtures';

const episodeOf = (...args: Parameters<typeof apiPlan>) => adaptApiProjectToUiProject(apiProject([apiPlan(...args)])).episodes[0];

describe('adaptApiProjectToUiProject', () => {
  it('keys each episode by its newest plan version', () => {
    const project = adaptApiProjectToUiProject(
      apiProject([
        apiPlan({ id: 'plan-1-v2', planVersion: 2 }),
        apiPlan({ id: 'plan-1-v1', planVersion: 1 }),
        apiPlan({ id: 'plan-2', episodeNumber: 2 }),
      ])
    );
    expect(project.episodes.map((e) => e.id)).toEqual(['plan-1-v2', 'plan-2']);
  });

  it('reads budget, genres and people from the project', () => {
    const project = adaptApiProjectToUiProject(apiProject([apiPlan()]));
    expect(project.total_budget_tokens).toBe(3000);
    expect(project.allocated_tokens).toBe(500);
    expect(project.genre).toEqual(['Khoa học viễn tưởng']);
    expect(project.creator_name).toBe('Creator Một');
    expect(project.deadline).toBe('2026-12-31');
  });

  it('gives list projects (no plans) no episodes', () => {
    const project = adaptApiProjectToUiProject(apiProject([], { productionPlans: undefined, episodeCount: 3 }));
    expect(project.episodes).toEqual([]);
    expect(project.total_episodes).toBe(3);
  });

  describe('episode state', () => {
    it.each([
      ['DRAFT', 'PLAN_DRAFT'],
      ['SUBMITTED', 'PLAN_PENDING'],
      ['UNDER_REVIEW', 'PLAN_PENDING'],
      ['CHANGES_REQUESTED', 'CHANGES_REQUESTED'],
      ['APPROVED', 'PLAN_PENDING'],
    ] as const)('maps plan status %s to %s', (planStatus, state) => {
      expect(episodeOf({ status: planStatus }).status).toBe(state);
    });

    it('is QUOTA_ALLOCATED once an approved plan has an active quota, IN_PRODUCTION once jobs exist', () => {
      const quota = [{ id: 'q1', allocationType: 'INITIAL' as const, allocatedAmount: '400', remainingAmount: '150', status: 'ACTIVE' as const, createdAt: '' }];
      const allocated = episodeOf({ status: 'APPROVED', quotaAllocations: quota });
      expect(allocated.status).toBe('QUOTA_ALLOCATED');
      expect(allocated.quota_allocated).toBe(400);
      expect(allocated.actual_tokens_used).toBe(250);

      expect(episodeOf({ status: 'APPROVED', quotaAllocations: quota, _count: { generationJobs: 2 } }).status).toBe('IN_PRODUCTION');
    });

    it('follows the latest package through submission, content review, compliance and publication', () => {
      const withPackage = (pkg: ReturnType<typeof apiPackage>) => episodeOf({ status: 'APPROVED', episodePackages: [pkg] });
      const pass = (checkType: 'CONTENT_POLICY' | 'LEGAL') => ({ id: checkType, checkType, result: 'PASS' as const, checkedAt: null });
      const review = (status: 'APPROVED' | 'CHANGES_REQUESTED') => ({ id: 'r1', status, decidedAt: null, createdAt: '' });

      expect(withPackage(apiPackage()).status).toBe('EPISODE_SUBMITTED');
      expect(withPackage(apiPackage({ reviews: [review('CHANGES_REQUESTED')] })).status).toBe('CHANGES_REQUESTED');
      expect(withPackage(apiPackage({ complianceChecks: [pass('CONTENT_POLICY'), { ...pass('LEGAL'), result: 'FAIL' }] })).status).toBe('EPISODE_SUBMITTED');
      expect(withPackage(apiPackage({ complianceChecks: [pass('CONTENT_POLICY'), pass('LEGAL')] })).status).toBe('COMPLIANCE_PASSED');

      const published = withPackage(apiPackage({ currentForEpisode: { id: 'episode-9', productionStatus: 'PUBLISHED', publications: [] } }));
      expect(published.status).toBe('PUBLISHED');
      expect(published.package_id).toBe('package-1');
      expect(published.catalog_episode_id).toBe('episode-9');
    });
  });

  describe('field reviews (BR-39)', () => {
    it('shows the latest verdict of every scene and plan field, with its review row', () => {
      const brief = episodeOf({
        status: 'UNDER_REVIEW',
        planReviews: [
          apiPlanReview('SCENE', { id: 'old', sceneId: 'scene-1', status: 'CHANGES_REQUESTED', decidedAt: 'x' }),
          apiPlanReview('SCENE', { id: 'new', sceneId: 'scene-1', status: 'APPROVED', decidedAt: 'x' }),
          apiPlanReview('SCENE', { sceneId: 'scene-2' }),
          apiPlanReview('TOKEN_ESTIMATE', { status: 'CHANGES_REQUESTED', rejectionReason: 'Vượt ngân sách' }),
          apiPlanReview('OVERALL_SCRIPT', { status: 'APPROVED' }),
        ],
      }).brief;

      expect(brief.scene_reviews[0]).toMatchObject({ scene_number: 1, status: 'approved', review_id: 'new' });
      expect(brief.scene_reviews[1]).toMatchObject({ scene_number: 2, status: 'pending', review_id: 'review-SCENE-scene-2' });
      expect(brief.token_review).toMatchObject({ status: 'changes_requested', comment: 'Vượt ngân sách' });
      expect(brief.script_review?.status).toBe('approved');
      expect(brief.duration_review).toEqual({ status: 'pending' });
    });

    it('drops old verdicts once the plan is resubmitted, before a new round opens', () => {
      const brief = episodeOf({
        status: 'SUBMITTED',
        planReviews: [apiPlanReview('DURATION', { status: 'APPROVED', decidedAt: 'x' })],
      }).brief;
      expect(brief.duration_review).toEqual({ status: 'pending' });
    });
  });
});

describe('seasons and allotted durations', () => {
  const project = adaptApiProjectToUiProject(
    apiProject([
      apiPlan({ id: 's2e1', episodeNumber: 3, seasonNumber: 2, seasonEpisodeNumber: 1, allottedDurationSeconds: 1500 }),
      apiPlan({ id: 's1e2', episodeNumber: 2, seasonNumber: 1, seasonEpisodeNumber: 2, allottedDurationSeconds: 1200, targetDurationSeconds: 900 }),
      apiPlan({ id: 's1e1', episodeNumber: 1, seasonNumber: 1, seasonEpisodeNumber: 1 }),
    ])
  );

  it('orders episodes by season, numbers them inside it and names the season in titles', () => {
    expect(project.season_count).toBe(2);
    expect(project.episodes.map((e) => [e.id, e.season_number, e.episode_number])).toEqual([
      ['s1e1', 1, 1],
      ['s1e2', 1, 2],
      ['s2e1', 2, 1],
    ]);
    expect(project.episodes[2].title).toBe('Mùa 2 · Tập 1: Saigon 2077');
  });

  it("compares the Creator's proposed duration against the Reviewer's allotted one", () => {
    const episode = project.episodes[1];
    expect(episode.target_duration_minutes).toBe(20);
    expect(episode.brief.target_duration_minutes).toBe(15);
  });
});
