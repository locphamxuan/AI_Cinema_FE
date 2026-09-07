'use client';

import { useAppStore } from '@/store/useAppStore';
import { walletService } from '@/services/walletService';
import { useState } from 'react';

export function useWallet() {
  const {
    wallet,
    checkInStreak,
    isCheckInModalOpen,
    setCheckInModalOpen,
    claimDailyCheckIn,
    unlockEpisode,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimDaily = async () => {
    if (checkInStreak.todayClaimed) return { success: false, message: 'Đã nhận hôm nay' };
    setLoading(true);
    setError(null);
    try {
      const res = await walletService.claimDailyReward(checkInStreak, wallet);
      if (res.success && res.data) {
        claimDailyCheckIn();
        return { success: true, reward: res.data.reward };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi điểm danh';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockEpisode = (episodeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = unlockEpisode(episodeId);
      if (res.success) {
        return { success: true };
      }
      setError(res.error || 'Lỗi mở khóa tập');
      return { success: false, message: res.error };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi mở khóa tập';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    wallet,
    checkInStreak,
    isCheckInModalOpen,
    loading,
    error,
    totalCoins: wallet.mainCoin + wallet.bonusCoin,
    setCheckInModalOpen,
    claimDaily,
    unlockEpisode: handleUnlockEpisode,
  };
}
