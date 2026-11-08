/**
 * MF-1 §2 script of a project: the lead Creator writes and submits versions, the Reviewer in charge approves or
 * sends back, then the Admin approves the Final Script (which sends the studio its template contract) or sends it
 * back to the Creator. Ideas are aligned beforehand in the project notes.
 */
import { apiClient } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { FinalScriptReviewInput, ProjectNote, ProjectScript } from '@/types/production';

const R = API_ROUTES.PRODUCTION;

/** A comment is only sent when there is one; the API needs it to send a script back. */
const withComment = (approve: boolean, comment?: string) => ({ approve, ...(comment?.trim() ? { comment: comment.trim() } : {}) });

export const scriptService = {
  /** null before the Creator's first submission. */
  get: (movieId: string) => apiClient.get<ProjectScript | null>(R.SCRIPT(movieId)),
  /** Lead Creator: a new version, before the first review or once the script was sent back. */
  submit: (movieId: string, content: string, note?: string) =>
    apiClient.post<ProjectScript>(R.SCRIPT_VERSIONS(movieId), { content, ...(note?.trim() ? { note: note.trim() } : {}) }),
  /** Reviewer: pass the submitted version on to the Admin, or send it back with a comment. */
  review: (movieId: string, approve: boolean, comment?: string) =>
    apiClient.post<ProjectScript>(R.SCRIPT_REVIEW(movieId), withComment(approve, comment)),
  /** Admin: approve the Final Script (optionally picking the studio and the contract terms) or send it back. */
  finalReview: (movieId: string, input: FinalScriptReviewInput) =>
    apiClient.post<ProjectScript>(R.SCRIPT_FINAL_REVIEW(movieId), {
      ...withComment(input.approve, input.comment),
      ...(input.approve && input.studioId ? { studioId: input.studioId } : {}),
      ...(input.approve && input.terms?.trim() ? { terms: input.terms.trim() } : {}),
    }),
};

/** MF-1 §1: notes on the idea and direction between the Admin, the lead Creator and the Reviewer, oldest first. */
export const projectNoteService = {
  list: (movieId: string) => apiClient.get<ProjectNote[]>(R.NOTES(movieId)),
  send: (movieId: string, message: string) => apiClient.post<ProjectNote[]>(R.NOTES(movieId), { message }),
};
