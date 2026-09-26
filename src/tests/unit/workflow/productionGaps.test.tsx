import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { waitForJob } from '@/features/workflow/lib/jobPolling';
import { ProjectActivityLog } from '@/features/workflow/components/shared/ProjectActivityLog';
import type { ApiGenerationJob, ApiProductionEvent } from '@/types/workflow-api';
import { api, ok } from '@/tests/support/workflowStoreHarness';

vi.mock('@/services/workflowService', () => import('@/tests/support/workflowServiceMock'));

const job = (status: ApiGenerationJob['status']) => ({ id: 'job-1', status }) as ApiGenerationJob;

const event = (action: string, extra: Partial<ApiProductionEvent> = {}): ApiProductionEvent => ({
  id: action,
  action,
  entityType: 'ProductionPlan',
  actorType: 'USER',
  payload: null,
  createdAt: '2026-09-26T08:00:00.000Z',
  actor: { id: 'u1', fullName: 'Lê Quốc Bảo', role: 'CONTENT_REVIEWER' },
  ...extra,
});

describe('MF-1 production gaps', () => {
  beforeEach(() => vi.clearAllMocks());

  it('polls a queued generation job until the worker finishes it', async () => {
    api.getJob.mockReturnValueOnce(ok(job('RUNNING'))).mockReturnValueOnce(ok(job('COMPLETED')));

    const done = await waitForJob(job('QUEUED'), 1);

    expect(done.status).toBe('COMPLETED');
    expect(api.getJob).toHaveBeenCalledTimes(2);
  });

  it('returns a job the backend already finished without polling', async () => {
    await expect(waitForJob(job('FAILED'), 1)).resolves.toMatchObject({ status: 'FAILED' });
    expect(api.getJob).not.toHaveBeenCalled();
  });

  it('lists the project events in plain Vietnamese, naming the system for automatic ones', async () => {
    api.getProjectEvents.mockReturnValue(
      ok([
        event('EPISODE_PUBLISHED', { actorType: 'SYSTEM', actor: null }),
        event('PROJECT_CANCELLED', { payload: { reason: 'Đổi kế hoạch' } }),
      ]),
    );

    render(<ProjectActivityLog projectId="project-1" />);

    expect(await screen.findByText('Phát hành')).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống/)).toBeInTheDocument();
    expect(screen.getByText('Đổi kế hoạch')).toBeInTheDocument();
    expect(api.getProjectEvents).toHaveBeenCalledWith('project-1');
  });
});
