import type { StateCreator } from 'zustand';
import type { AppState, UiModalsSlice } from './types';

export const createUiModalsSlice: StateCreator<AppState, [], [], UiModalsSlice> = (set) => ({
  isRightSidebarOpen: false,
  openRightSidebar: () => set({ isRightSidebarOpen: true }),
  closeRightSidebar: () => set({ isRightSidebarOpen: false }),
  toggleRightSidebar: () => set((s) => ({ isRightSidebarOpen: !s.isRightSidebarOpen })),

  isCheckInModalOpen: false,
  setCheckInModalOpen: (open) => set({ isCheckInModalOpen: open }),
});
