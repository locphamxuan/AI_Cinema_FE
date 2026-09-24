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
        });
        await get().loadProjects();
      },
    }),
    {
      name: 'ai_cinema_workflow_store',
      // Project data now always comes from the backend; v2 discards the
      // project snapshots persisted by earlier versions.
      version: 2,
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
      }),
    }
  )
);

export type { WorkflowStoreState } from './types';
