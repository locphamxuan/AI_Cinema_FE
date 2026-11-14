import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Page } from '@/types/production';
import type {
  KnowledgeArticle,
  StaffAiSuggestion,
  SupportConversation,
  SupportConversationDetail,
  SupportMessage,
  SupportQueueStats,
} from '@/types/support';

const S = API_ROUTES.ADMIN_SUPPORT;

export const staffSupportService = {
  /** The support queue, filterable by status (WAITING_FOR_STAFF, STAFF_HANDLING, etc.) */
  listQueue(page = 1, limit = 20, status?: string): Promise<ApiResponse<Page<SupportConversation>>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('filter.status', `$eq:${status}`);
    return apiClient.get<Page<SupportConversation>>(`${S.CONVERSATIONS}?${params.toString()}`);
  },

  /** Overall queue depth and escalation stats */
  getStats(): Promise<ApiResponse<SupportQueueStats>> {
    return apiClient.get<SupportQueueStats>(S.STATS);
  },

  /** Case detail with transcript, internal notes included */
  getDetail(id: string): Promise<ApiResponse<SupportConversationDetail>> {
    return apiClient.get<SupportConversationDetail>(S.CONVERSATION(id));
  },

  /** Claim a case waiting for staff */
  claim(id: string): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<SupportConversation>(S.CLAIM(id), {});
  },

  /** Return a case to the general queue */
  release(id: string): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<SupportConversation>(S.RELEASE(id), {});
  },

  /**
   * AI drafts a suggested reply from the knowledge base and member data;
   * never automatically sent to the member.
   */
  getAiSuggestion(id: string, question?: string): Promise<ApiResponse<StaffAiSuggestion>> {
    return apiClient.post<StaffAiSuggestion>(S.AI_SUGGESTION(id), question ? { question } : {});
  },

  /** Reply to the member or post an internal note visible only to staff/admin */
  sendMessage(id: string, content: string, isInternal = false): Promise<ApiResponse<SupportMessage>> {
    return apiClient.post<SupportMessage>(S.MESSAGES(id), { content: content.trim(), isInternal });
  },

  /** Mark case resolved */
  resolve(id: string, note?: string): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<SupportConversation>(S.RESOLVE(id), note ? { note } : {});
  },

  /** Close case */
  close(id: string, note?: string): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<SupportConversation>(S.CLOSE(id), note ? { note } : {});
  },

  /** Admin: assign case to a specific staff member */
  assign(id: string, staffId: string): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<SupportConversation>(S.ASSIGN(id), { staffId });
  },

  // ---- Knowledge Base Management (Admin) ----
  listKnowledge(page = 1, limit = 20): Promise<ApiResponse<Page<KnowledgeArticle>>> {
    return apiClient.get<Page<KnowledgeArticle>>(`${S.KNOWLEDGE}?page=${page}&limit=${limit}`);
  },

  getKnowledgeDetail(id: string): Promise<ApiResponse<KnowledgeArticle>> {
    return apiClient.get<KnowledgeArticle>(S.KNOWLEDGE_DETAIL(id));
  },

  createKnowledge(data: {
    title: string;
    contentMarkdown: string;
    slug: string;
    category: string;
    status?: 'PUBLISHED' | 'DRAFT';
    locale?: string;
  }): Promise<ApiResponse<KnowledgeArticle>> {
    return apiClient.post<KnowledgeArticle>(S.KNOWLEDGE, data);
  },

  updateKnowledge(
    id: string,
    data: {
      title?: string;
      contentMarkdown?: string;
      slug?: string;
      category?: string;
      status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    },
  ): Promise<ApiResponse<KnowledgeArticle>> {
    return apiClient.patch<KnowledgeArticle>(S.KNOWLEDGE_DETAIL(id), data);
  },

  deleteKnowledge(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<unknown>(`${S.KNOWLEDGE_DETAIL(id)}/archive`);
  },
};
