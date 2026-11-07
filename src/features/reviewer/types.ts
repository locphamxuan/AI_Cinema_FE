export type AuditTicketStatus = 'PENDING_STUDIO' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type AuditSeverity = 'CRITICAL' | 'WARNING' | 'SUGGESTION';

export interface AuditTicket {
  id: string;
  timestampSeconds: number;
  timestampText: string;
  category: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  status: AuditTicketStatus;
  statusLabel: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  studioResponse?: string;
  createdAt: string;
}

export interface MasterEpisode {
  id: string;
  projectTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  version: string;
  durationSeconds: number;
  durationText: string;
  videoUrl: string;
  posterUrl: string;
  studioName: string;
  reviewerName: string;
  status: 'REVIEWING' | 'REJECTED_REVISION' | 'APPROVED_ARTICLE_44' | 'READY_PUBLISH';
  aiComplianceGranted: boolean;
  aiTechStack: string[];
  promptsCount: number;
  synopsis: string;
  scriptExcerpt: {
    act: string;
    scene: string;
    description: string;
    dialogue: string;
  }[];
  aiDisclosureLogs: {
    tool: string;
    purpose: string;
    model: string;
    provenanceStatus: 'VERIFIED' | 'FLAGGED' | 'CLEARED';
    notes: string;
  }[];
}
