'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { savedMovieService } from '@/services/savedMovieService';
import { engagementService, type MovieEngagement } from '@/services/engagementService';
import { toast } from '@/components/ui/Toast';

/**
 * Save-for-later and like state of one movie, with optimistic toggles that roll back on failure.
 * A guest who tries either is asked to sign in.
 */
export function useMovieEngagement(movie: { id: string; title: string } | null) {
  const { isAuthenticated, openAuthModal } = useAppStore();
  const [isSaved, setIsSaved] = useState(false);
  const [savingBusy, setSavingBusy] = useState(false);
  const [engagement, setEngagement] = useState<MovieEngagement | null>(null);
  const [likingBusy, setLikingBusy] = useState(false);
  const movieId = movie?.id;

  useEffect(() => {
    if (!movieId) return;
    if (isAuthenticated) {
      savedMovieService.isSaved(movieId).then((res) => {
        if (res.success && res.data) setIsSaved(res.data.saved);
      }).catch(() => {});
    }
    engagementService.summary(movieId).then((res) => {
      if (res.success && res.data) setEngagement(res.data);
    }).catch(() => {});
  }, [movieId, isAuthenticated]);

  const toggleSave = async () => {
    if (!movie) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setSavingBusy(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    const res = nextSaved ? await savedMovieService.save(movie.id) : await savedMovieService.unsave(movie.id);
    setSavingBusy(false);
    if (res.success) {
      toast.success(
        nextSaved ? 'Đã lưu phim' : 'Đã bỏ lưu',
        nextSaved ? `"${movie.title}" đã được thêm vào danh sách xem sau.` : `Đã xóa "${movie.title}" khỏi danh sách.`,
      );
    } else {
      setIsSaved(!nextSaved);
      toast.error('Thao tác thất bại', 'Vui lòng thử lại sau.');
    }
  };

  const toggleLike = async () => {
    if (!movie) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setLikingBusy(true);
    const wasLiked = engagement?.likedByMe ?? false;
    const currentCount = engagement?.likeCount ?? 0;
    setEngagement((prev) => ({
      likeCount: wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
      viewCount: prev?.viewCount ?? 0,
      likedByMe: !wasLiked,
    }));
    const res = wasLiked ? await engagementService.unlike(movie.id) : await engagementService.like(movie.id);
    setLikingBusy(false);
    if (res.success && res.data) {
      setEngagement(res.data);
    } else {
      setEngagement((prev) => ({
        likeCount: currentCount,
        viewCount: prev?.viewCount ?? 0,
        likedByMe: wasLiked,
      }));
    }
  };

  return { isSaved, savingBusy, engagement, likingBusy, toggleSave, toggleLike };
}
