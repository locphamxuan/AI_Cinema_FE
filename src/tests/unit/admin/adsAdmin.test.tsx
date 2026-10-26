import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_AD_VIDEO_BYTES, adAdminService, adInputProblem } from '@/services/adAdminService';
import { adLiveState } from '@/features/admin/components/AdsPanel';
import { AdFormModal } from '@/features/admin/components/AdFormModal';
import type { AdminAd, AdInput } from '@/types/playback';

const input = (patch: Partial<AdInput> = {}): AdInput => ({
  title: 'Trà sữa',
  mediaUrl: 'https://cdn.example/ad.mp4',
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
  ...patch,
});

describe('Admin ads (MF-3)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('checks the ad form against the BE limits before sending', () => {
    expect(adInputProblem(input())).toBeNull();
    expect(adInputProblem(input({ title: '  ' }))).toMatch(/tên/);
    expect(adInputProblem(input({ mediaUrl: 'ad.mp4' }))).toMatch(/Link video/);
    expect(adInputProblem(input({ clickUrl: 'shop' }))).toMatch(/Link khi bấm/);
    expect(adInputProblem(input({ weight: 0 }))).toMatch(/Trọng số/);
  });

  it('tells whether the draw can pick an ad: active until the Admin pauses it', () => {
    expect(adLiveState(ad()).label).toBe('Đang chạy');
    expect(adLiveState(ad({ status: 'PAUSED' })).label).toBe('Tạm dừng');
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
