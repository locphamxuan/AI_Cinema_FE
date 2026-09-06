export interface AIComplianceInfo {
  aiModel: string;
  generatedDate: string;
  complianceArticle: string;
  reviewStatus: 'approved' | 'pending' | 'flagged';
  moderationScore: number;
  contentRating: string;
  disclaimer: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  hlsUrl: string;
  thumbnailUrl: string;
  price: number;
  isFree: boolean;
  isPreview: boolean;
  isUnlocked: boolean;
  synopsis: string;
}

export interface Movie {
  id: string;
  title: string;
  genre: string[];
  posterUrl: string;
  bannerUrl: string;
  description: string;
  year: number;
  episodes: Episode[];
  aiCompliance: AIComplianceInfo;
  totalEpisodes: number;
}
