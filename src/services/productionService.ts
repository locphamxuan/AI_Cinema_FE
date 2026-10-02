/**
 * MF-1 API: movie projects, studio handoff, media delivery, review, labels, compliance and publishing.
 * Every call answers with ApiResponse; the backend checks permissions and project ownership.
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  AppNotification,
  ChangeRequest,
  ComplianceInput,
  CreateProjectInput,
  DueDateInput,
  Episode,
  FeeLedger,
  Genre,
  MediaAsset,
  MediaMetadataInput,
  MovieStatus,
  NewEpisodeInput,
  NewSeasonInput,
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
  StudioHandoff,
  StudioInput,
  TokenEntryType,
  UnpublishMode,
  UnpublishReason,
  UpdateProjectInput,
  LabelType,
  LabelLocation,
  IdeaFile,
} from '@/types/production';

const R = API_ROUTES.PRODUCTION;

export interface ProjectQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: MovieStatus[];
}

export function projectsUrl({ page = 1, limit = 12, search, status }: ProjectQuery = {}): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: 'updatedAt:DESC' });
  if (search?.trim()) params.set('search', search.trim());
  if (status?.length) params.set('filter.status', status.length === 1 ? `$eq:${status[0]}` : `$in:${status.join(',')}`);
  return `${R.PROJECTS}?${params.toString()}`;
}

export const productionService = {
  // ---- Projects (steps 1–2) ----
  listProjects: (query?: ProjectQuery) => apiClient.get<Page<ProjectSummary>>(projectsUrl(query)),
  getProject: (movieId: string) => apiClient.get<ProjectDetail>(R.PROJECT(movieId)),
  createProject: (input: CreateProjectInput) => apiClient.post<ProjectDetail>(R.PROJECTS, input),
  updateProject: (movieId: string, input: UpdateProjectInput) => apiClient.patch<ProjectDetail>(R.PROJECT(movieId), input),
  assignCreator: (movieId: string, creatorId: string) => apiClient.post<null>(R.ASSIGN(movieId), { creatorId }),
  cancelProject: (movieId: string, reason: string) => apiClient.post<null>(R.CANCEL(movieId), { reason }),
  listEvents: (movieId: string) => apiClient.get<ProjectEvent[]>(R.EVENTS(movieId)),

  addSeason: (movieId: string, input: NewSeasonInput) => apiClient.post<unknown>(R.SEASONS(movieId), input),
  addEpisode: (seasonId: string, input: NewEpisodeInput) => apiClient.post<Episode>(R.SEASON_EPISODES(seasonId), input),
  updateEpisode: (episodeId: string, input: Partial<NewEpisodeInput>) => apiClient.patch<Episode>(R.EPISODE(episodeId), input),

  listIdeaFiles: (movieId: string) => apiClient.get<IdeaFile[]>(R.IDEA_FILES(movieId)),
  uploadIdeaFile(movieId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return apiClient.postForm<IdeaFile>(R.IDEA_FILES(movieId), form);
  },
  deleteIdeaFile: (movieId: string, fileId: string) => apiClient.delete<null>(R.IDEA_FILE(movieId, fileId)),
  downloadIdeaFile: (movieId: string, fileId: string) => apiClient.getBlob(R.IDEA_FILE_CONTENT(movieId, fileId)),

  // ---- Production fee (Token, BR-45/46/50) ----
  getFee: (movieId: string) => apiClient.get<FeeLedger>(R.FEE(movieId)),
  addFeeEntry: (movieId: string, entry: { entryType: TokenEntryType; amountTokens: number; reason?: string }) =>
    apiClient.post<FeeLedger>(R.FEE_ENTRIES(movieId), entry),

  // ---- Admin proposals (BR-55) ----
  listChangeRequests: (movieId: string) => apiClient.get<ChangeRequest[]>(R.CHANGE_REQUESTS(movieId)),
  proposeChange: (movieId: string, content: string, episodeId?: string) =>
    apiClient.post<ChangeRequest>(R.CHANGE_REQUESTS(movieId), { content, ...(episodeId ? { episodeId } : {}) }),
  acceptChange: (id: string, response?: string) =>
    apiClient.post<ChangeRequest>(R.CHANGE_REQUEST_ACCEPT(id), response ? { response } : {}),
  rejectChange: (id: string, response: string) => apiClient.post<ChangeRequest>(R.CHANGE_REQUEST_REJECT(id), { response }),

  // ---- Studio handoff (steps 3–4) ----
  handOff: (movieId: string, studio: StudioInput, dueDates: DueDateInput[]) =>
    apiClient.post<unknown>(R.HANDOFF(movieId), { ...studio, dueDates }),
  changeStudio: (movieId: string, studio: StudioInput, reason: string) =>
    apiClient.post<unknown>(R.STUDIO_CHANGE(movieId), { ...studio, reason }),
  setDueDates: (movieId: string, dueDates: DueDateInput[]) => apiClient.put<unknown>(R.DUE_DATES(movieId), { dueDates }),
  listHandoffs: (movieId: string) => apiClient.get<StudioHandoff[]>(R.HANDOFFS(movieId)),
  downloadBrief: (movieId: string, handoffId: string) => apiClient.getBlob(R.BRIEF(movieId, handoffId)),

  // ---- Media delivery (steps 5–7) ----
  listMedia: (episodeId: string) => apiClient.get<MediaAsset[]>(R.EPISODE_MEDIA(episodeId)),
  getMedia: (mediaAssetId: string) => apiClient.get<MediaAsset>(R.MEDIA_ASSET(mediaAssetId)),
  submitMediaLink: (
    episodeId: string,
    input: MediaMetadataInput & { sourceMethod: 'HLS_URL' | 'REMOTE_FILE'; sourceUrl: string },
  ) => apiClient.post<MediaAsset>(R.EPISODE_MEDIA(episodeId), input),
  uploadMedia(episodeId: string, file: File, input: MediaMetadataInput) {
    const form = new FormData();
    form.append('file', file);
    form.append('proposedLabelType', input.proposedLabelType);
    if (input.submissionNote) form.append('submissionNote', input.submissionNote);
    form.append('aiDisclosure', JSON.stringify(input.aiDisclosure));
    return apiClient.postForm<MediaAsset>(R.EPISODE_MEDIA_UPLOAD(episodeId), form);
  },
  retryMedia: (mediaAssetId: string) => apiClient.post<MediaAsset>(R.MEDIA_RETRY(mediaAssetId)),

  // ---- Review, AI label, compliance (steps 8–11) ----
  getReviewSheet: (mediaAssetId: string) => apiClient.get<ReviewSheet>(R.REVIEW_SHEET(mediaAssetId)),
  review: (mediaAssetId: string, decision: ReviewDecision, comments?: string) =>
    apiClient.post<ReviewSheet>(R.REVIEWS(mediaAssetId), { decision, ...(comments?.trim() ? { comments: comments.trim() } : {}) }),
  applyLabel: (mediaAssetId: string, label: { labelType: LabelType; labelText: string; displayLocation?: LabelLocation }) =>
    apiClient.post<ReviewSheet>(R.AI_LABELS(mediaAssetId), label),
  runCompliance: (mediaAssetId: string, input: ComplianceInput) => apiClient.post<ReviewSheet>(R.COMPLIANCE(mediaAssetId), input),

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
  /** Active Content Creators a Reviewer can assign (the Reviewer holds user:read). */
  async listCreators(search?: string): Promise<ApiResponse<Person[]>> {
    const params = new URLSearchParams({ limit: '50', 'filter.role': '$eq:CONTENT_CREATOR', 'filter.isActive': '$eq:true' });
    if (search?.trim()) params.set('search', search.trim());
    const res = await apiClient.get<Page<Person>>(`${API_ROUTES.ADMIN.USERS}?${params.toString()}`);
    return { ...res, data: res.success ? res.data.data : [] };
  },
  getPlatformSettings: () => apiClient.get<PlatformSettings>(API_ROUTES.PLATFORM_SETTINGS),
  updatePlatformSettings: (input: Partial<PlatformSettings>) =>
    apiClient.patch<PlatformSettings>(API_ROUTES.PLATFORM_SETTINGS, input),

  // ---- Notifications (BR-53: internal alerts are in-app) ----
  listNotifications: () => apiClient.get<Page<AppNotification>>(`${API_ROUTES.NOTIFICATIONS.LIST}?limit=15`),
  unreadCount: () => apiClient.get<{ unread: number }>(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT),
  markRead: (id: string) => apiClient.patch<unknown>(API_ROUTES.NOTIFICATIONS.READ(id)),
  markAllRead: () => apiClient.patch<unknown>(API_ROUTES.NOTIFICATIONS.READ_ALL),
};
