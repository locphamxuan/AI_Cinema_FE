import type { EpisodePackage } from '@/types/workflow';

type Numbered = Pick<EpisodePackage, 'season_number' | 'episode_number'>;

/** Whether the episodes span more than one season, so labels must name the season. */
export const spansSeasons = (episodes: Numbered[]) => new Set(episodes.map((e) => e.season_number)).size > 1;

/** "Tập 3", or "Mùa 2 · Tập 3" when the project has several seasons. */
export const episodeLabel = (episode: Numbered, multiSeason: boolean) =>
  multiSeason ? `Mùa ${episode.season_number} · Tập ${episode.episode_number}` : `Tập ${episode.episode_number}`;

const LABEL_PREFIX = /^(Mùa\s*\d+\s*·\s*)?Tập\s*\d+\s*[:-]\s*/i;

/** An episode title without its "Mùa … · Tập …:" prefix. */
export const episodeName = (title: string | undefined) => title?.replace(LABEL_PREFIX, '') || title || '';
