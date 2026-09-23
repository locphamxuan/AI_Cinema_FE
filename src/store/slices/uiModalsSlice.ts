import type { StateCreator } from 'zustand';
import type { AppState, UiModalsSlice } from './types';

export const createUiModalsSlice: StateCreator<AppState, [], [], UiModalsSlice> = (set, get) => ({
  isRightSidebarOpen: false,
  openRightSidebar: () => set({ isRightSidebarOpen: true }),
  closeRightSidebar: () => set({ isRightSidebarOpen: false }),
  toggleRightSidebar: () => set((s) => ({ isRightSidebarOpen: !s.isRightSidebarOpen })),

  isCheckInModalOpen: false,
  setCheckInModalOpen: (open) => {
    if (open) {
      get().syncCheckInStreak?.();
    }
    set({ isCheckInModalOpen: open });
  },
});
