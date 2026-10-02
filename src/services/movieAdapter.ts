import type { AIComplianceInfo, Episode, Movie } from '@/types/movie';

/** A movie of the public catalog (GET /movies, GET /movies/:id) — never the studio, fee or people in charge. */
export interface ApiCatalogMovie {
  id: string;
  title: string;
  synopsis: string | null;
  ageRating: string | null;
  releaseYear: number | null;
  defaultLanguage: string;
  posterUrl: string | null;
  bannerUrl: string | null;
  trailerUrl: string | null;
  aiGenerated: boolean;
  genres: { id: string; name: string }[];
}

/** A released episode (GET /movies/:id/episodes). The stream itself is not part of the catalog. */
export interface ApiCatalogEpisode {
  id: string;
  movieId: string;
  seasonNumber: number;
  seasonTitle: string | null;
  episodeNumber: number;
  title: string;
  synopsis: string | null;
  thumbnailUrl: string | null;
  availability: 'AVAILABLE' | 'UNDER_REVISION';
  notice: string | null;
  /** BR-03: the first episodes of every movie are free. */
  isFreeStarter: boolean;
  coinPrice: number | null;
  durationSeconds: number | null;
  qualities: string[];
  aiLabel: { labelType: string; labelText: string; displayLocation: string | null } | null;
  publishedAt: string | null;
}

export interface ApiGenre {
  id: string;
  name: string;
  description: string | null;
}

const RATING_LABELS: Record<string, string> = {
  T16: 'T16 - Phim dành cho khán giả từ 16 tuổi',
  T18: 'T18 - Phim dành cho khán giả từ 18 tuổi',
};

const LABEL_LOCATIONS = ['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT'] as const;

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Highest rendition any episode offers, e.g. '1080p'. */
function bestQuality(qualities: string[]): string | undefined {
  if (qualities.length === 0) return undefined;
  return [...qualities].sort((a, b) => parseInt(b, 10) - parseInt(a, 10))[0];
}

function adaptEpisode(ep: ApiCatalogEpisode, fallbackImage: string): Episode {
  return {
    id: ep.id,
    episodeNumber: ep.episodeNumber,
    title: ep.title,
    duration: formatDuration(ep.durationSeconds),
    // Playback (unlock and stream) is not served by the catalog yet.
    hlsUrl: '',
    qualities: ep.qualities,
    subtitles: [],
    thumbnailUrl: ep.thumbnailUrl ?? fallbackImage,
    price: ep.coinPrice ?? 0,
    isFree: ep.isFreeStarter,
    isPreview: ep.isFreeStarter && ep.episodeNumber === 1,
    isUnlocked: ep.isFreeStarter,
    synopsis: ep.synopsis ?? '',
  };
}

/** The AI label the Reviewer applied (BR-40), as the first released episode carries it. */
function aiCompliance(api: ApiCatalogMovie, episodes: ApiCatalogEpisode[]): AIComplianceInfo {
  const label = episodes.find((e) => e.aiLabel)?.aiLabel;
  const location = LABEL_LOCATIONS.find((l) => l === label?.displayLocation);
  return {
    complianceArticle: 'Nhãn nội dung AI do Reviewer gắn trước khi phát hành (BR-40)',
    reviewStatus: 'approved',
    contentRating: api.ageRating ? (RATING_LABELS[api.ageRating] ?? api.ageRating) : 'Mọi lứa tuổi',
    disclaimer: label?.labelText ?? 'Phim được tạo bằng trí tuệ nhân tạo (AI).',
    ...(location ? { displayLocation: location } : {}),
  };
}

export function adaptApiMovie(api: ApiCatalogMovie, episodes: ApiCatalogEpisode[] = []): Movie {
  const posterUrl = api.posterUrl ?? api.bannerUrl ?? '';
  const isSeries = episodes.length > 1;
  return {
    id: api.id,
    title: api.title,
    genre: api.genres.map((g) => g.name),
    posterUrl,
    bannerUrl: api.bannerUrl ?? posterUrl,
    description: api.synopsis ?? '',
    contentBrief: api.synopsis ?? '',
    year: api.releaseYear ?? new Date().getFullYear(),
    totalEpisodes: episodes.length,
    ageRating: api.ageRating ?? 'Mọi lứa tuổi',
    episodes: episodes.map((ep) => adaptEpisode(ep, posterUrl)),
    quality: bestQuality(episodes.flatMap((ep) => ep.qualities)) ?? 'HD',
    aiCompliance: aiCompliance(api, episodes),
    isSeries,
    badge: isSeries ? 'Series AI' : 'Phim AI',
  };
}

/** Newest first, as the catalog lists them; the first ten make the top-10 row. */
export function adaptApiMovies(list: { movie: ApiCatalogMovie; episodes: ApiCatalogEpisode[] }[]): Movie[] {
  return list.map(({ movie, episodes }, index) => ({
    ...adaptApiMovie(movie, episodes),
    ...(index < 10 ? { top10Rank: index + 1 } : {}),
  }));
}
