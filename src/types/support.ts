export type SupportStatus =
  | 'AI_HANDLING'
  | 'WAITING_FOR_STAFF'
  | 'STAFF_HANDLING'
  | 'RESOLVED'
  | 'CLOSED';

export type SupportSenderType = 'MEMBER' | 'AI' | 'STAFF' | 'SYSTEM';

export interface SupportConversation {
  id: string;
  status: SupportStatus;
  aiSummary?: string | null;
  assignedStaffId?: string | null;
  assignedStaff?: { id: string; fullName: string; email: string } | null;
  memberId?: string;
  member?: { id: string; fullName: string; email: string } | null;
  escalationReason?: string | null;
  rating?: number | null;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportMessage {
  id: string;
  senderType: SupportSenderType;
  senderId?: string | null;
  content: string;
  isInternal?: boolean;
  createdAt: string;
}

export interface SupportQuickReply {
  label: string;
  message: string;
}

export interface SupportConversationDetail {
  conversation: SupportConversation;
  messages: SupportMessage[];
  quickReplies?: SupportQuickReply[];
}

export interface SupportSendResult {
  conversation: SupportConversation;
  memberMessage: SupportMessage;
  aiMessage: SupportMessage | null;
  systemMessage?: SupportMessage | null;
  quickReplies?: SupportQuickReply[];
}

export interface StaffAiSuggestion {
  draft: string;
  confidence: number;
  grounded: boolean;
  sources?: string[];
}

export interface SupportQueueStats {
  waitingCount: number;
  handlingCount: number;
  resolvedTodayCount: number;
  aiResolvedRate?: number;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  category?: string | null;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
}
