/**
 * Partner studios (BR-59) and the hand-off of a project or season to one of them (BR-58): the catalog the
 * Reviewer keeps, the brief and material emailed to the studio, and the milestones the Creator records.
 */
import { apiClient } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  ChangeStudioInput,
  HandOffInput,
  StudioHandoff,
  Studio,
  StudioInput,
  StudioMilestoneStatus,
} from '@/types/production';

const S = API_ROUTES.STUDIOS;
const R = API_ROUTES.PRODUCTION;

/** Multipart body of a hand-off: the choice of studio and season plus the files that go with the brief. */
export function handoffForm(input: HandOffInput & { reason?: string }): FormData {
  const form = new FormData();
  if (input.studioId) form.append('studioId', input.studioId);
  if (input.studioEmail) form.append('studioEmail', input.studioEmail);
  if (input.studioName) form.append('studioName', input.studioName);
  if (input.studioPhone) form.append('studioPhone', input.studioPhone);
  if (input.seasonId) form.append('seasonId', input.seasonId);
  if (input.reason) form.append('reason', input.reason);
  for (const file of input.scripts ?? []) form.append('scripts', file);
  for (const file of input.references ?? []) form.append('references', file);
  return form;
}

export const studioService = {
  // ---- Catalog ----
  list: (active?: boolean) => apiClient.get<Studio[]>(active === undefined ? S.LIST : `${S.LIST}?active=${active}`),
  create: (input: StudioInput) => apiClient.post<Studio>(S.LIST, input),
  update: (studioId: string, input: Partial<StudioInput>) => apiClient.patch<Studio>(S.DETAIL(studioId), input),
  remove: (studioId: string) => apiClient.delete<null>(S.DETAIL(studioId)),

  // ---- Hand-off (steps 3–4) ----
  handOff: (movieId: string, input: HandOffInput) =>
    apiClient.postForm<StudioHandoff[]>(R.HANDOFF(movieId), handoffForm(input)),
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
