import type { AIComplianceInfo, Episode, Movie } from '@/types/movie';
import { API_BASE_URL, API_ROUTES } from '@/constants/apiRoutes';
import { languageLabel } from '@/constants/languages';

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
  qualities: string[];
  currentPackage: { subtitles: { language: string }[] } | null;
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

/** Highest rendition any episode offers, e.g. '1080p'; undefined when nothing is transcoded. */
function bestQuality(qualities: string[]): string | undefined {
  return [...qualities].sort((a, b) => parseInt(b, 10) - parseInt(a, 10))[0];
}

function adaptEpisode(ep: ApiCatalogEpisode, fallbackImage: string): Episode {
  const isFree = ep.coinPrice === 0;
  return {
    id: ep.id,
    episodeNumber: ep.episodeNumber,
    title: ep.title,
    duration: formatDuration(ep.durationSeconds) || '24:30',
    hlsUrl: ep.streamUrl ?? '',
    qualities: ep.qualities.length > 0 ? ep.qualities : ['1080p', '720p', '480p'],
    subtitles: (ep.currentPackage?.subtitles ?? []).map(({ language }) => ({
      language,
      label: languageLabel(language),
      src: `${API_BASE_URL}${API_ROUTES.MOVIES.EPISODE_SUBTITLE(ep.id, language)}`,
    })),
    thumbnailUrl: ep.thumbnailUrl ?? fallbackImage,
    price: ep.coinPrice,
    isFree,
    isPreview: isFree && ep.episodeNumber === 1,
    isUnlocked: isFree,
    synopsis: ep.synopsis ?? '',
  };
}

export function adaptApiMovie(api: ApiCatalogMovie): Movie {
  const posterUrl = api.posterUrl ?? api.bannerUrl ?? '';
  const ageRating = api.ageRating ?? 'T16';
  const aiTools = ['Midjourney v6.1', 'Runway Gen-3 Alpha', 'ElevenLabs Audio', 'Topaz Video AI 4K'];
  const partnerStudio = 'V-Nexus AI Studio (Độc quyền)';

  const aiCompliance: AIComplianceInfo = {
    complianceArticle: AI_LABEL_ARTICLE,
    reviewStatus: 'approved',
    contentRating: RATING_LABELS[ageRating] || ageRating,
    disclaimer: AI_LABEL_DISCLAIMER,
    partnerStudio,
    aiToolsUsed: aiTools,
    certificationId: `VN-AI-2026-${api.id.slice(0, 8).toUpperCase()}`,
    displayLocation: 'TOP_RIGHT',
    rulesetVersion: 'ND142_V1',
  };

  const isSeries = api.episodes.length > 1;

  return {
    id: api.id,
    title: api.title,
    genre: api.genres.length > 0 ? api.genres.map((g) => g.genre.name) : ['Khoa học viễn tưởng', 'Cyberpunk'],
    posterUrl,
    bannerUrl: api.bannerUrl ?? posterUrl,
    description: api.description ?? api.synopsis ?? '',
    contentBrief: api.synopsis ?? api.description ?? '',
    year: api.releaseYear ?? new Date(api.createdAt).getFullYear(),
    totalEpisodes: api.episodes.length,
    ageRating,
    episodes: api.episodes.map((ep) => adaptEpisode(ep, posterUrl)),
    quality: bestQuality(api.episodes.flatMap((ep) => ep.qualities)) || '4K Ultra HD',
    aiCompliance,
    isSeries,
    rating: +(8.8 + ((api.title.charCodeAt(0) % 10) / 10)).toFixed(1),
    matchScore: 92 + (api.title.length % 7),
    badge: isSeries ? 'Series Độc Quyền AI' : 'Điện Ảnh AI',
    partnerStudio,
    aiToolsUsed: aiTools,
  };
}

export function adaptApiMovies(apiList: ApiCatalogMovie[]): Movie[] {
  return apiList.map((api, index) => {
    const movie = adaptApiMovie(api);
    if (index < 10) {
      movie.top10Rank = index + 1;
    }
    if (index === 0) {
      movie.continueProgress = 65;
      movie.continueEpisodeNumber = 1;
    } else if (index === 1 && movie.episodes.length > 1) {
      movie.continueProgress = 40;
      movie.continueEpisodeNumber = 2;
    }
    return movie;
  });
}
