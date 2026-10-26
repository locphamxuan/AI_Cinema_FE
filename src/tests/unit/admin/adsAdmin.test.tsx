import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_AD_VIDEO_BYTES, adAdminService, adInputProblem } from '@/services/adAdminService';
import { adLiveState } from '@/features/admin/components/AdsPanel';
import { AdFormModal, dayOf, instantOf } from '@/features/admin/components/AdFormModal';
import type { AdminAd, AdInput } from '@/types/playback';

const input = (patch: Partial<AdInput> = {}): AdInput => ({
  title: 'Trà sữa',
  mediaUrl: 'https://cdn.example/ad.mp4',
  durationSeconds: 15,
  weight: 1,
  ...patch,
});

const ad = (patch: Partial<AdminAd> = {}): AdminAd => ({
  id: 'a1',
  title: 'Trà sữa',
  mediaUrl: 'https://cdn.example/ad.mp4',
  clickUrl: null,
  durationSeconds: 15,
  weight: 1,
  status: 'ACTIVE',
  validFrom: null,
  validTo: null,
  ...patch,
});

describe('Admin ads (MF-3)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('checks the ad form against the BE limits before sending', () => {
    expect(adInputProblem(input())).toBeNull();
    expect(adInputProblem(input({ title: '  ' }))).toMatch(/tên/);
    expect(adInputProblem(input({ mediaUrl: 'ad.mp4' }))).toMatch(/Link video/);
    expect(adInputProblem(input({ clickUrl: 'shop' }))).toMatch(/Link khi bấm/);
    expect(adInputProblem(input({ durationSeconds: 301 }))).toMatch(/Thời lượng/);
    expect(adInputProblem(input({ weight: 0 }))).toMatch(/Trọng số/);
    expect(adInputProblem(input({ validFrom: '2026-11-02T00:00:00Z', validTo: '2026-11-01T00:00:00Z' }))).toMatch(/trước/);
  });

  it('tells whether the draw can pick an ad right now', () => {
    const now = new Date('2026-10-25T12:00:00Z');
    expect(adLiveState(ad(), now).label).toBe('Đang chạy');
    expect(adLiveState(ad({ status: 'PAUSED' }), now).label).toBe('Tạm dừng');
    expect(adLiveState(ad({ validFrom: '2026-11-01T00:00:00Z' }), now).label).toBe('Chưa tới ngày chạy');
    expect(adLiveState(ad({ validTo: '2026-10-01T00:00:00Z' }), now).label).toBe('Hết hạn');
  });

  it('reads a date input as the start of that day in Vietnam', () => {
    expect(instantOf('2026-11-01')).toBe('2026-10-31T17:00:00.000Z');
    expect(instantOf('')).toBeNull();
    expect(dayOf('2026-11-01T00:00:00.000Z')).toBe('2026-11-01');
  });

  it('creates an ad and pauses one with a status-only patch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ad(), headers: new Headers() });
    vi.stubGlobal('fetch', fetchMock);

    await adAdminService.createAd(input());
    await adAdminService.updateAd('a1', { status: 'PAUSED' });

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/admin\/ads$/);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/admin\/ads\/a1$/);
    expect(fetchMock.mock.calls[1][1].method).toBe('PATCH');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ status: 'PAUSED' });
  });

  it('uploads an ad video from the computer as multipart', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ mediaUrl: 'https://cdn.example/ads/x.mp4' }), headers: new Headers() });
    vi.stubGlobal('fetch', fetchMock);

    const res = await adAdminService.uploadVideo(new File(['mp4'], 'ad.mp4', { type: 'video/mp4' }));

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/admin\/ads\/media$/);
    expect(fetchMock.mock.calls[0][1].body).toBeInstanceOf(FormData);
    expect((fetchMock.mock.calls[0][1].body as FormData).get('file')).toBeInstanceOf(File);
    expect(res.data?.mediaUrl).toBe('https://cdn.example/ads/x.mp4');
  });

  it('fills the video link from the file uploaded in the form, and refuses one over 100 MB', async () => {
    const uploadVideo = vi.spyOn(adAdminService, 'uploadVideo').mockResolvedValue({ success: true, data: { mediaUrl: 'https://cdn.example/ads/x.mp4' } });
    render(<AdFormModal ad={null} busy={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    const picker = screen.getByLabelText('Tải video quảng cáo từ máy');

    const huge = new File(['x'], 'big.mp4', { type: 'video/mp4' });
    Object.defineProperty(huge, 'size', { value: MAX_AD_VIDEO_BYTES + 1 });
    fireEvent.change(picker, { target: { files: [huge] } });
    expect(uploadVideo).not.toHaveBeenCalled();

    fireEvent.change(picker, { target: { files: [new File(['mp4'], 'ad.mp4', { type: 'video/mp4' })] } });
    await waitFor(() => expect(screen.getByDisplayValue('https://cdn.example/ads/x.mp4')).toBeTruthy());
    expect(uploadVideo).toHaveBeenCalledTimes(1);
    uploadVideo.mockRestore();
  });
});
