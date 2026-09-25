import { vi } from 'vitest';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { workflowService } from '@/services/workflowService';
import { adaptApiProjectToUiProject } from '@/features/workflow/lib/apiAdapter';
import { initialProject } from '@/tests/fixtures/workflowFixtures';
import { mockAssignedProjects } from '@/tests/fixtures/workflowProjectFixtures';
import type { ApiProductionProject } from '@/types/workflow-api';

/** The mocked workflow API; the test file must mock '@/services/workflowService' first. */
export const api = vi.mocked(workflowService);
export const ok = <T,>(data: T) => Promise.resolve({ success: true, data });
export const fail = (message: string) => Promise.resolve({ success: false, data: null as never, message });

/** Loads `project` into the store and makes every reload return it. */
export function serveBackendProject(project: ApiProductionProject) {
  api.getProject.mockImplementation(() => ok(project));
  useWorkflowStore.setState({
    project: adaptApiProjectToUiProject(project),
    projects: [adaptApiProjectToUiProject(project)],
    activeProjectId: project.id,
    activePackageId: project.productionPlans?.[0]?.id ?? '',
  });
}

/** Clears every mock and puts the fixture roster back in the store. */
export function resetWorkflowStore() {
  vi.clearAllMocks();
  useWorkflowStore.setState({
    currentRole: 'creator',
    activeProjectId: 'proj-cyber-01',
    activePackageId: 'pkg-ep-03',
    project: initialProject,
    projects: mockAssignedProjects,
  });
}
