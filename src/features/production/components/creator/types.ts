import type { MovieStatus } from '@/types/production';

export type ScriptStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'REVISION'
  | 'ADMIN_APPROVED'
  | 'NEGOTIATING'
  | 'HANDED_OFF';

export type ScriptFilterKey = 'all' | 'draft' | 'review' | 'admin_approval' | 'handed_off';

// Backward compatibility alias
export type StudioFilterKey = ScriptFilterKey;
export type StudioComplianceStatus = 'APPROVED' | 'PENDING' | 'REVISION_NEEDED' | 'DRAFT';

export interface ScriptProjectItem {
  id: string;
  title: string;
  tagline?: string;
  conceptArtUrl: string; // 16:9 Concept Art / Moodboard
  posterUrl?: string;
  status: ScriptStatus;
  movieStatus?: MovieStatus;
  statusLabel: string;
  genreTags: string[];
  totalEpisodes: number;
  completedScriptEpisodes: number; // e.g. 5/5 tập
  assignedBy: string; // e.g. "Admin System"
  assignedDate: string; // e.g. "02/11/2026"
  partnerStudioName?: string; // External Studio partner contracted
  contractStatus?: string; // e.g. "Đã ký HĐ sản xuất" | "Đang thương lượng" | "Chưa chuyển giao"
  reviewerName?: string;
  lastUpdatedText: string;
  notes?: string;
  // Compatibility fields for existing consumers
  approvedEpisodes?: number;
  revenueCoin?: number;
  studioName?: string;
  aiTools?: string[];
  complianceBadge?: {
    status: StudioComplianceStatus;
    label: string;
  };
}

// Backward compatibility alias
export type StudioProjectItem = ScriptProjectItem;

export interface ScreenwriterMetrics {
  totalProjects: number; // 8 Dự án kịch bản được giao
  pendingReviews: number; // 3 Đang chờ Reviewer duyệt
  revisionNeeded: number; // 1 Cần chỉnh sửa phân cảnh
  handedOffProjects: number; // 4 Đã chuyển giao Studio sản xuất
}

// Backward compatibility alias
export type StudioPortalMetrics = ScreenwriterMetrics;
