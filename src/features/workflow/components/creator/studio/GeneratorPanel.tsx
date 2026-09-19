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

const CATEGORY_THEMES: Record<
  ResourceCategory,
  {
    activeBorder: string;
    activeBg: string;
    iconActive: string;
    textActive: string;
    dot: string;
  }
> = {
  video: {
    activeBorder: 'border-ruby/60 ring-1 ring-ruby/30',
    activeBg: 'bg-gradient-to-br from-ruby/15 via-rose-500/10 to-transparent',
    iconActive: 'bg-ruby text-white shadow-sm shadow-ruby/40',
    textActive: 'text-ruby dark:text-rose-400',
    dot: 'bg-ruby',
  },
  audio: {
    activeBorder: 'border-purple-500/60 ring-1 ring-purple-500/30',
    activeBg: 'bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-transparent',
    iconActive: 'bg-purple-600 text-white shadow-sm shadow-purple-600/40',
    textActive: 'text-purple-600 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  sfx: {
    activeBorder: 'border-cyan-500/60 ring-1 ring-cyan-500/30',
    activeBg: 'bg-gradient-to-br from-cyan-500/15 via-teal-500/10 to-transparent',
    iconActive: 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/40',
    textActive: 'text-cyan-600 dark:text-cyan-400',
    dot: 'bg-cyan-500',
  },
  full: {
    activeBorder: 'border-amber-500/60 ring-1 ring-amber-500/30',
    activeBg: 'bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent',
    iconActive: 'bg-amber-600 text-white shadow-sm shadow-amber-600/40',
    textActive: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
};

const PROMPT_PRESETS: Record<ResourceCategory, string[]> = {
  video: ['4K Photoreal', 'Cyberpunk Neon', 'Góc máy Drone', 'Ánh sáng kịch tính', '8K Ultra HD'],
  audio: ['Giọng trầm ấm', 'Ngữ điệu kịch tính', 'Thì thầm bí ẩn', 'Cảm xúc nghẹn ngào'],
  sfx: ['Dolby Atmos 3D', 'Tiếng động cơ Sci-Fi', 'Bass trầm dồn dập', 'Hiệu ứng không gian'],
  full: ['Đồng bộ 4K + Thoại', 'Cảnh hành động dồn dập', 'Cao trào kịch tính', 'Điện ảnh Hollywood'],
};

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

  const handleAddPreset = (preset: string) => {
    const current = singlePromptValue.trim();
    const separator = current.length > 0 ? ', ' : '';
    handlePromptChange(`${current}${separator}${preset}`);
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
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ruby/10 border border-ruby/20 flex items-center justify-center text-ruby">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Bộ Điều Khiển Sinh Tài Nguyên AI
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Định tuyến Model tự động theo danh mục
            </p>
          </div>
        </div>

        <button
          onClick={onAddJob}
          title="Thêm phân cảnh mới"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-ruby/10 hover:text-ruby dark:hover:bg-ruby/20 dark:hover:text-ruby-light border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Cảnh</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Field 1: Scene Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Tên Phân Cảnh (Scene Title)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={selectedJob?.title || newSceneTitle}
              onChange={(e) => onSceneTitleChange(e.target.value)}
              placeholder="Ví dụ: Cảnh 1: Phòng Thí Nghiệm Neon CyberLab..."
              className="w-full bg-slate-50/70 dark:bg-[#101218] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-ruby outline-none focus:ring-2 focus:ring-ruby/20 transition placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
            />
          </div>
        </div>

        {/* Field 2: Resource Type Category Picker (Themed Cards) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Bạn Muốn AI Tạo Sinh Gì?
            </label>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Hệ thống tự gán Model tương ứng
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {RESOURCE_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedCategory === type.id;
              const theme = CATEGORY_THEMES[type.id];

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleCategorySelect(type.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? `${theme.activeBorder} ${theme.activeBg} shadow-sm`
                      : 'bg-slate-50/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected ? theme.iconActive : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? theme.textActive : 'text-slate-800 dark:text-slate-200'}`}>
                          {type.label}
                        </span>
                        {isSelected && (
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0 animate-ping`} />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {type.subLabel}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 3: Studio Prompt Input with Booster Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Nội Dung Prompt ({currentOption.label})
            </label>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-purple-600 dark:text-purple-400 font-semibold border border-slate-200 dark:border-white/10">
              {singlePromptValue.length} ký tự
            </span>
          </div>

          <div className="relative">
            <textarea
              value={singlePromptValue}
              onChange={(e) => handlePromptChange(e.target.value)}
              rows={4}
              placeholder={currentOption.placeholder}
              className="w-full bg-slate-50/80 dark:bg-[#101218] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-ruby outline-none focus:ring-2 focus:ring-ruby/20 resize-none font-sans leading-relaxed transition"
            />
          </div>

          {/* Quick Prompt Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
              Gợi ý nhanh:
            </span>
            {PROMPT_PRESETS[selectedCategory].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-ruby/10 hover:text-ruby dark:hover:bg-ruby/20 dark:hover:text-ruby-light border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Field 4: Unified Auto-Routed AI Engine Card (No duplicate boxes!) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200 dark:border-white/10 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Hệ Thống Tự Định Tuyến Model AI
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Tự động tối ưu theo loại tài nguyên đã chọn
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Auto-Routed
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-ruby animate-pulse" />
                <span>{currentOption.modelLabel}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {currentOption.spec}
              </div>
            </div>

            <div className="text-right shrink-0 pl-4 border-l border-slate-200 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-semibold">
                Định mức chi phí
              </span>
              <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
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
        ) : null}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onAddJob}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 active:scale-98 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Phân Cảnh</span>
          </button>

          <button
            onClick={onGenerateSelected}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-ruby via-rose-600 to-ruby-dark hover:from-ruby-dark hover:to-rose-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-ruby/25 hover:shadow-ruby/40 transition-all cursor-pointer disabled:opacity-60"
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
