/** The Admin's film management (AI_Cinema_BE GET /admin/films). */
export interface FilmGenreTab {
  id: string;
  name: string;
  movieCount: number;
}

export interface FilmEpisodeFigures {
  id: string;
  episodeNumber: number;
  title: string;
  coinPrice: number | null;
  status: string;
  views: number;
  purchases: number;
  /** Coin Members paid for the episode, minus refunds. */
  coinsEarned: number;
  refundedCoins: number;
}

export interface FilmFigures {
  id: string;
  title: string;
  posterUrl: string | null;
  status: string;
  releaseYear: number | null;
  ageRating: string | null;
  genres: { id: string; name: string }[];
  likeCount: number;
  viewCount: number;
  purchases: number;
  coinsEarned: number;
  refundedCoins: number;
  episodes: FilmEpisodeFigures[];
}