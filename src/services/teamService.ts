/** Creators of a project (BR-13): the team, episode assignment and delegation, plus the requests sent to the Admin (BR-55). */
import { apiClient } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { ChangeRequest, ChangeRequestInput, ChangeRequestStatus, CreatorSeat, Episode, Person } from '@/types/production';

const R = API_ROUTES.PRODUCTION;

/** Multipart body of a change request: the text fields and, optionally, the proof file. */
export function changeRequestForm(input: ChangeRequestInput): FormData {
  const form = new FormData();
  form.append('requestType', input.requestType);
  form.append('content', input.content);
  form.append('reason', input.reason);
  if (input.requestedTokens !== undefined) form.append('requestedTokens', String(input.requestedTokens));
  if (input.seasonId) form.append('seasonId', input.seasonId);
  if (input.episodeId) form.append('episodeId', input.episodeId);
  if (input.proof) form.append('proof', input.proof);
  return form;
}

export const teamService = {
  /** Active Content Creators one can add to a project or delegate episodes to. */
  directory: () => apiClient.get<Person[]>(R.CREATOR_DIRECTORY),
  listCreators: (movieId: string) => apiClient.get<CreatorSeat[]>(R.CREATORS(movieId)),
  addCreator: (movieId: string, creatorId: string, note?: string) =>
    apiClient.post<CreatorSeat[]>(R.CREATORS(movieId), { creatorId, ...(note ? { note } : {}) }),
  removeCreator: (movieId: string, creatorId: string) => apiClient.delete<CreatorSeat[]>(R.CREATOR(movieId, creatorId)),
  /** Creator 1 hands episodes to Creator 2. */
  delegate: (movieId: string, input: { toCreatorId: string; episodeIds: string[]; note?: string }) =>
    apiClient.post<CreatorSeat[]>(R.DELEGATIONS(movieId), input),
  /** creatorId null hands the episode back to the whole team. */
  assignEpisode: (episodeId: string, creatorId: string | null) =>
    apiClient.put<Episode>(R.EPISODE_ASSIGNEE(episodeId), { creatorId }),
};

export const changeRequestService = {
  list: (movieId: string) => apiClient.get<ChangeRequest[]>(R.CHANGE_REQUESTS(movieId)),
  propose: (movieId: string, input: ChangeRequestInput) =>
    apiClient.postForm<ChangeRequest>(R.CHANGE_REQUESTS(movieId), changeRequestForm(input)),
  /** The Admin's inbox, the open requests first. */
  inbox: (status?: ChangeRequestStatus) =>
    apiClient.get<ChangeRequest[]>(status ? `${R.CHANGE_REQUEST_INBOX}?status=${status}` : R.CHANGE_REQUEST_INBOX),
  downloadProof: (id: string) => apiClient.getBlob(R.CHANGE_REQUEST_PROOF(id)),
  approve: (id: string, response?: string) =>
    apiClient.post<ChangeRequest>(R.CHANGE_REQUEST_APPROVE(id), response ? { response } : {}),
  reject: (id: string, response: string) => apiClient.post<ChangeRequest>(R.CHANGE_REQUEST_REJECT(id), { response }),
};
