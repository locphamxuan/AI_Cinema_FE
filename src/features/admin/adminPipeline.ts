/** What the Admin has to act on in MF-1, read from the real API for the executive portal. */
import type { ApiResponse } from '@/services/apiClient';
import { contractService } from '@/services/contractService';
import { loadPipelines, type ProjectPipeline } from '@/services/pipelineService';
import { productionService } from '@/services/productionService';
import type { Contract } from '@/types/contract';
import type { Episode, MovieStatus, ProjectDetail } from '@/types/production';

export interface ContractToSign {
  contract: Contract;
  project: ProjectDetail;
}

export interface ReadyFilm {
  project: ProjectDetail;
  episode: Episode;
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
  return rows.flatMap(({ project }) =>
    project.seasons
      .flatMap((s) => s.episodes)
      .filter((e) => e.status === 'COMPLIANCE_PASSED' && !!e.finalConfirmedAt)
      .map((episode) => ({ project, episode })),
  );
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

  const negotiating = rows.data.filter(({ project, script }) => project.status === 'ASSIGNED' && script?.status === 'FINAL');
  const rounds = await Promise.all(negotiating.map(({ project }) => contractService.forProject(project.id)));
  const roundFailed = rounds.find((res) => !res.success);
  if (roundFailed) return { ...roundFailed, data: EMPTY };

  return {
    success: true,
    data: {
      totalProjects: total.data,
      completedProjects: completed.data,
      producingProjects: producing.data,
      finalScripts: rows.data.filter(({ script }) => script?.status === 'REVIEWER_APPROVED'),
      contractsToSign: negotiating.flatMap(({ project }, i) =>
        rounds[i].data.filter((c) => c.status === 'STUDIO_SIGNED').map((contract) => ({ contract, project })),
      ),
      readyFilms: readyFilmsOf(rows.data),
    },
  };
}
