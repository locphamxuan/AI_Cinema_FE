import { apiClient, ApiResponse, RequestOptions } from './apiClient';
import { randomId } from '@/lib/random';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { AdBreakState, SessionState, StreamingSession } from '@/types/playback';

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

/** A session belongs to a member (bearer token) or a guest (X-Guest-Key), never both. */
function owner(extra: RequestOptions = {}): RequestOptions {
  const member = !!storage.getString(STORAGE_KEYS.AUTH_TOKEN);
  return { ...extra, headers: { ...(member ? {} : { 'X-Guest-Key': guestKey() }), ...extra.headers } };
}

const session = (id: string) => `/playback/sessions/${id}`;

export const playbackService = {
  /** POST /playback/sessions - re-verifies access and hands back the stream, ads and resume point. */
  openSession(episodeId: string, key = randomId('play-')): Promise<ApiResponse<StreamingSession>> {
    return apiClient.post<StreamingSession>('/playback/sessions', { episodeId }, owner({ headers: { 'Idempotency-Key': key } }));
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
};
