/** MF-5 AI Chatbox console of the Admin: knowledge base, AI health, Playground and the answer log. */
import { apiClient } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { Page } from '@/types/production';
import type {
  AiAnswerLog,
  AiAnswerSummary,
  AiFeedback,
  KnowledgeArticle,
  KnowledgeArticleDetail,
  KnowledgeFilters,
  KnowledgeInput,
  PlaygroundAnswer,
  PlaygroundTurn,
  RetrievalPreview,
  SupportAiHealth,
  SupportAudience,
} from '@/types/support';

const S = API_ROUTES.ADMIN_SUPPORT;

/** The answer-log filters the console offers: all, not rated yet, rated "not good". */
export type AnswerFilter = 'ALL' | 'UNRATED' | 'NOT_HELPFUL';

export function knowledgeQuery(page: number, limit: number, f: KnowledgeFilters = {}): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: 'updatedAt:DESC' });
  if (f.search?.trim()) params.set('search', f.search.trim());
  if (f.status) params.set('filter.status', `$eq:${f.status}`);
  if (f.category) params.set('filter.category', `$eq:${f.category}`);
  if (f.audience) params.set('filter.audience', `$eq:${f.audience}`);
  if (f.failedOnly) params.set('filter.indexStatus', '$eq:FAILED');
  return params.toString();
}

export function answersQuery(page: number, limit: number, filter: AnswerFilter, search?: string): string {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set('search', search.trim());
  if (filter === 'UNRATED') params.set('filter.aiFeedback', '$null');
  if (filter === 'NOT_HELPFUL') params.set('filter.aiFeedback', '$eq:NOT_HELPFUL');
  return params.toString();
}

export const aiConsoleService = {
  health: () => apiClient.get<SupportAiHealth>(S.AI_HEALTH),

  listKnowledge: (page: number, limit: number, filters?: KnowledgeFilters) =>
    apiClient.get<Page<KnowledgeArticle>>(`${S.KNOWLEDGE}?${knowledgeQuery(page, limit, filters)}`),
  getKnowledge: (id: string) => apiClient.get<KnowledgeArticleDetail>(S.KNOWLEDGE_DETAIL(id)),
  createKnowledge: (input: KnowledgeInput) => apiClient.post<KnowledgeArticleDetail>(S.KNOWLEDGE, input),
  updateKnowledge: (id: string, input: Partial<KnowledgeInput>) => apiClient.patch<KnowledgeArticleDetail>(S.KNOWLEDGE_DETAIL(id), input),
  /** Removes the article and every chunk and vector: the AI stops citing it. Cannot be undone. */
  deleteKnowledge: (id: string) => apiClient.delete<{ id: string; deleted: true }>(S.KNOWLEDGE_DETAIL(id)),
  /** Hides the article (ARCHIVED) and drops its vectors; it can be edited and published again. */
  archiveKnowledge: (id: string) => apiClient.post<KnowledgeArticleDetail>(S.KNOWLEDGE_ARCHIVE(id), {}),
  reindexKnowledge: (id: string) => apiClient.post<KnowledgeArticle>(S.KNOWLEDGE_REINDEX(id), {}),
  reindexAll: () => apiClient.post<{ total: number; queued: number }>(S.KNOWLEDGE_REINDEX_ALL, {}),
  /** Which articles retrieval finds for a question; no AI call. */
  previewRetrieval: (query: string, audience?: SupportAudience) =>
    apiClient.post<RetrievalPreview>(S.KNOWLEDGE_PREVIEW, { query: query.trim(), ...(audience ? { audience } : {}) }),

  /** Ask the AI as a member would; nothing is stored or sent. `history` is oldest first, at most 10 turns. */
  previewChat: (question: string, history: PlaygroundTurn[], audience: SupportAudience = 'MEMBER') =>
    apiClient.post<PlaygroundAnswer>(
      S.AI_PREVIEW_CHAT,
      { question: question.trim(), audience, ...(history.length ? { history: history.slice(-10) } : {}) },
      { timeoutMs: 60_000 },
    ),

  answerSummary: () => apiClient.get<AiAnswerSummary>(S.AI_ANSWERS_SUMMARY),
  listAnswers: (page: number, limit: number, filter: AnswerFilter, search?: string) =>
    apiClient.get<Page<AiAnswerLog>>(`${S.AI_ANSWERS}?${answersQuery(page, limit, filter, search)}`),
  rateAnswer: (messageId: string, rating: AiFeedback, note?: string) =>
    apiClient.post<{ id: string; aiFeedback: AiFeedback; aiFeedbackNote: string | null; aiFeedbackAt: string }>(
      S.AI_ANSWER_FEEDBACK(messageId),
      { rating, ...(note?.trim() ? { note: note.trim() } : {}) },
    ),
};
