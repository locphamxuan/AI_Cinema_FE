/**
 * MF-1 API: movie projects, media delivery, review, labels, compliance and publishing.
 * Every call answers with ApiResponse; the backend checks permissions and project ownership.
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  ComplianceInput,
  CreateProjectInput,
  Episode,
  EpisodeNote,
  CostLedger,
  Genre,
  MediaAsset,
  MovieStatus,
  NewEpisodeInput,
  NewSeasonInput,
  UpdateEpisodeInput,
  UpdateSeasonInput,
  Page,
  PlatformSettings,
  Person,
  PriceAlert,
  PriceAlertStatus,
  ProjectDetail,
  ProjectEvent,
  ProjectSummary,
  Publication,
  ReviewDecision,
  ReviewSheet,
  UnpublishMode,
  UnpublishReason,
  UpdateProjectInput,
  LabelType,
  LabelLocation,
  IdeaFile,
  IdeaFilePurpose,
} from '@/types/production';

const R = API_ROUTES.PRODUCTION;

/** Active accounts of one role, read from the user list. */
async function listActive(role: 'CONTENT_CREATOR' | 'CONTENT_REVIEWER', search?: string): Promise<ApiResponse<Person[]>> {
  const params = new URLSearchParams({ limit: '50', 'filter.role': `$eq:${role}`, 'filter.isActive': '$eq:true' });
  if (search?.trim()) params.set('search', search.trim());
  const res = await apiClient.get<Page<Person>>(`${API_ROUTES.ADMIN.USERS}?${params.toString()}`);
  return { ...res, data: res.success ? res.data.data : [] };
}

export interface ProjectQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: MovieStatus[];
}

export function projectsUrl({ page = 1, limit = 12, search, status }: ProjectQuery = {}, path: string = R.PROJECTS): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: 'updatedAt:DESC' });
  if (search?.trim()) params.set('search', search.trim());
  if (status?.length) params.set('filter.status', status.length === 1 ? `$eq:${status[0]}` : `$in:${status.join(',')}`);
  return `${path}?${params.toString()}`;
}

