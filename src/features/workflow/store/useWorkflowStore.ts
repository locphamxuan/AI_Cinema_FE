import { create } from 'zustand';
import {
  initialProject,
  initialReviews,
  initialComplianceChecks,
  initialLabels,
  initialPublications,
} from '@/features/workflow/mocks/workflowMock';
import { createViewSlice } from './slices/viewSlice';
import { createEpisodeSlice } from './slices/episodeSlice';
import { createProductionSlice } from './slices/productionSlice';
import { createReviewSlice } from './slices/reviewSlice';
import { createComplianceSlice } from './slices/complianceSlice';
import type { WorkflowStoreState } from './types';

export const useWorkflowStore = create<WorkflowStoreState>((set, get, api) => ({
  ...createViewSlice(set, get, api),
  ...createEpisodeSlice(set, get, api),
  ...createProductionSlice(set, get, api),
  ...createReviewSlice(set, get, api),
  ...createComplianceSlice(set, get, api),

  resetDemoData: () => {
    set({
      currentRole: 'creator',
      activeProjectId: 'proj-cyber-01',
      activePackageId: 'pkg-ep-03',
      project: initialProject,
      reviews: initialReviews,
      complianceChecks: initialComplianceChecks,
      labels: initialLabels,
      publications: initialPublications,
    });
  },
}));

export type { WorkflowStoreState } from './types';
