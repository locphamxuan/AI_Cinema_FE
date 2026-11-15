/** The Admin's mid-roll ads (AI_Cinema_BE /admin/ads and /admin/episodes/:id/ad-slots, BR-32). */
import type { AdInput, AdminAd, EpisodeAdSlotInput, EpisodeAdSlots } from '@/types/playback';
import { apiClient, ApiResponse } from './apiClient';

/** Bounds of the BE (ad-limits.ts): a longer video stops being a mid-roll, a heavier weight wins every draw. */
export const MAX_AD_DURATION_SECONDS = 300;
export const MAX_AD_WEIGHT = 1000;
/** The BE (ad-media.service.ts) takes an MP4 of at most 100 MB. */
export const MAX_AD_VIDEO_BYTES = 100 * 1024 * 1024;

/** BR-32: the BE refuses more cues than this on one episode. */
export const MAX_AD_SLOTS_PER_EPISODE = 20;

export const adAdminService = {
  async ads(): Promise<ApiResponse<AdminAd[]>> {
    const res = await apiClient.get<{ data: AdminAd[] }>('/admin/ads?limit=100');
    return res.success && res.data ? { ...res, data: res.data.data } : { ...res, data: [] };
  },
  /** Uploads an ad video from the computer; the answered link is what the ad is created with. */
  uploadVideo(file: File) {
    const form = new FormData();
    form.append('file', file);
    return apiClient.postForm<{ mediaUrl: string }>('/admin/ads/media', form);
  },
  createAd: (input: AdInput) => apiClient.post<AdminAd>('/admin/ads', input),
  /** Edits an ad; `{ status }` alone pauses or resumes it. */
  updateAd: (id: string, input: Partial<AdInput>) => apiClient.patch<AdminAd>(`/admin/ads/${id}`, input),
  slots: (episodeId: string) => apiClient.get<EpisodeAdSlots>(`/admin/episodes/${episodeId}/ad-slots`),
  /** Replaces every cue of the episode; an empty list goes back to random cues. */
  saveSlots: (episodeId: string, slots: EpisodeAdSlotInput[]) =>
    apiClient.put<EpisodeAdSlots>(`/admin/episodes/${episodeId}/ad-slots`, { slots }),
};

/** Cues the BE would refuse, checked before saving: same second twice, or past the episode end. */
export function adSlotProblem(slots: EpisodeAdSlotInput[], durationSeconds: number | null): string | null {
  const positions = slots.map((s) => s.positionSeconds);
  if (positions.some((p) => !Number.isInteger(p) || p < 1)) return 'Mỗi vị trí phải là số giây nguyên từ 1 trở lên.';
  if (new Set(positions).size !== positions.length) return 'Hai lần chèn không được trùng cùng một giây.';
  if (durationSeconds !== null && positions.some((p) => p >= durationSeconds)) {
    return `Vị trí phải nhỏ hơn độ dài tập (${durationSeconds} giây).`;
  }
  if (slots.length > MAX_AD_SLOTS_PER_EPISODE) return `Tối đa ${MAX_AD_SLOTS_PER_EPISODE} lần chèn mỗi tập.`;
  return null;
}

/** What the BE would refuse in an ad form, checked before sending. */
export function adInputProblem(input: AdInput): string | null {
  if (!input.title.trim()) return 'Nhập tên quảng cáo.';
  if (!/^https?:\/\/\S+$/i.test(input.mediaUrl)) return 'Link video phải bắt đầu bằng http:// hoặc https://.';
  if (input.clickUrl && !/^https?:\/\/\S+$/i.test(input.clickUrl)) return 'Link khi bấm phải bắt đầu bằng http:// hoặc https://.';
  const weight = input.weight ?? 1;
  if (!Number.isInteger(weight) || weight < 1 || weight > MAX_AD_WEIGHT) return `Trọng số từ 1 đến ${MAX_AD_WEIGHT}.`;
  return null;
}
