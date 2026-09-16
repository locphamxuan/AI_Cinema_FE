export type PublicationVisibility = 'public' | 'vip_only' | 'unlisted';

/**
 * 8. publication: Lịch trình công chiếu và phát hành lên nền tảng OTT
 */
export interface Publication {
  id: string;
  episode_package_id: string;
  movie_catalog_id: string;
  title: string;
  scheduled_at: string | null;
  published_at: string | null;
  visibility: PublicationVisibility;
  platform_channels: string[];
  streaming_url: string;
  quality: string;
}
