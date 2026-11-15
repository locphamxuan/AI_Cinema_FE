import { afterEach, describe, expect, it, vi } from 'vitest';
import { contractsToSignOf, loadAdminPipeline } from '@/features/admin/adminPipeline';
import type { ProjectPipeline } from '@/services/pipelineService';
import { mockApi } from '@/tests/support/mockApi';

const pageOf = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 50 } });

const round = (status: string, overrides: Record<string, unknown> = {}) => ({
  id: `c-${status}`,
  round: 1,
  status,
  costVnd: status === 'SENT' ? null : 45_000_000,
  handoffId: null,
  studio: { id: 'st-c', name: 'Studio C' },
  ...overrides,
});

const row = (overrides: Partial<ProjectPipeline> = {}) =>
  ({ id: 'm1', title: 'Mưa Sài Gòn', status: 'ASSIGNED', script: null, episodes: [], contract: null, ...overrides }) as unknown as ProjectPipeline;

describe('contractsToSignOf', () => {
  it('lists the first contract of an ASSIGNED project once the studio signed it', () => {
    const first = row({ script: { status: 'FINAL', currentVersion: 1, latestVersionAt: null }, contract: round('STUDIO_SIGNED') as never });
    expect(contractsToSignOf([first])).toEqual([{ contract: first.contract, project: first }]);
  });

  it('lists the new studio round of a studio change on a project in production', () => {
    const changed = row({
      id: 'm2',
      status: 'IN_PRODUCTION',
      script: { status: 'FINAL', currentVersion: 1, latestVersionAt: null },
      contract: round('STUDIO_SIGNED', { handoffId: 'h2', handoff: { id: 'h2', milestoneStatus: 'BRIEF_SENT' } }) as never,
    });
    expect(contractsToSignOf([changed]).map((item) => item.project.id)).toEqual(['m2']);
  });

  it('leaves out rounds the studio has not signed yet, and projects with no open round', () => {
    const rows = [
      row({ contract: round('SENT') as never }),
      row({ contract: round('ADMIN_COUNTERED') as never }),
      row({ status: 'IN_PRODUCTION', contract: null }),
    ];
    expect(contractsToSignOf(rows)).toEqual([]);
  });
});

describe('loadAdminPipeline', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('picks up the round the new studio signed although the project already has a SIGNED contract', async () => {
    // GET /projects/pipeline carries only the open round: the first studio's SIGNED contract is history.
    const changed = row({
      status: 'IN_PRODUCTION',
      script: { status: 'FINAL', currentVersion: 1, latestVersionAt: null },
      contract: round('STUDIO_SIGNED', { round: 1, handoffId: 'h2', handoff: { id: 'h2', milestoneStatus: 'BRIEF_SENT' } }) as never,
    });
    mockApi({ 'GET /projects': pageOf([changed]), 'GET /projects/pipeline': pageOf([changed]) });

    const res = await loadAdminPipeline();

    expect(res.success).toBe(true);
    expect(res.data.contractsToSign).toEqual([{ contract: changed.contract, project: changed }]);
    expect(res.data.finalScripts).toEqual([]);
  });

  it('answers the failure of the pipeline instead of empty work', async () => {
    mockApi({ 'GET /projects': pageOf([]) });
    const res = await loadAdminPipeline();
    expect(res.success).toBe(false);
  });
});
