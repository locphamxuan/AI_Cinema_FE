/**
 * Where each project stands, for the role dashboards: one page of GET /projects/pipeline, the project list
 * plus each project's script, episodes and open contract round.
 */
import { apiClient, type ApiResponse } from './apiClient';
import { projectsUrl } from './productionService';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Contract } from '@/types/contract';
import type { Episode, Genre, MovieStatus, Page, ProjectScript, ProjectSummary } from '@/types/production';

const PIPELINE_LIMIT = 50;

export interface PipelineScript extends Pick<ProjectScript, 'status' | 'currentVersion'> {
  latestVersionAt: string | null;
}

export type PipelineEpisode = Pick<Episode, 'id' | 'episodeNumber' | 'title' | 'status' | 'finalConfirmedAt' | 'coinPrice' | 'updatedAt'>;

export interface ProjectPipeline extends ProjectSummary {
  genres: Genre[];
  /** Null before the first submission. */
  script: PipelineScript | null;
  /** Every episode of the project, by episode number. */
  episodes: PipelineEpisode[];
  /** The round being negotiated (SENT, STUDIO_SIGNED or ADMIN_COUNTERED); null when none is open. */
  contract: Contract | null;
}

/** The projects the account may see, newest change first, optionally only those with the given statuses. */
export async function loadPipelines(status?: MovieStatus[]): Promise<ApiResponse<ProjectPipeline[]>> {
  const res = await apiClient.get<Page<ProjectPipeline>>(projectsUrl({ limit: PIPELINE_LIMIT, status }, API_ROUTES.PRODUCTION.PROJECT_PIPELINE));
  return { ...res, data: res.success ? res.data.data : [] };
}
