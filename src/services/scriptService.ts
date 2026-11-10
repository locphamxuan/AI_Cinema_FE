/**
 * MF-1 Script Workflow Service (Creator writes, Reviewer reviews, Admin approves Final Script)
 */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  FinalReviewScriptInput,
  ProjectScript,
  ReviewScriptInput,
  ScriptVersion,
  SubmitScriptInput,
} from '@/types/script';

const R = API_ROUTES.PRODUCTION;

export const scriptService = {
  getScript: (projectId: string): Promise<ApiResponse<ProjectScript | null>> =>
    apiClient.get<ProjectScript | null>(R.SCRIPT(projectId)),

  submitVersion: (projectId: string, input: SubmitScriptInput): Promise<ApiResponse<ScriptVersion>> =>
    apiClient.post<ScriptVersion>(R.SCRIPT_SUBMIT(projectId), input),

  reviewScript: (projectId: string, input: ReviewScriptInput): Promise<ApiResponse<ProjectScript>> =>
    apiClient.post<ProjectScript>(R.SCRIPT_REVIEW(projectId), input),

  finalReviewScript: (projectId: string, input: FinalReviewScriptInput): Promise<ApiResponse<ProjectScript>> =>
    apiClient.post<ProjectScript>(R.SCRIPT_FINAL_REVIEW(projectId), input),
};
