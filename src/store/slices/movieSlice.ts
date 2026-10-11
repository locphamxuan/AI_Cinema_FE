import type { StateCreator } from 'zustand';
import { movieService } from '@/services/movieService';
import type { Movie } from '@/types/movie';
import type { AppState, MovieSlice } from './types';

const findMovieByEpisode = (movies: Movie[], episodeId: string) =>
  movies.find((m) => m.episodes.some((ep) => ep.id === episodeId)) ?? null;

export const createMovieSlice: StateCreator<AppState, [], [], MovieSlice> = (set, get) => ({
  movies: [],
  genres: [],
  isCatalogLoading: false,
  catalogError: null,
  currentMovie: null,

  loadCatalog: async (force = false) => {
    const { movies, isCatalogLoading } = get();
    if (isCatalogLoading || (!force && movies.length > 0)) return;

    set({ isCatalogLoading: true, catalogError: null });
    try {
      const [moviesRes, genresRes] = await Promise.all([movieService.getMovies(), movieService.getGenres()]);
      if (moviesRes.success && Array.isArray(moviesRes.data)) {
        set({
          movies: moviesRes.data,
          genres: genresRes.success && Array.isArray(genresRes.data) ? genresRes.data.map(({ id, name }) => ({ id, name })) : [],
          isCatalogLoading: false,
          catalogError: null,
        });
      } else {
        set({
          movies: [],
          isCatalogLoading: false,
          catalogError: moviesRes.message || 'Không thể tải danh sách phim từ máy chủ',
        });
      }
    } catch (err) {
      set({
        movies: [],
        isCatalogLoading: false,
        catalogError: err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu',
      });
    }
  },

  selectEpisode: async (episodeId) => {
    await get().loadCatalog();
    set({ currentMovie: findMovieByEpisode(get().movies, episodeId) });
  },

  markEpisodeUnlocked: (episodeId) =>
    set((s) => {
      if (!s.currentMovie) return {};
      const unlocked: Movie = {
        ...s.currentMovie,
        episodes: s.currentMovie.episodes.map((ep) => (ep.id === episodeId ? { ...ep, isUnlocked: true } : ep)),
      };
      return { currentMovie: unlocked, movies: s.movies.map((m) => (m.id === unlocked.id ? unlocked : m)) };
    }),

  isUnlockModalOpen: false,
  selectedEpisodeId: null,
  openUnlockModal: (episodeId) => set({ isUnlockModalOpen: true, selectedEpisodeId: episodeId }),
  closeUnlockModal: () => set({ isUnlockModalOpen: false, selectedEpisodeId: null }),
});
