/** MF-5 support desk of Staff and Admin: the queue, one case, its member context and the actions on it. */
import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Page } from '@/types/production';
import type {
  MemberContext,
  StaffAiSuggestion,
  SupportCase,
  SupportCaseDetail,
  SupportMessage,
  SupportPriority,
  SupportQueueStats,
  SupportStatus,
} from '@/types/support';

const S = API_ROUTES.ADMIN_SUPPORT;

export interface QueueFilters {
  status?: SupportStatus;
  priority?: SupportPriority;
  /** A Staff id, or 'NONE' for the cases nobody has claimed. */
  assignee?: string;
}

/** `?page&limit&filter.*` in the `@nestarc/pagination` dialect of the backend. */
export function queueQuery(page: number, limit: number, filters: QueueFilters = {}): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: 'lastMessageAt:DESC' });
  if (filters.status) params.set('filter.status', `$eq:${filters.status}`);
  if (filters.priority) params.set('filter.priority', `$eq:${filters.priority}`);
  if (filters.assignee) params.set('filter.assignedAgentId', filters.assignee === 'NONE' ? '$null' : `$eq:${filters.assignee}`);
  return params.toString();
}

const withNote = (note?: string) => (note?.trim() ? { note: note.trim() } : {});

export const staffSupportService = {
  listQueue(page = 1, limit = 20, filters: QueueFilters = {}): Promise<ApiResponse<Page<SupportCase>>> {
    return apiClient.get<Page<SupportCase>>(`${S.CONVERSATIONS}?${queueQuery(page, limit, filters)}`);
  },

  getStats: () => apiClient.get<SupportQueueStats>(S.STATS),

  /** The case with its transcript, internal notes included (read for Staff when opened). */
  getDetail: (id: string) => apiClient.get<SupportCaseDetail>(S.CONVERSATION(id)),

  /** Member snapshot; each section is gated by its own permission and comes back `restricted` without it. */
  getMemberContext: (id: string) => apiClient.get<MemberContext>(S.MEMBER_CONTEXT(id)),

  claim: (id: string) => apiClient.post<SupportCase>(S.CLAIM(id), {}),

  release: (id: string) => apiClient.post<SupportCase>(S.RELEASE(id), {}),

  /** A draft from the knowledge base and the member's data; never sent to the member on its own. */
  getAiSuggestion: (id: string, question?: string) =>
    apiClient.post<StaffAiSuggestion>(S.AI_SUGGESTION(id), question?.trim() ? { question: question.trim() } : {}),

  /** Reply to the member, or an internal note only Staff and Admin read. */
  sendMessage: (id: string, content: string, isInternal = false) =>
    apiClient.post<{ conversation: SupportCase; message: SupportMessage }>(S.MESSAGES(id), { content: content.trim(), isInternal }),

  resolve: (id: string, note?: string) => apiClient.post<SupportCase>(S.RESOLVE(id), withNote(note)),


  /** Admin (`support:case.assign`): hand the case to one Staff member. */
  assign: (id: string, staffId: string) => apiClient.post<SupportCase>(S.ASSIGN(id), { staffId }),
};
