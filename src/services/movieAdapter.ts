import type { AIComplianceInfo, Episode, Movie } from '@/types/movie';

/** Shapes returned by the public catalog endpoints (GET /movies, GET /movies/:id). */
export interface ApiCatalogEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  synopsis: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  coinPrice: number;
  streamUrl: string | null;
}

export interface ApiCatalogMovie {
  id: string;
  title: string;
  synopsis: string | null;
  description: string | null;
  posterUrl: string | null;
  bannerUrl: string | null;
  releaseYear: number | null;
  ageRating: string | null;
  createdAt: string;
  genres: { genre: { id: string; name: string } }[];
  episodes: ApiCatalogEpisode[];
}

export interface ApiGenre {
  id: string;
  name: string;
  description: string | null;
}

// Every published episode passed compliance and carries the AI label required by
// the AI-labeling policy seeded in the backend (Điều 44 Luật 134/2025/QH15, Điều 18 NĐ 142/2026).
const AI_LABEL_ARTICLE = 'Điều 44 Luật số 134/2025/QH15 và Điều 18 Nghị định số 142/2026/NĐ-CP';
const AI_LABEL_DISCLAIMER =
  'Nội dung hình ảnh, âm thanh và kịch bản của phim được tạo bằng Trí tuệ Nhân tạo. Không có diễn viên thật tham gia.';

const RATING_LABELS: Record<string, string> = {
  P: 'P - Phim phổ biến cho mọi lứa tuổi',
  T13: 'T13 - Phim dành cho khán giả từ 13 tuổi',
  T16: 'T16 - Phim dành cho khán giả từ 16 tuổi',
  T18: 'T18 - Phim dành cho khán giả từ 18 tuổi',
};

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function adaptEpisode(ep: ApiCatalogEpisode, fallbackImage: string): Episode {
  const isFree = ep.coinPrice === 0;
  return {
    id: ep.id,
    episodeNumber: ep.episodeNumber,
    title: ep.title,
    duration: formatDuration(ep.durationSeconds),
    hlsUrl: ep.streamUrl ?? '',
    thumbnailUrl: ep.thumbnailUrl ?? fallbackImage,
    price: ep.coinPrice,
    isFree,
    isPreview: isFree && ep.episodeNumber === 1,
    // No entitlement API yet (MF-2): only free episodes start unlocked.
    isUnlocked: isFree,
    synopsis: ep.synopsis ?? '',
  };
}

export function adaptApiMovie(api: ApiCatalogMovie): Movie {
  const posterUrl = api.posterUrl ?? api.bannerUrl ?? '';
  const ageRating = api.ageRating ?? undefined;
  const aiCompliance: AIComplianceInfo = {
    complianceArticle: AI_LABEL_ARTICLE,
    reviewStatus: 'approved',
    contentRating: (ageRating && RATING_LABELS[ageRating]) || ageRating || 'Chưa phân loại',
    disclaimer: AI_LABEL_DISCLAIMER,
  };

  return {
    id: api.id,
    title: api.title,
    genre: api.genres.map((g) => g.genre.name),
    posterUrl,
    bannerUrl: api.bannerUrl ?? posterUrl,
    description: api.description ?? api.synopsis ?? '',
    year: api.releaseYear ?? new Date(api.createdAt).getFullYear(),
    totalEpisodes: api.episodes.length,
    ageRating,
    episodes: api.episodes.map((ep) => adaptEpisode(ep, posterUrl)),
    aiCompliance,
  };
}
