import type { StateCreator } from 'zustand';
import type { ViewSlice, WorkflowStoreState } from '../types';
import { mockAssignedProjects } from '@/features/workflow/mocks/workflowMock';

export const createViewSlice: StateCreator<WorkflowStoreState, [], [], ViewSlice> = (set) => ({
  currentRole: 'creator',
  setRole: (role) => set({ currentRole: role }),

  activeProjectId: 'proj-cyber-01',
  activePackageId: 'pkg-ep-03',
  setActiveProject: (id) => {
    const targetProj = mockAssignedProjects.find((p) => p.id === id);
    if (targetProj) {
      set({
        activeProjectId: id,
        project: targetProj,
        activePackageId: targetProj.episodes[0]?.id || 'pkg-ep-01',
      });
    } else {
      set({ activeProjectId: id });
    }
  },
  setActivePackage: (id) => set({ activePackageId: id }),
});
