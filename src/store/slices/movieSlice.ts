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
    const [moviesRes, genresRes] = await Promise.all([movieService.getMovies(), movieService.getGenres()]);
    set({
      movies: moviesRes.success ? moviesRes.data : [],
      genres: genresRes.success ? genresRes.data.map(({ id, name }) => ({ id, name })) : [],
      isCatalogLoading: false,
      catalogError: moviesRes.success ? null : moviesRes.message || 'Không tải được danh sách phim',
    });
  },

  selectEpisode: async (episodeId) => {
    await get().loadCatalog();
    set({ currentMovie: findMovieByEpisode(get().movies, episodeId) });
  },

  unlockEpisode: (episodeId) => {
    const state = get();
    const movie = state.currentMovie;
    const episode = movie?.episodes.find((ep) => ep.id === episodeId);
    if (!movie || !episode) return { success: false, error: 'Tập phim không tồn tại' };
    if (episode.isUnlocked || episode.isFree) return { success: true };

    const price = episode.price;
    const { mainCoin, bonusCoin } = state.wallet;
    const total = mainCoin + bonusCoin;

    if (total < price) {
      return { success: false, error: `Số dư không đủ. Cần ${price} Coin, hiện có ${total} Coin.` };
    }

    // Deduct main coin first, then bonus
    const mainDeduct = Math.min(mainCoin, price);
    const bonusDeduct = price - mainDeduct;

    const unlocked: Movie = {
      ...movie,
      episodes: movie.episodes.map((ep) => (ep.id === episodeId ? { ...ep, isUnlocked: true } : ep)),
    };
    set((s) => ({
      wallet: {
        mainCoin: s.wallet.mainCoin - mainDeduct,
        bonusCoin: s.wallet.bonusCoin - bonusDeduct,
      },
      currentMovie: unlocked,
      movies: s.movies.map((m) => (m.id === unlocked.id ? unlocked : m)),
    }));

    get().addTransaction({
      type: 'episode_purchase',
      typeLabel: 'Mua tập phim',
      description: `Mở khóa "${movie.title}" - Tập ${episode.episodeNumber}: ${episode.title}`,
      mainCoinDelta: -mainDeduct,
      bonusCoinDelta: -bonusDeduct,
      totalAmount: -price,
      status: 'success',
      statusLabel: 'Thành công',
      episodeInfo: `${movie.title} - Tập ${episode.episodeNumber}`,
    });

    return { success: true };
  },

  isUnlockModalOpen: false,
  selectedEpisodeId: null,
  openUnlockModal: (episodeId) => set({ isUnlockModalOpen: true, selectedEpisodeId: episodeId }),
  closeUnlockModal: () => set({ isUnlockModalOpen: false, selectedEpisodeId: null }),
});
