import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPipelines } from '@/services/pipelineService';
import { mockApi } from '@/tests/support/mockApi';

const pageOf = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 50 } });

describe('loadPipelines', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads one page of the pipeline in a single request', async () => {
    const rows = [{ id: 'a', script: null, episodes: [], contract: null }];
    const fetchMock = mockApi({ 'GET /projects/pipeline': pageOf(rows) });

    const res = await loadPipelines();

    expect(res).toMatchObject({ success: true, data: rows });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const params = new URL(fetchMock.mock.calls[0][0], 'http://x').searchParams;
    expect(params.get('limit')).toBe('50');
    expect(params.get('page')).toBe('1');
    expect(params.get('sortBy')).toBe('updatedAt:DESC');
    expect(params.has('filter.status')).toBe(false);
  });

  it('filters by status the way the project list does', async () => {
    const fetchMock = mockApi({ 'GET /projects/pipeline': pageOf([]) });
    await loadPipelines(['ASSIGNED', 'IN_PRODUCTION']);
    expect(new URL(fetchMock.mock.calls[0][0], 'http://x').searchParams.get('filter.status')).toBe('$in:ASSIGNED,IN_PRODUCTION');
  });

  it('answers no project when the request fails', async () => {
    mockApi({});
    const res = await loadPipelines();
    expect(res.success).toBe(false);
    expect(res.data).toEqual([]);
  });
});
