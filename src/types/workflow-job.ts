export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * 2. generation_job: Tác vụ sinh tài nguyên AI (Video, Voice, SFX)
 */
export interface GenerationJob {
  id: string;
  episode_id: string;
  scene_id: string;
  scene_number: number;
  title: string;
  prompt_video: string;
  prompt_audio: string;
  ai_model: string;
  status: JobStatus;
  progress: number; // 0 - 100
  token_cost: number;
  output_asset_id?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 3. generated_asset: Tài nguyên đầu ra sau khi sinh AI hoàn tất
 */
export interface GeneratedAsset {
  id: string;
  job_id: string;
  scene_id: string;
  asset_type: 'video' | 'audio' | 'thumbnail';
  url: string;
  thumbnail_url: string;
  duration_seconds: number;
  resolution: string;
  file_size_mb: number;
  metadata: {
    fps: number;
    codec: string;
    model: string;
    seed?: number;
    prompt: string;
  };
  created_at: string;
}
