/** MF-5 support desk and AI Chatbox console, as the backend answers them (src/modules/support). */

export type SupportStatus = 'AI_HANDLING' | 'WAITING_FOR_STAFF' | 'STAFF_HANDLING' | 'RESOLVED' | 'CLOSED';
export type SupportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type SupportEscalationReason =
  | 'AI_UNAVAILABLE'
  | 'INSUFFICIENT_INFO'
  | 'ACCOUNT_VERIFICATION'
  | 'MEMBER_REQUEST'
  | 'STAFF_NEEDED';
export type SupportCloseReason = 'AI_RESOLVED' | 'STAFF_RESOLVED' | 'INACTIVITY' | 'MEMBER_CLOSED';
export type SupportSenderType = 'MEMBER' | 'AI_CHATBOT' | 'SUPPORT_AGENT' | 'SYSTEM';
export type SupportAudience = 'MEMBER' | 'STAFF' | 'ALL';

/** BE `staffCaseView`: one case as Staff and Admin see it. */
export interface SupportCase {
  id: string;
  status: SupportStatus;
  priority: SupportPriority;
  escalationReason: SupportEscalationReason | null;
  escalationNote: string | null;
  aiSummary: string | null;
  memberId: string;
  memberFullName: string;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  lastMessageAt: string | null;
  escalatedAt: string | null;
  claimedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  closeReason?: SupportCloseReason | null;
  lastMemberMessageAt?: string | null;
  lastStaffMessageAt?: string | null;
  firstStaffReplyAt?: string | null;
  resolutionNote: string | null;
  satisfactionRating: number | null;
  satisfactionComment: string | null;
  aiTurns: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  senderType: SupportSenderType;
  content: string;
  isInternal: boolean;
  aiMetadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SupportCaseDetail {
  conversation: SupportCase;
  messages: SupportMessage[];
}

/** BE `support-stats.service`: counts of the whole platform. */
export interface SupportQueueStats {
  byStatus: Partial<Record<SupportStatus, number>>;
  waiting: number;
  oldestWaiting: { conversationId: string; priority: SupportPriority; waitingMinutes: number } | null;
  escalatedToday: number;
  resolvedToday: number;
  aiResolvedRate: number;
  topEscalationReasons?: { reason: SupportEscalationReason; count: number }[];
}

export interface AiSource {
  articleId: string;
  title: string;
  heading: string | null;
}

export interface StaffAiSuggestion {
  draft: string;
  confidence: number;
  grounded: boolean;
  sources: AiSource[];
}

export type MemberContextSectionKey = 'Account' | 'Subscription' | 'Wallet' | 'Transactions' | 'EpisodeAccess' | 'Devices' | 'WatchHistory';

/** A section the caller may not read comes back `{ data: null, restricted: true }`, never a 403. */
export interface MemberContextSection {
  data: unknown;
  restricted?: boolean;
  permission?: string;
}

export interface MemberContext {
  memberId: string;
  sections: Partial<Record<MemberContextSectionKey, MemberContextSection>>;
}

// ---- Knowledge Base (Admin) ----

export type KnowledgeArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type KnowledgeIndexStatus = 'PENDING' | 'INDEXING' | 'INDEXED' | 'FAILED';
export type KnowledgeSource = 'MANUAL' | 'POLICY' | 'PLAN' | 'FAQ';

/** A list row: no Markdown, the detail carries it. */
export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  audience: SupportAudience;
  locale: string;
  status: KnowledgeArticleStatus;
  source: KnowledgeSource;
  sourceRef: string | null;
  version: number;
  indexStatus: KnowledgeIndexStatus;
  indexError: string | null;
  indexedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticleDetail extends KnowledgeArticle {
  contentMarkdown: string;
  chunks: { chunkIndex: number; heading: string | null; content: string; tokenCount: number }[];
  createdBy?: { id: string; fullName: string } | null;
  updatedBy?: { id: string; fullName: string } | null;
}

export interface KnowledgeInput {
  title: string;
  slug: string;
  category: string;
  contentMarkdown: string;
  audience?: SupportAudience;
  locale?: string;
  source?: KnowledgeSource;
  sourceRef?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface KnowledgeFilters {
  search?: string;
  status?: KnowledgeArticleStatus;
  category?: string;
  audience?: SupportAudience;
  failedOnly?: boolean;
}

export interface RetrievalPreview {
  articles: { articleId: string; title: string; chunks: { heading: string | null; content: string; score: number }[] }[];
  totalFound: number;
}

// ---- AI health, Playground, answer log (Admin) ----

export interface SupportAiHealth {
  mode: 'live' | 'mock' | 'disabled';
  chatModel: string | null;
  chatConfigured: boolean;
  embeddingModel: string | null;
  embeddingConfigured: boolean;
  indexedChunks: number;
  failedArticles: number;
  pendingArticles: number;
  lastIndexedAt: string | null;
}

export type AiResolution = 'ANSWERED' | 'RESOLVED_SUGGESTED' | 'NEEDS_HUMAN' | 'UNCERTAIN';

export interface PlaygroundTurn {
  role: 'MEMBER' | 'AI';
  content: string;
}

export interface PlaygroundAnswer {
  question: string;
  answer: string;
  resolution: AiResolution;
  confidence: number;
  escalationReason: string | null;
  grounded: boolean;
  sources: AiSource[];
  retrieved: { articleId: string; title: string; heading: string | null; chunkIndex: number; score: number; excerpt: string }[];
  toolsUsed: string[];
  model: string | null;
  latencyMs: number;
}

export type AiFeedback = 'HELPFUL' | 'NOT_HELPFUL';

export interface AiAnswerLog {
  id: string;
  conversationId: string;
  question: string | null;
  answer: string;
  confidence: number | null;
  resolution: AiResolution | null;
  model: string | null;
  sources: AiSource[];
  toolsUsed: string[];
  feedback: AiFeedback | null;
  feedbackNote: string | null;
  feedbackAt: string | null;
  feedbackBy: { id: string; fullName: string } | null;
  conversation: {
    id: string;
    status: SupportStatus;
    satisfactionRating: number | null;
    member: { id: string; fullName: string; email: string };
  };
  createdAt: string;
}

export interface AiAnswerSummary {
  totalAnswers: number;
  helpful: number;
  notHelpful: number;
  unrated: number;
  handedOffToStaff: number;
  averageSatisfaction: number | null;
}
