import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  initialProject,
  mockAssignedProjects,
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

export const useWorkflowStore = create<WorkflowStoreState>()(
  persist(
    (set, get, api) => ({
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
          projects: mockAssignedProjects,
          reviews: initialReviews,
          complianceChecks: initialComplianceChecks,
          labels: initialLabels,
          publications: initialPublications,
        });
      },
    }),
    {
      name: 'ai_cinema_workflow_store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        currentRole: state.currentRole,
        activeProjectId: state.activeProjectId,
        activePackageId: state.activePackageId,
        project: state.project,
        projects: state.projects,
        reviews: state.reviews,
        complianceChecks: state.complianceChecks,
        labels: state.labels,
        publications: state.publications,
      }),
    }
  )
);

export type { WorkflowStoreState } from './types';
