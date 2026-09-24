import type { StateCreator } from 'zustand';
import type { Movie } from '@/types/movie';
import type { AppState, MovieSlice } from './types';

const emptyMovie: Movie = {
  id: '',
  title: 'Chưa có phim',
  genre: [],
  posterUrl: '',
  bannerUrl: '',
  description: 'Dữ liệu phim sẽ được tải từ backend sau khi API hoạt động.',
  year: new Date().getFullYear(),
  episodes: [],
  aiCompliance: {
    aiModel: '',
    generatedDate: '',
    complianceArticle: '',
    reviewStatus: 'pending',
    moderationScore: 0,
    contentRating: '',
    disclaimer: '',
  },
  totalEpisodes: 0,
};

export const createMovieSlice: StateCreator<AppState, [], [], MovieSlice> = (set, get) => ({
  currentMovie: emptyMovie,

  unlockEpisode: (episodeId) => {
    const state = get();
    if (!state.currentMovie?.episodes?.length) {
      return { success: false, error: 'Chưa có dữ liệu tập phim từ backend.' };
    }

    const episode = state.currentMovie.episodes.find((ep) => ep.id === episodeId);
    if (!episode) return { success: false, error: 'Tập phim không tồn tại' };
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

    set((s) => ({
      wallet: {
        mainCoin: s.wallet.mainCoin - mainDeduct,
        bonusCoin: s.wallet.bonusCoin - bonusDeduct,
      },
      currentMovie: {
        ...s.currentMovie,
        episodes: s.currentMovie.episodes.map((ep) => (ep.id === episodeId ? { ...ep, isUnlocked: true } : ep)),
      },
    }));

    get().addTransaction({
      type: 'episode_purchase',
      typeLabel: 'Mua tập phim',
      description: `Mở khóa "${state.currentMovie.title}" - Tập ${episode.episodeNumber}: ${episode.title}`,
      mainCoinDelta: -mainDeduct,
      bonusCoinDelta: -bonusDeduct,
      totalAmount: -price,
      status: 'success',
      statusLabel: 'Thành công',
      episodeInfo: `${state.currentMovie.title} - Tập ${episode.episodeNumber}`,
    });

    return { success: true };
  },

  isUnlockModalOpen: false,
  selectedEpisodeId: null,
  openUnlockModal: (episodeId) => set({ isUnlockModalOpen: true, selectedEpisodeId: episodeId }),
  closeUnlockModal: () => set({ isUnlockModalOpen: false, selectedEpisodeId: null }),
});
