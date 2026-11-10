/**
 * MF-1 Step 1: Idea and Direction Notes Service (Admin & Creator alignment)
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { ProjectNote, SendProjectNoteInput } from '@/types/projectNote';

const R = API_ROUTES.PRODUCTION;

export const projectNoteService = {
  listNotes: (projectId: string): Promise<ApiResponse<ProjectNote[]>> =>
    apiClient.get<ProjectNote[]>(R.PROJECT_NOTES(projectId)),

  sendNote: (projectId: string, input: SendProjectNoteInput): Promise<ApiResponse<ProjectNote>> =>
    apiClient.post<ProjectNote>(R.PROJECT_NOTES(projectId), input),
};
