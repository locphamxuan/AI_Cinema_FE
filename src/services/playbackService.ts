import { apiClient, ApiResponse, RequestOptions } from './apiClient';
import { randomId } from '@/lib/random';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { AdBreakState, SessionState, StreamingSession, WatchHistoryItem } from '@/types/playback';
import type { Page } from '@/types/production';

/** UUID v4 built from 128 random bits: the BE refuses any other guest key shape. */
export function uuidV4(): string {
  const hex = randomId().split('');
  hex[12] = '4';
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const s = hex.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/** The browser's guest identity for playback, kept so a reload reuses the live session. */
export function guestKey(): string {
  const saved = storage.getString(STORAGE_KEYS.GUEST_KEY);
  if (saved) return saved;
  const key = uuidV4();
  storage.set(STORAGE_KEYS.GUEST_KEY, key);
  return key;
}

/** This browser as a registered device of the member (X-Device-Id, MF-4); kept across sign-outs. */
export function deviceKey(): string {
  const saved = storage.getString(STORAGE_KEYS.DEVICE_ID);
  if (saved) return saved;
  const key = uuidV4();
  storage.set(STORAGE_KEYS.DEVICE_ID, key);
  return key;
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];
const SYSTEMS: [RegExp, string][] = [
  [/Windows/, 'Windows'],
  [/Android/, 'Android'],
  [/iPhone|iPad/, 'iOS'],
  [/Mac OS/, 'macOS'],
  [/Linux/, 'Linux'],
];

/** "Chrome trên Windows": how the member's device list names this browser. */
export function browserName(userAgent: string): string {
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? 'Trình duyệt';
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  return system ? `${browser} trên ${system}` : browser;
}

const isMember = () => !!storage.getString(STORAGE_KEYS.AUTH_TOKEN);

/** A session belongs to a member (bearer token, from a registered device) or a guest (X-Guest-Key), never both. */
function owner(extra: RequestOptions = {}): RequestOptions {
  const identity: Record<string, string> = isMember() ? { 'X-Device-Id': deviceKey() } : { 'X-Guest-Key': guestKey() };
  return { ...extra, headers: { ...identity, ...extra.headers } };
}

const session = (id: string) => `/playback/sessions/${id}`;

export const playbackService = {
  /** POST /playback/sessions - re-verifies access and hands back the stream, ads and resume point. */
  openSession(episodeId: string, key = randomId('play-')): Promise<ApiResponse<StreamingSession>> {
    const body = isMember()
      ? { episodeId, deviceName: browserName(navigator.userAgent), devicePlatform: 'WEB' }
      : { episodeId };
    return apiClient.post<StreamingSession>('/playback/sessions', body, owner({ headers: { 'Idempotency-Key': key } }));
  },

  /** `watchedSeconds` is what actually played since the last beat: 0 keeps a paused session alive without credit. */
  heartbeat(sessionId: string, positionSeconds: number, watchedSeconds: number): Promise<ApiResponse<SessionState>> {
    return apiClient.patch<SessionState>(`${session(sessionId)}/heartbeat`, { positionSeconds, watchedSeconds }, owner());
  },

  /** Survives the page being closed (keepalive), so the stream slot is freed. */
  stop(sessionId: string, positionSeconds: number): Promise<ApiResponse<SessionState>> {
    return apiClient.post<SessionState>(`${session(sessionId)}/stop`, { positionSeconds }, owner({ keepalive: true }));
  },

  /** The BE marks the episode completed only past its completion threshold. */
  complete(sessionId: string, positionSeconds: number): Promise<ApiResponse<SessionState>> {
    return apiClient.post<SessionState>(`${session(sessionId)}/complete`, { positionSeconds }, owner());
  },

  adStarted(sessionId: string, breakId: string, positionSeconds: number): Promise<ApiResponse<AdBreakState>> {
    return apiClient.post<AdBreakState>(`${session(sessionId)}/ad-breaks/${breakId}/played`, { positionSeconds }, owner());
  },

  adFinished(sessionId: string, breakId: string): Promise<ApiResponse<AdBreakState>> {
    return apiClient.post<AdBreakState>(`${session(sessionId)}/ad-breaks/${breakId}/completed`, {}, owner());
  },

  /** GET /playback/history - the member's watch history with resume positions and progress. */
  getHistory(page = 1, limit = 20): Promise<ApiResponse<Page<WatchHistoryItem>>> {
    return apiClient.get<Page<WatchHistoryItem>>(`/playback/history?page=${page}&limit=${limit}`, owner());
  },
};