export const productionService = {
  // ---- Projects (MF-1 step 1: the Admin creates them and assigns the lead Creator) ----
  listProjects: (query?: ProjectQuery) => apiClient.get<Page<ProjectSummary>>(projectsUrl(query)),
  getProject: (movieId: string) => apiClient.get<ProjectDetail>(R.PROJECT(movieId)),
  createProject: (input: CreateProjectInput) => apiClient.post<ProjectDetail>(R.PROJECTS, input),
  updateProject: (movieId: string, input: UpdateProjectInput) => apiClient.patch<ProjectDetail>(R.PROJECT(movieId), input),
  assignCreator: (movieId: string, creatorId: string) => apiClient.post<null>(R.ASSIGN(movieId), { creatorId }),
  cancelProject: (movieId: string, reason: string) => apiClient.post<null>(R.CANCEL(movieId), { reason }),
  listEvents: (movieId: string) => apiClient.get<ProjectEvent[]>(R.EVENTS(movieId)),

  addSeason: (movieId: string, input: NewSeasonInput) => apiClient.post<unknown>(R.SEASONS(movieId), input),
  addEpisode: (seasonId: string, input: NewEpisodeInput) => apiClient.post<Episode>(R.SEASON_EPISODES(seasonId), input),
  updateSeason: (seasonId: string, input: UpdateSeasonInput) => apiClient.patch<unknown>(R.SEASON(seasonId), input),
  updateEpisode: (episodeId: string, input: UpdateEpisodeInput) => apiClient.patch<Episode>(R.EPISODE(episodeId), input),
  uploadPoster(movieId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return apiClient.postForm<{ posterUrl: string }>(R.POSTER(movieId), form);
  },
  uploadThumbnail(episodeId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return apiClient.postForm<{ thumbnailUrl: string }>(R.EPISODE_THUMBNAIL(episodeId), form);
  },

  /** IDEA travels with the studio brief; SYNOPSIS backs the summary for viewers. */
  uploadIdeaFile(movieId: string, file: File, purpose: IdeaFilePurpose = 'IDEA') {
    const form = new FormData();
    form.append('file', file);
    return apiClient.postForm<IdeaFile>(`${R.IDEA_FILES(movieId)}?purpose=${purpose}`, form);
  },
  deleteIdeaFile: (movieId: string, fileId: string) => apiClient.delete<null>(R.IDEA_FILE(movieId, fileId)),
  downloadIdeaFile: (movieId: string, fileId: string) => apiClient.getBlob(R.IDEA_FILE_CONTENT(movieId, fileId)),

  // ---- Production cost (VND, BR-45/46) ----
  getCosts: (movieId: string) => apiClient.get<CostLedger>(R.COSTS(movieId)),
  /** Admin: BUDGET once, then CORRECTION with a reason; ADDITIONAL only comes from an approved cost request. */
  addCostEntry: (movieId: string, entry: { entryType: 'BUDGET' | 'CORRECTION'; amountVnd: number; reason?: string }) =>
    apiClient.post<CostLedger>(R.COST_ENTRIES(movieId), entry),

  // ---- Media the studio delivered on Studio Web (steps 5–7, read-only here) ----
  listMedia: (episodeId: string) => apiClient.get<MediaAsset[]>(R.EPISODE_MEDIA(episodeId)),

  // ---- Notes between the Creator holding an episode and the lead (BR-67) ----
  listEpisodeNotes: (episodeId: string) => apiClient.get<EpisodeNote[]>(R.EPISODE_NOTES(episodeId)),
  sendEpisodeNote: (episodeId: string, message: string) =>
    apiClient.post<EpisodeNote[]>(R.EPISODE_NOTES(episodeId), { message }),

  // ---- Review, AI label, compliance (steps 8–11) ----
  getReviewSheet: (mediaAssetId: string) => apiClient.get<ReviewSheet>(R.REVIEW_SHEET(mediaAssetId)),
  review: (mediaAssetId: string, decision: ReviewDecision, comments?: string) =>
    apiClient.post<ReviewSheet>(R.REVIEWS(mediaAssetId), { decision, ...(comments?.trim() ? { comments: comments.trim() } : {}) }),
  applyLabel: (mediaAssetId: string, label: { labelType: LabelType; labelText: string; displayLocation?: LabelLocation }) =>
    apiClient.post<ReviewSheet>(R.AI_LABELS(mediaAssetId), label),
  runCompliance: (mediaAssetId: string, input: ComplianceInput) => apiClient.post<ReviewSheet>(R.COMPLIANCE(mediaAssetId), input),

  // ---- Final Film (MF-1 §5–6): the Reviewer confirms, the Admin publishes or sends it back ----
  confirmFinalFilm: (episodeId: string) => apiClient.post<Episode>(R.FINAL_CONFIRMATION(episodeId), {}),
  rejectFinalFilm: (episodeId: string, reason: string) =>
    apiClient.post<Episode>(R.FINAL_REJECTION(episodeId), { reason: reason.trim() }),

  // ---- Publishing (steps 12–16) ----
  setCoinPrice: (episodeId: string, coinPrice: number) => apiClient.patch<unknown>(R.COIN_PRICE(episodeId), { coinPrice }),
  listPublications: (episodeId: string) => apiClient.get<Publication[]>(R.PUBLICATIONS(episodeId)),
  publish: (episodeId: string, scheduledAt?: string) =>
    apiClient.post<Publication>(R.PUBLICATIONS(episodeId), scheduledAt ? { scheduledAt } : {}),
  unpublish: (publicationId: string, input: { mode?: UnpublishMode; reason: UnpublishReason; note: string }) =>
    apiClient.post<Publication>(R.UNPUBLISH(publicationId), input),

  // ---- Admin price alerts (BR-47) ----
  listPriceAlerts(page = 1, status?: PriceAlertStatus) {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('filter.status', `$eq:${status}`);
    return apiClient.get<Page<PriceAlert>>(`${R.PRICE_ALERTS}?${params.toString()}`);
  },
  requestPriceChange: (alertId: string, note: string) => apiClient.post<PriceAlert>(R.PRICE_ALERT_REQUEST_CHANGE(alertId), { note }),
  resolvePriceAlert: (alertId: string) => apiClient.post<PriceAlert>(R.PRICE_ALERT_RESOLVE(alertId)),

  // ---- Lookups ----
  async listGenres(): Promise<ApiResponse<Genre[]>> {
    const res = await apiClient.get<Page<Genre>>(`${API_ROUTES.GENRES.LIST}?limit=100`);
    return { ...res, data: res.success ? res.data.data : [] };
  },
  /** An existing name (ignoring case) answers with that genre instead of a duplicate. */
  createGenre: (name: string) => apiClient.post<Genre>(API_ROUTES.GENRES.LIST, { name }),
  /** Active Content Creators the Admin can assign as lead (needs user:read). */
  listCreators: (search?: string) => listActive('CONTENT_CREATOR', search),
  /** Active Content Reviewers the Admin can put in charge of a project (needs user:read). */
  listReviewers: (search?: string) => listActive('CONTENT_REVIEWER', search),
  getPlatformSettings: () => apiClient.get<PlatformSettings>(API_ROUTES.PLATFORM_SETTINGS),
  updatePlatformSettings: (input: Partial<PlatformSettings>) =>
    apiClient.patch<PlatformSettings>(API_ROUTES.PLATFORM_SETTINGS, input),
};
