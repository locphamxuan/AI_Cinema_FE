import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPipelines, scriptInProgress } from '@/services/pipelineService';
import { mockApi } from '@/tests/support/mockApi';
import type { ProjectSummary } from '@/types/production';

const pageOf = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 50 } });
const paths = (fetchMock: ReturnType<typeof mockApi>) =>
  fetchMock.mock.calls.map(([url]) => new URL(url, 'http://x').pathname.replace(/^\/api/, ''));

describe('loadPipelines', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads the detail and the script of every project by default', async () => {
    const fetchMock = mockApi({
      'GET /projects': pageOf([{ id: 'a', status: 'IN_PRODUCTION' }]),
      'GET /projects/a': { id: 'a' },
      'GET /projects/a/script': { status: 'FINAL' },
    });
    const res = await loadPipelines();
    expect(res.data).toEqual([{ project: { id: 'a' }, script: { status: 'FINAL' } }]);
    expect(paths(fetchMock)).toContain('/projects/a/script');
  });

  it('skips the script of the projects the caller does not need it for', async () => {
    const fetchMock = mockApi({
      'GET /projects': pageOf([{ id: 'a', status: 'ASSIGNED' }, { id: 'b', status: 'IN_PRODUCTION' }]),
      'GET /projects/a': { id: 'a' },
      'GET /projects/a/script': { status: 'SUBMITTED' },
      'GET /projects/b': { id: 'b' },
    });
    const res = await loadPipelines({ readScript: scriptInProgress });
    expect(res.data.map((row) => row.script)).toEqual([{ status: 'SUBMITTED' }, null]);
    expect(paths(fetchMock)).not.toContain('/projects/b/script');
  });

  it('keeps a project without a script (empty body) instead of failing the list', async () => {
    mockApi({ 'GET /projects': pageOf([{ id: 'a', status: 'ASSIGNED' }]), 'GET /projects/a': { id: 'a' }, 'GET /projects/a/script': null });
    const res = await loadPipelines();
    expect(res).toMatchObject({ success: true, data: [{ project: { id: 'a' }, script: null }] });
  });

  it('fails as a whole when one read fails', async () => {
    mockApi({ 'GET /projects': pageOf([{ id: 'a', status: 'ASSIGNED' }]) });
    const res = await loadPipelines();
    expect(res.success).toBe(false);
    expect(res.data).toEqual([]);
  });

  it('only counts an ASSIGNED project as one whose script may still change', () => {
    const of = (status: ProjectSummary['status']) => ({ status }) as ProjectSummary;
    expect(scriptInProgress(of('ASSIGNED'))).toBe(true);
    expect(['DRAFT', 'IN_PRODUCTION', 'UNDER_REVISION', 'COMPLETED', 'CANCELLED'].map((s) => scriptInProgress(of(s as never)))).toEqual([
      false, false, false, false, false,
    ]);
  });
});
