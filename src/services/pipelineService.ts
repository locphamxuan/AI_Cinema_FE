/**
 * Where each project stands, read from the real API for the role dashboards: the project detail plus its script.
 * A list page holds at most PIPELINE_LIMIT projects; each one costs two reads, which the back office can afford.
 */
import { productionService } from './productionService';
import { scriptService } from './scriptService';
import type { ApiResponse } from './apiClient';
import type { MovieStatus, ProjectDetail, ProjectScript } from '@/types/production';

const PIPELINE_LIMIT = 50;

export interface ProjectPipeline {
  project: ProjectDetail;
  script: ProjectScript | null;
}

/** The projects the account may see, each with its detail and script; the first failed read answers for all. */
export async function loadPipelines(status?: MovieStatus[]): Promise<ApiResponse<ProjectPipeline[]>> {
  const list = await productionService.listProjects({ limit: PIPELINE_LIMIT, status });
  if (!list.success) return { ...list, data: [] };
  const reads = await Promise.all(
    list.data.data.map((p) => Promise.all([productionService.getProject(p.id), scriptService.get(p.id)] as const)),
  );
  const failed = reads.flat().find((res) => !res.success);
  if (failed) return { ...failed, data: [] };
  return { ...list, data: reads.map(([project, script]) => ({ project: project.data, script: script.data })) };
}
