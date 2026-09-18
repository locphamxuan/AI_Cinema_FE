import type { StateCreator } from 'zustand';
import { mockMovie } from '@/mocks/mockData';
import type { AppState, MovieSlice } from './types';

export const createMovieSlice: StateCreator<AppState, [], [], MovieSlice> = (set, get) => ({
  currentMovie: mockMovie,

  unlockEpisode: (episodeId) => {
    const state = get();
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
