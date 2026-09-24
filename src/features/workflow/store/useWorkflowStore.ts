import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EMPTY_PROJECT } from '@/features/workflow/lib/emptyProject';
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

      resetWorkspace: async () => {
        set({
          activeProjectId: '',
          activePackageId: '',
          project: EMPTY_PROJECT,
          projects: [],
          reviews: [],
          complianceChecks: {},
          labels: {},
          publications: {},
        });
        await get().loadProjects();
      },
    }),
    {
      name: 'ai_cinema_workflow_store',
      // v1 dropped the bundled demo projects — discard state persisted by v0
      // so browsers stop showing them.
      version: 1,
      migrate: () => ({}),
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
