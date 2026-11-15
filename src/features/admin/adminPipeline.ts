/** What the Admin has to act on in MF-1, read from the real API for the executive portal. */
import type { ApiResponse } from '@/services/apiClient';
import { loadPipelines, type PipelineEpisode, type ProjectPipeline } from '@/services/pipelineService';
import { productionService } from '@/services/productionService';
import type { Contract } from '@/types/contract';
import type { MovieStatus } from '@/types/production';

export interface ContractToSign {
  contract: Contract;
  project: ProjectPipeline;
}

export interface ReadyFilm {
  project: ProjectPipeline;
  episode: PipelineEpisode;
}

export interface AdminPipeline {
  totalProjects: number;
  completedProjects: number;
  producingProjects: number;
  /** Scripts the Reviewer approved, waiting for the Admin's Final Script decision. */
  finalScripts: ProjectPipeline[];
  /** Rounds the studio signed, waiting for the Admin to sign or counter. */
  contractsToSign: ContractToSign[];
  /** Episodes the Reviewer confirmed as Final Films, waiting for the Admin to publish. */
  readyFilms: ReadyFilm[];
}

const EMPTY: AdminPipeline = {
  totalProjects: 0,
  completedProjects: 0,
  producingProjects: 0,
  finalScripts: [],
  contractsToSign: [],
  readyFilms: [],
};

/** Episodes confirmed as Final Films and not released yet. */
export function readyFilmsOf(rows: ProjectPipeline[]): ReadyFilm[] {
  return rows.flatMap((project) =>
    project.episodes
      .filter((e) => e.status === 'COMPLIANCE_PASSED' && !!e.finalConfirmedAt)
      .map((episode) => ({ project, episode })),
  );
}

/**
 * Rounds the studio signed and the Admin has to answer: the first contract of an ASSIGNED project, or the new
 * studio's contract after a studio change in production. The row carries only the open round, so an older
 * SIGNED contract of the same project never hides it.
 */
export function contractsToSignOf(rows: ProjectPipeline[]): ContractToSign[] {
  return rows.flatMap((project) => (project.contract?.status === 'STUDIO_SIGNED' ? [{ contract: project.contract, project }] : []));
}

/** Projects counted across every page: the API's total for a status filter. */
async function countOf(status?: MovieStatus[]): Promise<ApiResponse<number>> {
  const res = await productionService.listProjects({ limit: 1, status });
  return { ...res, data: res.success ? res.data.meta.totalItems : 0 };
}

export async function loadAdminPipeline(): Promise<ApiResponse<AdminPipeline>> {
  const [total, completed, producing, rows] = await Promise.all([
    countOf(),
    countOf(['COMPLETED']),
    countOf(['IN_PRODUCTION', 'UNDER_REVISION']),
    loadPipelines(['ASSIGNED', 'IN_PRODUCTION', 'UNDER_REVISION']),
  ]);
  const failed = [total, completed, producing, rows].find((res) => !res.success);
  if (failed) return { ...failed, data: EMPTY };

  return {
    success: true,
    data: {
      totalProjects: total.data,
      completedProjects: completed.data,
      producingProjects: producing.data,
      finalScripts: rows.data.filter(({ script }) => script?.status === 'REVIEWER_APPROVED'),
      contractsToSign: contractsToSignOf(rows.data),
      readyFilms: readyFilmsOf(rows.data),
    },
  };
}
