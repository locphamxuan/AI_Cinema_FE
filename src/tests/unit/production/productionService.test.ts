import { afterEach, describe, expect, it, vi } from 'vitest';
import { productionService, projectsUrl } from '@/services/productionService';
import { fakeResponse } from '@/tests/support/fakeResponse';

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(fakeResponse(body, status));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('productionService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('builds the project list query the paginated API filters on', () => {
    expect(projectsUrl()).toBe('/projects?page=1&limit=12&sortBy=updatedAt%3ADESC');
    const url = projectsUrl({ page: 2, search: ' Mưa ', status: ['IN_PRODUCTION', 'UNDER_REVISION'] });
    const params = new URL(url, 'http://x').searchParams;
    expect(params.get('page')).toBe('2');
    expect(params.get('search')).toBe('Mưa');
    expect(params.get('filter.status')).toBe('$in:IN_PRODUCTION,UNDER_REVISION');
    expect(new URL(projectsUrl({ status: ['COMPLETED'] }), 'http://x').searchParams.get('filter.status')).toBe('$eq:COMPLETED');
  });

  it('keeps the unpublish mode only when it is given', async () => {
    const fetchMock = mockFetch([]);
    await productionService.unpublish('pub-1', { mode: 'REVISION', reason: 'MANUAL', note: 'Nhạc nền chưa xử lý bản quyền' });
    expect(fetchMock.mock.calls[0][0]).toContain('/publications/pub-1/unpublish');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ mode: 'REVISION', reason: 'MANUAL', note: 'Nhạc nền chưa xử lý bản quyền' });
  });

  it('lists only active Content Creators for assignment and unwraps the page', async () => {
    const fetchMock = mockFetch({ data: [{ id: 'c1', fullName: 'Creator 1', email: 'c1@x.vn' }], meta: {} });
    const res = await productionService.listCreators();
    const params = new URL(fetchMock.mock.calls[0][0], 'http://x').searchParams;
    expect(params.get('filter.role')).toBe('$eq:CONTENT_CREATOR');
    expect(params.get('filter.isActive')).toBe('$eq:true');
    expect(res.data).toEqual([{ id: 'c1', fullName: 'Creator 1', email: 'c1@x.vn' }]);
  });

  it('treats a 204 No Content write as a success without reading a body', async () => {
    const answer = fakeResponse(undefined, 204);
    const text = vi.spyOn(answer, 'text');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer));
    const res = await productionService.assignCreator('m1', 'c1');
    expect(res).toMatchObject({ success: true, data: null });
    expect(text).not.toHaveBeenCalled();
  });

  it('deletes an idea file by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse(undefined, 204));
    vi.stubGlobal('fetch', fetchMock);
    const res = await productionService.deleteIdeaFile('m1', 'f1');
    expect(res.success).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain('/projects/m1/idea-files/f1');
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });

  it('surfaces the backend message on a refused write', async () => {
    mockFetch({ message: 'Allocate the production fee before assigning a Creator (BR-12)' }, 409);
    const res = await productionService.assignCreator('m1', 'c1');
    expect(res.success).toBe(false);
    expect(res.message).toContain('BR-12');
  });
});
