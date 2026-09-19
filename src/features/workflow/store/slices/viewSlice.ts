import type { StateCreator } from 'zustand';
import type { ViewSlice, WorkflowStoreState } from '../types';

export const createViewSlice: StateCreator<WorkflowStoreState, [], [], ViewSlice> = (set, get) => ({
  currentRole: 'creator',
  setRole: (role) => set({ currentRole: role }),

  activeProjectId: 'proj-cyber-01',
  activePackageId: 'pkg-ep-03',
  setActiveProject: (id) => {
    const state = get();
    // Persist any in-progress edits on the currently open project back into
    // the roster before switching, so they aren't lost when navigating away.
    const roster = state.projects.map((p) => (p.id === state.project.id ? state.project : p));
    const target = roster.find((p) => p.id === id);

    if (target) {
      set({
        activeProjectId: id,
        project: target,
        projects: roster,
        activePackageId: target.episodes[0]?.id || '',
      });
    } else {
      set({ activeProjectId: id, projects: roster });
    }
  },
  setActivePackage: (id) => set({ activePackageId: id }),
});
