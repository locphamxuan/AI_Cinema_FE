import type { StateCreator } from 'zustand';
import type { AppState, SearchFilterSlice } from './types';

export const createSearchFilterSlice: StateCreator<AppState, [], [], SearchFilterSlice> = (set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedGenre: 'Tất cả',
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
  selectedCountry: 'Tất cả',
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  selectedYear: 'Tất cả',
  setSelectedYear: (year) => set({ selectedYear: year }),
});
