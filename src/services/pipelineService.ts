/**
 * Where each project stands, read from the real API for the role dashboards: the project detail plus its script.
 * A list page holds at most PIPELINE_LIMIT projects; each one costs one or two reads, which the back office can afford.
 */
import { productionService } from './productionService';
import { scriptService } from './scriptService';
import type { ApiResponse } from './apiClient';
import type { MovieStatus, ProjectDetail, ProjectScript, ProjectSummary } from '@/types/production';

const PIPELINE_LIMIT = 50;

export interface ProjectPipeline {
  project: ProjectDetail;
  /** Null before the first version, or when the caller did not need the script of this project. */
  script: ProjectScript | null;
}

export interface PipelineOptions {
  /** Projects listed only with these statuses (every status when empty). */
  status?: MovieStatus[];
  /** Which projects need their script read; every project by default. */
  readScript?: (project: ProjectSummary) => boolean;
}

/**
 * The script only changes while its project is ASSIGNED (BE script.service): past that it is FINAL, before it
 * there is none, so a dashboard that acts on scripts in review skips the read for every other project.
 */
export const scriptInProgress = (project: ProjectSummary) => project.status === 'ASSIGNED';

const NO_SCRIPT: ApiResponse<ProjectScript | null> = { success: true, data: null };

/** The projects the account may see, each with its detail and script; the first failed read answers for all. */
export async function loadPipelines({ status, readScript = () => true }: PipelineOptions = {}): Promise<
  ApiResponse<ProjectPipeline[]>
> {
  const list = await productionService.listProjects({ limit: PIPELINE_LIMIT, status });
  if (!list.success) return { ...list, data: [] };
  const reads = await Promise.all(
    list.data.data.map((p) =>
      Promise.all([productionService.getProject(p.id), readScript(p) ? scriptService.get(p.id) : NO_SCRIPT] as const),
    ),
  );
  const failed = reads.flat().find((res) => !res.success);
  if (failed) return { ...failed, data: [] };
  return { ...list, data: reads.map(([project, script]) => ({ project: project.data, script: script.data })) };
}
