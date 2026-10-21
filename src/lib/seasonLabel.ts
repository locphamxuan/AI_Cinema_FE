/**
 * A season with a single episode is a whole film (a feature, or its sequel as season 2): it reads
 * "Phần N (trọn bộ)" instead of "Mùa N", and its episode is the part itself rather than "Tập 1".
 */
export function seasonName(seasonNumber: number, episodeCount: number | null | undefined): string {
  return episodeCount === 1 ? `Phần ${seasonNumber} (trọn bộ)` : `Mùa ${seasonNumber}`;
}

/** The season name plus its title when the title says something the name does not. */
export function seasonLabel(
  seasonNumber: number,
  episodeCount: number | null | undefined,
  title?: string | null,
): string {
  const name = seasonName(seasonNumber, episodeCount);
  const plain = !title || title === `Mùa ${seasonNumber}` || title === `Phần ${seasonNumber}`;
  return plain ? name : `${name} - ${title}`;
}

/** Episode counts by season id, for labels on rows that only carry the season (hand-offs, fee entries). */
export function episodeCountsBySeason(seasons: { id: string; episodes: unknown[] }[]): Map<string, number> {
  return new Map(seasons.map((season) => [season.id, season.episodes.length]));
}

interface ListedEpisode {
  seasonNumber: number;
  episodeNumber: number;
}

/** "Tập N", or "Phần N (trọn bộ)" when the episode is the only one of its season. */
export function episodeLabel(episode: ListedEpisode, episodes: ListedEpisode[]): string {
  const siblings = episodes.filter((other) => other.seasonNumber === episode.seasonNumber).length;
  return siblings === 1 ? seasonName(episode.seasonNumber, 1) : `Tập ${episode.episodeNumber}`;
}
