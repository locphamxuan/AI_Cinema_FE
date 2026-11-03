import { describe, it, expect } from 'vitest';
import { resolveApiBaseUrl } from '@/constants/apiRoutes';
import { isHlsUrl } from '@/components/watch/useHlsPlayer';

describe('resolveApiBaseUrl', () => {
  it('roots a relative base so nested pages (/watch/:id) still reach /api', () => {
    expect(resolveApiBaseUrl('api')).toBe('/api');
    expect(resolveApiBaseUrl('/api')).toBe('/api');
  });

  it('keeps an absolute URL and falls back to /api when unset or pointing at port 3001', () => {
    expect(resolveApiBaseUrl('https://cinema.example/api')).toBe('https://cinema.example/api');
    expect(resolveApiBaseUrl(undefined)).toBe('/api');
    expect(resolveApiBaseUrl('http://localhost:3001/api')).toBe('/api');
  });
});

describe('isHlsUrl', () => {
  it('tells an HLS playlist from an MP4 the video element plays itself', () => {
    expect(isHlsUrl('https://cdn/ep/master.m3u8')).toBe(true);
    expect(isHlsUrl('https://cdn/ep/master.m3u8?token=1')).toBe(true);
    expect(isHlsUrl('https://cdn/catalog/she-raised-a-monster/episode-1.mp4')).toBe(false);
  });
});
