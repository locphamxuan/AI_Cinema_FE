import type { StateCreator } from 'zustand';
import { ReviewLog } from '@/types/workflow';
import { initialReviews } from '@/features/workflow/mocks/workflowMock';
import type { ReviewSlice, WorkflowStoreState } from '../types';

export const createReviewSlice: StateCreator<WorkflowStoreState, [], [], ReviewSlice> = (set) => ({
  reviews: initialReviews,

  requestPlanChanges: (packageId, feedbackNotes) => {
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo (Checker)',
      review_type: 'plan',
      decision: 'changes_requested',
      feedback_notes: feedbackNotes,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
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
      },
    }));
  },

  allocateQuota: (packageId, tokenQuota, notes) => {
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo (Checker)',
      review_type: 'plan',
      decision: 'approved',
      feedback_notes: `Kế hoạch được phê duyệt. Đã cấp ${tokenQuota} AI Tokens. ${notes || ''}`,
      quota_granted: tokenQuota,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      project: {
        ...state.project,
        allocated_tokens: state.project.allocated_tokens + tokenQuota,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'QUOTA_ALLOCATED',
            quota_allocated: tokenQuota,
            brief: {
              ...ep.brief,
              status: 'QUOTA_ALLOCATED',
              updated_at: new Date().toISOString(),
            },
          };
        }),
      },
    }));
  },

  requestContentChanges: (packageId, feedbackNotes) => {
    const newReview: ReviewLog = {
      id: `rev-${Date.now()}`,
      episode_package_id: packageId,
      reviewer_id: 'rev-user-01',
      reviewer_name: 'Lê Quốc Bảo (Checker)',
      review_type: 'content',
      decision: 'changes_requested',
      feedback_notes: feedbackNotes,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviews: [newReview, ...state.reviews],
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'CHANGES_REQUESTED',
            updated_at: new Date().toISOString(),
          };
        }),
      },
    }));
  },

  approveContent: (packageId) => {
    set((state) => ({
      project: {
        ...state.project,
        updated_at: new Date().toISOString(),
        episodes: state.project.episodes.map((ep) => {
          if (ep.id !== packageId) return ep;
          return {
            ...ep,
            status: 'COMPLIANCE_PASSED',
            updated_at: new Date().toISOString(),
          };
        }),
      },
    }));
  },
});
