import type { ProductionProject } from '@/types/workflow';
import type { WorkflowStoreState } from '../types';

/**
 * Every slice mutates the single active `project`, but the sidebar's
 * assigned/completed lists read from `projects` (the full roster). This
 * keeps both in sync in one place instead of every action dual-writing.
 */
export function withProjectUpdate(
  state: WorkflowStoreState,
  updater: (project: ProductionProject) => ProductionProject
): Pick<WorkflowStoreState, 'project' | 'projects'> {
  const updatedProject = updater(state.project);
  return {
    project: updatedProject,
    projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
  };
}
