import { afterEach, describe, expect, it, vi } from 'vitest';
import { productionService, projectsUrl } from '@/services/productionService';
import type { AiDisclosure } from '@/types/production';

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const disclosure: AiDisclosure = {
  aiTools: ['Kling'],
  aiGeneratedParts: ['video'],
  humanEdited: true,
  noRealPersonLikeness: true,
  noCopyrightedMaterial: true,
};

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

  it('uploads an episode as multipart, with the AI disclosure as JSON and no JSON content type', async () => {
    const fetchMock = mockFetch({ id: 'asset-1' }, 201);
    const file = new File(['video'], 'ep1.mp4', { type: 'video/mp4' });

    const res = await productionService.uploadMedia('ep-1', file, { proposedLabelType: 'AI_GENERATED', aiDisclosure: disclosure });

    expect(res.success).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/episodes/ep-1/media/upload');
    expect(init.headers['Content-Type']).toBeUndefined();
    const form = init.body as FormData;
    expect(form.get('file')).toBeInstanceOf(File);
    expect(form.get('proposedLabelType')).toBe('AI_GENERATED');
    expect(JSON.parse(String(form.get('aiDisclosure')))).toEqual(disclosure);
  });

  it('sends a delivery link as JSON', async () => {
    const fetchMock = mockFetch({ id: 'asset-2' }, 201);
    await productionService.submitMediaLink('ep-1', {
      proposedLabelType: 'AI_ASSISTED',
      aiDisclosure: disclosure,
      sourceMethod: 'HLS_URL',
      sourceUrl: 'https://cdn.studio.vn/ep1/master.m3u8',
    });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toMatchObject({ sourceMethod: 'HLS_URL', aiDisclosure: disclosure });
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

  it('surfaces the backend message on a refused write', async () => {
    mockFetch({ message: 'Allocate the production fee before assigning a Creator (BR-12)' }, 409);
    const res = await productionService.assignCreator('m1', 'c1');
    expect(res.success).toBe(false);
    expect(res.message).toContain('BR-12');
  });
});
