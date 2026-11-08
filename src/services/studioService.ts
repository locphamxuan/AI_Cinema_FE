/**
 * Partner studios (BR-59), their STUDIO login accounts, and the hand-offs (BR-58): the catalog the Admin keeps,
 * the hand-off the signed contract opens, a studio change with its brief and material, and the milestones.
 */
import { apiClient } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  ChangeStudioInput,
  StudioAccount,
  StudioHandoff,
  Studio,
  StudioInput,
  StudioMilestoneStatus,
} from '@/types/production';

const S = API_ROUTES.STUDIOS;
const R = API_ROUTES.PRODUCTION;

/** Multipart body of a studio change: the new studio and season. */
export function handoffForm(input: ChangeStudioInput): FormData {
  const form = new FormData();
  if (input.studioId) form.append('studioId', input.studioId);
  if (input.studioEmail) form.append('studioEmail', input.studioEmail);
  if (input.studioName) form.append('studioName', input.studioName);
  if (input.studioPhone) form.append('studioPhone', input.studioPhone);
  if (input.seasonId) form.append('seasonId', input.seasonId);
  form.append('reason', input.reason);
  form.append('offeredFeeVnd', String(input.offeredFeeVnd));
  if (input.forfeitedVnd) form.append('forfeitedVnd', String(input.forfeitedVnd));
  return form;
}

export const studioService = {
  // ---- Catalog ----
  list: (active?: boolean) => apiClient.get<Studio[]>(active === undefined ? S.LIST : `${S.LIST}?active=${active}`),
  create: (input: StudioInput) => apiClient.post<Studio>(S.LIST, input),
  update: (studioId: string, input: Partial<StudioInput>) => apiClient.patch<Studio>(S.DETAIL(studioId), input),
  remove: (studioId: string) => apiClient.delete<null>(S.DETAIL(studioId)),

  // ---- STUDIO login accounts (Admin, user:manage) ----
  accounts: (studioId: string) => apiClient.get<StudioAccount[]>(S.ACCOUNTS(studioId)),
  createAccount: (studioId: string, input: { email: string; fullName: string; password: string }) =>
    apiClient.post<StudioAccount>(S.ACCOUNTS(studioId), input),

  // ---- Hand-off: opened by the signed contract; the lead Creator changes studio and moves milestones ----
  changeStudio: (movieId: string, input: ChangeStudioInput) =>
    apiClient.postForm<StudioHandoff[]>(R.STUDIO_CHANGE(movieId), handoffForm(input)),
  /** Studio timeline: every hand-off with its materials and milestone events, newest first. */
  listHandoffs: (movieId: string) => apiClient.get<StudioHandoff[]>(R.HANDOFFS(movieId)),
  downloadBrief: (movieId: string, handoffId: string) => apiClient.getBlob(R.BRIEF(movieId, handoffId)),
  downloadMaterial: (movieId: string, handoffId: string, materialId: string) =>
    apiClient.getBlob(R.MATERIAL(movieId, handoffId, materialId)),
  /** DELIVERED needs the Submission (mediaAssetId) the Creator uploaded from the studio's delivery. */
  updateMilestone: (
    movieId: string,
    handoffId: string,
    input: { status: Exclude<StudioMilestoneStatus, 'BRIEF_SENT' | 'SUPERSEDED'>; note?: string; mediaAssetId?: string },
  ) => apiClient.patch<StudioHandoff>(R.MILESTONE(movieId, handoffId), input),
};
