export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Function a single AI generation step performs. The system auto-selects
 * the model for each type — Creator only supplies scene_name + prompt (BR-40).
 * 'CUSTOM' lets the Creator describe a function the catalog does not list;
 * the backend then routes it to a suitable model (GET /ai-models/route).
 */
export type GenerationFunctionType = 'SCRIPT_VOICE' | 'IMAGE' | 'VIDEO' | 'AUDIO_MUSIC' | 'CUSTOM';

/**
 * How the backend routed a step to its model: a built-in function's own model,
 * a specialist or the general model for a custom function, or `pending` while
 * a custom function has not been described (or resolved) yet.
 */
export type ModelMatch = 'catalog' | 'specialist' | 'general' | 'pending';

/**
 * One AI generation call within a scene (e.g. the video shot, a voice line,
 * an SFX cue). A scene can hold any number of these — see GenerationJob.
 */
export interface GenerationStep {
  id: string;
  function_type: GenerationFunctionType;
  /** Creator's own description of the function when function_type is 'CUSTOM'. */
  custom_function?: string;
  prompt: string;
  selected_model: string;
  model_match?: ModelMatch;
  status: JobStatus;
  token_cost: number;
  output_duration?: number;
}

/**
 * 2. generation_job: Một phân cảnh (scene) của kế hoạch trong Studio. `id` và
 * `scene_id` là id của scene ở backend; mỗi generation_step là một generation
 * job ở backend, trừ các bước nháp (id bắt đầu bằng `draft-`) chưa được tạo.
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
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 3. generated_asset: Tài nguyên đầu ra của một generation job. `job_id` là
 * phân cảnh (GenerationJob.id) chứa job đó.
 */
export interface GeneratedAsset {
  id: string;
  job_id: string;
  scene_id: string;
  asset_type: 'video' | 'image' | 'audio' | 'text';
  /** Storage key / stream URL; empty for text output. */
  url: string;
  duration_seconds: number | null;
  model: string;
  prompt: string;
  created_at: string;
}
