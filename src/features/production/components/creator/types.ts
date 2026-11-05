import type { MovieStatus } from '@/types/production';

export type StudioComplianceStatus = 'APPROVED' | 'PENDING' | 'REVISION_NEEDED' | 'DRAFT';

export type StudioFilterKey = 'all' | 'published' | 'review' | 'revision' | 'draft';

export interface StudioProjectItem {
  id: string;
  title: string;
  tagline?: string;
  posterUrl: string;
  status: 'PUBLISHED' | 'IN_REVIEW' | 'REVISION' | 'DRAFT';
  movieStatus: MovieStatus;
  statusLabel: string;
  genreTags: string[];
  aiTools: string[];
  approvedEpisodes: number;
  totalEpisodes: number;
  revenueCoin: number;
  studioName?: string;
  reviewerName?: string;
  lastUpdatedText: string;
  complianceBadge: {
    status: StudioComplianceStatus;
    label: string;
  };
}

export interface StudioPortalMetrics {
  totalProjects: number;
  publishedEpisodes: number;
  pendingReviews: number;
  totalRevenueCoins: number;
}
