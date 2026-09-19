export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Function a single AI generation step performs. The system auto-selects
 * the model for each type — Creator only supplies scene_name + prompt (BR-40).
 */
export type GenerationFunctionType = 'SCRIPT_VOICE' | 'IMAGE' | 'VIDEO' | 'AUDIO_MUSIC';

/**
 * One AI generation call within a scene (e.g. the video shot, a voice line,
 * an SFX cue). A scene can hold any number of these — see GenerationJob.
 */
export interface GenerationStep {
  id: string;
  function_type: GenerationFunctionType;
  prompt: string;
  selected_model: string;
  status: JobStatus;
  token_cost: number;
  output_duration?: number;
}

/**
 * 2. generation_job: Một phân cảnh (scene) trong Studio, gồm nhiều
 * generation_steps (script/voice, image, video, audio/music, ...).
 */
export interface GenerationJob {
  id: string;
  episode_id: string;
  scene_id: string;
  scene_number: number;
  title: string;
  generation_steps: GenerationStep[];
  status: JobStatus;
  progress: number; // 0 - 100
  token_cost: number; // aggregate, summed from generation_steps
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
