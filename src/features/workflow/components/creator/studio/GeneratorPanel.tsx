import { Cpu, Plus, Video } from 'lucide-react';
import type { GenerationJob } from '@/types/workflow';

export const AI_MODELS = [
  { id: 'CinemaGen v3.2 (4K Photoreal)', label: 'CinemaGen v3.2 (4K Photoreal)', type: 'video', costPerSec: 4.5 },
  { id: 'Sora Vision Pro v2', label: 'Sora Vision Pro v2', type: 'video', costPerSec: 5.0 },
  { id: 'ElevenLabs Pro Voice HD', label: 'ElevenLabs Pro Voice HD', type: 'audio', costPerSec: 1.5 },
  { id: 'Dolby Spatial AI SFX', label: 'Dolby Spatial AI SFX', type: 'audio', costPerSec: 1.0 },
];

export interface GeneratorPanelProps {
  selectedJob?: GenerationJob;
  newSceneTitle: string;
  onSceneTitleChange: (value: string) => void;
  selectedModel: string;
  onModelChange: (value: string) => void;
  newPromptVideo: string;
  onPromptVideoChange: (value: string) => void;
  newPromptAudio: string;
  onPromptAudioChange: (value: string) => void;
  tokenCost: number;
  isGenerating: boolean;
  onAddJob: () => void;
  onGenerateSelected: () => void;
}

/** Right-column controller: name a scene, pick an AI model, write the video/audio prompt, then add or (re)generate it. */
export function GeneratorPanel({
  selectedJob,
  newSceneTitle,
  onSceneTitleChange,
  selectedModel,
  onModelChange,
  newPromptVideo,
  onPromptVideoChange,
  newPromptAudio,
  onPromptAudioChange,
  tokenCost,
  isGenerating,
  onAddJob,
  onGenerateSelected,
}: GeneratorPanelProps) {
  return (
    <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-ruby" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Bộ Điều Khiển Sinh Tài Nguyên AI (generation_job)
          </h3>
        </div>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Tên Phân Cảnh (Scene Title)
          </label>
          <input
            type="text"
            value={selectedJob?.title || newSceneTitle}
            onChange={(e) => onSceneTitleChange(e.target.value)}
            placeholder="Ví dụ: Cảnh 4: Rượt đuổi trên xa lộ tầng không..."
            className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-ruby outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Mô Hình AI Tạo Sinh (ai_model)
          </label>
          <select
            value={selectedJob?.ai_model || selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-ruby outline-none cursor-pointer"
          >
            {AI_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label} ({model.costPerSec} Tokens/giây)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Visual Video Prompt (Mô tả hình ảnh & Ánh sáng)
          </label>
          <textarea
            value={selectedJob?.prompt_video || newPromptVideo}
            onChange={(e) => onPromptVideoChange(e.target.value)}
            rows={4}
            placeholder="Nhập visual prompt chi tiết bằng tiếng Anh (cinematic lighting, camera angle, 8k resolution...)"
            className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:border-ruby outline-none resize-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Audio & Voice Prompt (Lời thoại & SFX)
          </label>
          <textarea
            value={selectedJob?.prompt_audio || newPromptAudio}
            onChange={(e) => onPromptAudioChange(e.target.value)}
            rows={3}
            placeholder="Nhập lời thoại diễn viên và hiệu ứng âm thanh không gian..."
            className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:border-purple-600 outline-none resize-none font-mono"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Chi phí ước tính phân cảnh:</span>
          <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm">{selectedJob?.token_cost || tokenCost} Tokens</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onAddJob}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Phân Cảnh Mới</span>
          </button>

          <button
            onClick={onGenerateSelected}
            disabled={isGenerating}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-ruby hover:bg-ruby-dark text-white text-xs font-bold shadow-md shadow-ruby/20 transition-all cursor-pointer disabled:opacity-60"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Đang Render...' : 'Trigger Sinh Clip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
