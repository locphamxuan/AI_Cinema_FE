import { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Plus,
  Video,
  Mic,
  Volume2,
  Film,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';
import type { GenerationJob } from '@/types/workflow';

export type ResourceCategory = 'video' | 'audio' | 'sfx' | 'full';

export interface ResourceTypeOption {
  id: ResourceCategory;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  modelId: string;
  modelLabel: string;
  spec: string;
  costPerSec: number;
  estimatedTokens: number;
  placeholder: string;
}

export const RESOURCE_TYPES: ResourceTypeOption[] = [
  {
    id: 'video',
    label: 'Hình Ảnh & Video',
    subLabel: 'Visual, góc máy & ánh sáng AI',
    icon: Video,
    modelId: 'CinemaGen v3.2 (4K Photoreal)',
    modelLabel: 'CinemaGen v3.2 (4K Photoreal)',
    spec: '4K • 60fps • HDR Photoreal',
    costPerSec: 4.5,
    estimatedTokens: 65,
    placeholder: 'Nhập mô tả góc máy, visual và ánh sáng (ví dụ: cinematic wide shot, cybernetic laboratory filled with holographic monitors, glowing cyan and magenta lights, 8k resolution...)',
  },
  {
    id: 'audio',
    label: 'Âm Thanh & Lời Thoại',
    subLabel: 'Lồng tiếng AI & cảm xúc nhân vật',
    icon: Mic,
    modelId: 'ElevenLabs Pro Voice HD',
    modelLabel: 'ElevenLabs Pro Voice HD',
    spec: 'Neural Voice • 24-bit Spatial',
    costPerSec: 1.5,
    estimatedTokens: 35,
    placeholder: 'Nhập lời thoại diễn viên và ngữ điệu (ví dụ: Minh Anh: "Hệ thống AI không chỉ đang học, nó đang tự viết lại nhận thức.")',
  },
  {
    id: 'sfx',
    label: 'Hiệu Ứng Âm Thanh (SFX)',
    subLabel: 'Tiếng động môi trường & nhạc nền',
    icon: Volume2,
    modelId: 'Dolby Spatial AI SFX',
    modelLabel: 'Dolby Spatial AI SFX',
    spec: 'Dolby Atmos • 3D BGM / SFX',
    costPerSec: 1.0,
    estimatedTokens: 25,
    placeholder: 'Nhập mô tả hiệu ứng âm thanh (ví dụ: tiếng bước chân rón rén trên sàn kim loại rỉ sét, tiếng còi báo động xa xăm vọng lại...)',
  },
  {
    id: 'full',
    label: 'Trọn Gói Cảnh Phim',
    subLabel: 'Đồng bộ cả Visual 4K + Lời thoại',
    icon: Film,
    modelId: 'CinemaGen v3.2 (4K Photoreal)',
    modelLabel: 'CinemaGen v3.2 + ElevenLabs HD',
    spec: 'Full Multi-modal Pipeline (4K + Audio)',
    costPerSec: 5.5,
    estimatedTokens: 75,
    placeholder: 'Nhập kịch bản trọn gói bao gồm bối cảnh hành động, góc máy và toàn bộ lời thoại nhân vật diễn ra trong phân cảnh...',
  },
];

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
  // Determine initial category based on selectedJob model or default to video
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('video');

  useEffect(() => {
    if (selectedJob) {
      if (selectedJob.ai_model.includes('ElevenLabs')) {
        setSelectedCategory('audio');
      } else if (selectedJob.ai_model.includes('Dolby')) {
        setSelectedCategory('sfx');
      } else {
        setSelectedCategory('video');
      }
    }
  }, [selectedJob?.id, selectedJob?.ai_model]);

  const currentOption = RESOURCE_TYPES.find((t) => t.id === selectedCategory) || RESOURCE_TYPES[0];
  const targetCost = selectedJob?.token_cost || currentOption.estimatedTokens;

  // Single prompt value depending on category
  const singlePromptValue =
    selectedCategory === 'audio' || selectedCategory === 'sfx'
      ? selectedJob?.prompt_audio || newPromptAudio
      : selectedJob?.prompt_video || newPromptVideo;

  const handleCategorySelect = (catId: ResourceCategory) => {
    setSelectedCategory(catId);
    const option = RESOURCE_TYPES.find((t) => t.id === catId);
    if (option) {
      onModelChange(option.modelId);
    }
  };

  const handlePromptChange = (text: string) => {
    if (selectedCategory === 'video') {
      onPromptVideoChange(text);
    } else if (selectedCategory === 'audio' || selectedCategory === 'sfx') {
      onPromptAudioChange(text);
    } else {
      onPromptVideoChange(text);
      onPromptAudioChange(text);
    }
  };

  // Real-time token consumption meter & execution timer (Claude Code / Gemini style)
  const [streamProgress, setStreamProgress] = useState(0);
  const [streamTokens, setStreamTokens] = useState(0);
  const [streamTime, setStreamTime] = useState('0.0s');
  const [streamLog, setStreamLog] = useState('');
  const [isCompletedRecently, setIsCompletedRecently] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isGenerating) {
      startTimeRef.current = Date.now();
      setIsCompletedRecently(false);
      setStreamProgress(0);
      setStreamTokens(0);
      setStreamLog('Đang phân tích prompt & định tuyến Model AI tối ưu...');

      timer = setInterval(() => {
        const elapsedMs = Date.now() - startTimeRef.current;
        const seconds = (elapsedMs / 1000).toFixed(1);
        setStreamTime(`${seconds}s`);

        // Total duration ~4000ms
        const pct = Math.min(100, Math.round((elapsedMs / 3800) * 100));
        const currentTokens = Math.min(targetCost, Math.round((pct / 100) * targetCost));

        setStreamProgress(pct);
        setStreamTokens(currentTokens);

        if (elapsedMs < 900) {
          setStreamLog('🔍 [AI Router] Phân tích prompt & nạp ngữ cảnh điện ảnh...');
        } else if (elapsedMs < 2100) {
          setStreamLog(`🤖 [Model Engine] Kết nối mô hình: ${currentOption.modelLabel}...`);
        } else if (elapsedMs < 3400) {
          setStreamLog('⚡ [Tensors Stream] Đang render khung hình & tổng hợp dữ liệu...');
        } else {
          setStreamLog(`✨ [Finalize] Khử nhiễu, mã hóa chuẩn 4K & xuất asset hoàn chỉnh!`);
        }
      }, 50);
    } else {
      if (streamProgress > 0) {
        setStreamProgress(100);
        setStreamTokens(targetCost);
        setIsCompletedRecently(true);
        const hideTimer = setTimeout(() => setIsCompletedRecently(false), 5000);
        return () => clearTimeout(hideTimer);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating, targetCost, currentOption.modelLabel]);

  return (
    <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
      {/* Header with Quick Add Scene Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-ruby" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Bộ Điều Khiển Sinh Tài Nguyên AI
          </h3>
        </div>

        <button
          onClick={onAddJob}
          title="Thêm phân cảnh mới"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ruby/10 hover:bg-ruby/20 active:scale-95 text-ruby text-xs font-bold border border-ruby/30 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Cảnh</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Field 1: Scene Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tên Phân Cảnh (Scene Title)
          </label>
          <input
            type="text"
            value={selectedJob?.title || newSceneTitle}
            onChange={(e) => onSceneTitleChange(e.target.value)}
            placeholder="Ví dụ: Cảnh 1: Phòng Thí Nghiệm Neon CyberLab..."
            className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-ruby outline-none focus:ring-1 focus:ring-ruby transition"
          />
        </div>

        {/* Field 2: Resource Type Category Picker (List muốn làm về gì) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Bạn Muốn AI Tạo Sinh Gì?
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Chọn để hệ thống tự định tuyến Model
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {RESOURCE_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedCategory === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleCategorySelect(type.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-ruby/10 border-ruby/40 ring-1 ring-ruby/30 shadow-xs'
                      : 'bg-slate-50/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-ruby text-white'
                        : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-ruby' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {type.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {type.subLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 3: Single Prompt Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Nội Dung Prompt ({currentOption.label})
            </label>
            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
              {singlePromptValue.length} ký tự
            </span>
          </div>
          <textarea
            value={singlePromptValue}
            onChange={(e) => handlePromptChange(e.target.value)}
            rows={4}
            placeholder={currentOption.placeholder}
            className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:border-ruby outline-none focus:ring-1 focus:ring-ruby resize-none font-mono transition leading-relaxed"
          />
        </div>

        {/* Field 4: Auto-routed AI Model Display (Hệ thống tự xử lý ở dưới) */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Hệ Thống Tự Định Tuyến Model AI
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Tối ưu tự động
            </span>
          </div>

          <div className="flex items-center justify-between bg-white dark:bg-[#12141A] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                <span>{currentOption.modelLabel}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {currentOption.spec}
              </div>
            </div>

            <div className="text-right shrink-0 pl-3 border-l border-slate-200 dark:border-white/10">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Định mức</span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {targetCost} Tokens
              </span>
            </div>
          </div>
        </div>

        {/* Field 5: Live Streaming Token & Time Meter (Claude Code / Gemini style) */}
        {isGenerating ? (
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-[#13151D] to-black border border-purple-500/40 shadow-lg text-white space-y-3 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-ruby/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5" /> AI Live Execution Stream
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3 h-3 text-blue-400" /> {streamTime}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {streamTokens} / {targetCost} Tokens
                </span>
              </div>
            </div>

            {/* Glowing animated progress bar */}
            <div className="space-y-1 relative z-10">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ruby via-purple-500 to-amber-400 transition-all duration-100 ease-out relative"
                  style={{ width: `${streamProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Tiến trình kết xuất ({streamProgress}%)</span>
                <span>Tốc độ: ~{(targetCost / 3.8).toFixed(1)} Tokens/s</span>
              </div>
            </div>

            {/* Terminal Log Line like Claude Code / Gemini */}
            <div className="bg-black/60 rounded-lg p-2.5 border border-white/10 font-mono text-[11px] text-slate-300 flex items-center gap-2 relative z-10">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
              <span className="truncate">{streamLog}</span>
            </div>
          </div>
        ) : isCompletedRecently ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Đã sinh tài nguyên thành công! Tiêu thụ: <strong>{targetCost} Tokens</strong>
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Thời gian: {streamTime}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Chi phí ước tính phân cảnh:</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-sm">
              {targetCost} Tokens
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
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
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-ruby hover:bg-ruby-dark active:scale-98 text-white text-xs font-bold shadow-md shadow-ruby/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Đang Sinh Clip ({streamTokens} T)...</span>
              </>
            ) : (
              <>
                <Video className="w-3.5 h-3.5" />
                <span>Trigger Sinh Clip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
