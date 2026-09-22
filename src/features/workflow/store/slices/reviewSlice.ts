import type { StateCreator } from 'zustand';
import { ReviewLog } from '@/types/workflow';
import { initialReviews } from '@/features/workflow/mocks/workflowMock';
import type { ReviewSlice, WorkflowStoreState } from '../types';
import { availableBudget } from '@/features/workflow/lib/planVerdict';
import { withProjectUpdate } from './projectRoster';
import { workflowService } from '@/services/workflowService';

export const createReviewSlice: StateCreator<WorkflowStoreState, [], [], ReviewSlice> = (set, get) => ({
  reviews: initialReviews,

  reviewScene: (packageId, sceneNumber, status, comment) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          const scene_reviews = ep.brief.scene_reviews.map((sr) =>
            sr.scene_number === sceneNumber ? { ...sr, status, comment } : sr
          );
          return { ...ep, brief: { ...ep.brief, scene_reviews, updated_at: new Date().toISOString() } };
        }),
      }))
    );
  },

  reviewPlanField: (packageId, field, status, comment) => {
    const verdict = { status, comment };
    set((state) =>
      withProjectUpdate(state, (project) => {
        if (field === 'script') return { ...project, script_review: verdict };
        const key = field === 'duration' ? 'duration_review' : 'token_review';
        return {
          ...project,
          episodes: project.episodes.map((ep) =>
            ep.id === packageId ? { ...ep, brief: { ...ep.brief, [key]: verdict, updated_at: new Date().toISOString() } } : ep
          ),
        };
      })
    );
  },

  requestPlanChanges: (packageId, feedbackNotes) => {
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo',
      review_type: 'plan',
      decision: 'changes_requested',
      feedback_notes: feedbackNotes,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      ...withProjectUpdate(state, (project) => ({
        ...project,
        overall_status: 'CHANGES_REQUESTED',
        updated_at: new Date().toISOString(),
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'CHANGES_REQUESTED',
            brief: {
              ...ep.brief,
              status: 'CHANGES_REQUESTED',
              updated_at: new Date().toISOString(),
            },
          };
        }),
      })),
    }));
  },

  allocateQuota: (packageId, requestedQuota, notes) => {
    const currentPkg = get().project.episodes.find((e) => e.id === packageId);
    const existingQuota = currentPkg?.quota_allocated || 0;
    const avail = availableBudget(get().project);
    const maxAllowed = avail + existingQuota;
    const tokenQuota = Math.min(requestedQuota, maxAllowed);
    if (tokenQuota <= 0) return;

    // Call backend API in background
    workflowService.createQuotaAllocation(packageId, {
      allocationType: 'INITIAL',
      allocatedAmount: tokenQuota,
      allocatedById: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
    }).catch((e) => console.warn('Allocate quota API call:', e));

    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo',
      review_type: 'plan',
      decision: 'approved',
      feedback_notes: `Kế hoạch được duyệt. Đã cấp ${tokenQuota} token. ${notes || ''}`.trim(),
      quota_granted: tokenQuota,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      ...withProjectUpdate(state, (project) => {
        const nextEpisodes = project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'QUOTA_ALLOCATED' as const,
            quota_allocated: tokenQuota,
            brief: {
              ...ep.brief,
              status: 'QUOTA_ALLOCATED' as const,
              updated_at: new Date().toISOString(),
            },
          };
        });
        const totalAllocated = nextEpisodes.reduce((sum, ep) => sum + (ep.quota_allocated || 0), 0);

        return {
          ...project,
          allocated_tokens: totalAllocated,
          overall_status: 'IN_PROGRESS',
          updated_at: new Date().toISOString(),
          episodes: nextEpisodes,
        };
      }),
    }));
  },

  requestContentChanges: (packageId, feedbackNotes) => {
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo',
      review_type: 'content',
      decision: 'changes_requested',
      feedback_notes: feedbackNotes,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      ...withProjectUpdate(state, (project) => ({
        ...project,
        overall_status: 'CHANGES_REQUESTED',
        updated_at: new Date().toISOString(),
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'CHANGES_REQUESTED',
            updated_at: new Date().toISOString(),
          };
        }),
      })),
    }));
  },

  approveContent: (packageId) => {
    set((state) =>
      withProjectUpdate(state, (project) => ({
        ...project,
        updated_at: new Date().toISOString(),
        episodes: project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'COMPLIANCE_PASSED',
            updated_at: new Date().toISOString(),
          };
        }),
      }))
    );
  },
});
