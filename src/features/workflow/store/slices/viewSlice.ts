import type { StateCreator } from 'zustand';
import type { ViewSlice, WorkflowStoreState } from '../types';

export const createViewSlice: StateCreator<WorkflowStoreState, [], [], ViewSlice> = (set) => ({
  currentRole: 'creator',
  setRole: (role) => set({ currentRole: role }),

  activeProjectId: 'proj-cyber-01',
  activePackageId: 'pkg-ep-03',
  setActiveProject: (id) => set({ activeProjectId: id }),
  setActivePackage: (id) => set({ activePackageId: id }),
});
