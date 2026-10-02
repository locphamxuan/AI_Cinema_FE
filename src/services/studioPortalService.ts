/**
 * AI Cinema - the outside studio's portal (no account: the emailed link token is the credential).
 */
import { API_ROUTES } from '@/constants/apiRoutes';
import type { MediaMetadataInput } from '@/types/production-requests';
import type { PortalDelivery, StudioPortalOverview, StudioRespondInput } from '@/types/studio-portal';
import { apiClient } from './apiClient';
import { mediaForm } from './productionService';

const P = API_ROUTES.STUDIO_PORTAL;

export const studioPortalService = {
  overview: (token: string) => apiClient.get<StudioPortalOverview>(P.OVERVIEW(token)),
  respond: (token: string, input: StudioRespondInput) => apiClient.post<StudioPortalOverview>(P.RESPOND(token), input),
  downloadBrief: (token: string) => apiClient.getBlob(P.BRIEF(token)),
  downloadIdeaFile: (token: string, fileId: string) => apiClient.getBlob(P.IDEA_FILE(token, fileId)),
  submitMediaLink: (
    token: string,
    episodeId: string,
    input: MediaMetadataInput & { sourceMethod: 'HLS_URL' | 'REMOTE_FILE'; sourceUrl: string },
  ) => apiClient.post<PortalDelivery>(P.MEDIA(token, episodeId), input),
  uploadMedia: (token: string, episodeId: string, file: File, input: MediaMetadataInput) =>
    apiClient.postForm<PortalDelivery>(P.MEDIA_UPLOAD(token, episodeId), mediaForm(file, input)),
};
