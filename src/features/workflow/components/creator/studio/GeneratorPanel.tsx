import { useEffect, useRef, useState } from 'react';
import {
  Cpu,
  Plus,
  Video,
  Mic,
  Volume2,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  Trash2,
} from 'lucide-react';
import type { GenerationJob, GenerationStep, GenerationFunctionType } from '@/types/workflow';

export const FUNCTION_TYPE_META: Record<
  GenerationFunctionType,
  { label: string; icon: React.ComponentType<{ className?: string }>; model: string; spec: string; defaultTokens: number; placeholder: string }
> = {
  VIDEO: {
    label: 'Video / Góc Máy',
    icon: Video,
    model: 'CinemaGen v3.2 (4K Photoreal)',
    spec: '4K • 60fps • HDR Photoreal',
    defaultTokens: 60,
    placeholder: 'Mô tả góc máy, bối cảnh và ánh sáng (vd: cinematic wide shot, cybernetic laboratory, glowing cyan lights, 8k...)',
  },
  IMAGE: {
    label: 'Hình Ảnh',
    icon: ImageIcon,
    model: 'CinemaGen Image Pro',
    spec: '4K • Photoreal Still Frame',
    defaultTokens: 30,
    placeholder: 'Mô tả hình ảnh tĩnh cần tạo (vd: poster nhân vật chính, concept art bối cảnh...)',
  },
  SCRIPT_VOICE: {
    label: 'Lời Thoại / Giọng Đọc',
    icon: Mic,
    model: 'ElevenLabs Pro Voice HD',
    spec: 'Neural Voice • 24-bit Spatial',
    defaultTokens: 35,
    placeholder: 'Nhập lời thoại và ngữ điệu (vd: Minh Anh: "Hệ thống AI đang tự viết lại nhận thức.")',
  },
  AUDIO_MUSIC: {
    label: 'Âm Thanh & Nhạc Nền',
    icon: Volume2,
    model: 'Dolby Spatial AI SFX',
    spec: 'Dolby Atmos • 3D BGM / SFX',
    defaultTokens: 25,
    placeholder: 'Mô tả hiệu ứng âm thanh hoặc nhạc nền (vd: tiếng bước chân trên sàn kim loại, còi báo động xa...)',
  },
};

const FUNCTION_TYPES: GenerationFunctionType[] = ['VIDEO', 'IMAGE', 'SCRIPT_VOICE', 'AUDIO_MUSIC'];

export interface GeneratorPanelProps {
  selectedJob?: GenerationJob;
  newSceneTitle: string;
  onSceneTitleChange: (value: string) => void;
  steps: GenerationStep[];
  onAddStep: () => void;
  onUpdateStep: (stepId: string, data: Partial<GenerationStep>) => void;
  onRemoveStep: (stepId: string) => void;
  isGenerating: boolean;
  onAddJob: () => void;
  onGenerateSelected: () => void;
}

export function GeneratorPanel({
  selectedJob,
  newSceneTitle,
  onSceneTitleChange,
  steps,
  onAddStep,
  onUpdateStep,
  onRemoveStep,
  isGenerating,
  onAddJob,
  onGenerateSelected,
}: GeneratorPanelProps) {
  const totalTokens = steps.reduce((sum, s) => sum + (s.token_cost || 0), 0);
  const targetCost = selectedJob ? selectedJob.token_cost : totalTokens;

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
          setStreamLog('🤖 [Model Engine] Kết nối các model đã tự động chọn cho từng prompt...');
        } else if (elapsedMs < 3400) {
          setStreamLog('⚡ [Tensors Stream] Đang render khung hình & tổng hợp dữ liệu...');
        } else {
          setStreamLog('✨ [Finalize] Khử nhiễu, mã hóa chuẩn 4K & xuất asset hoàn chỉnh!');
        }
      }, 50);
    } else if (streamProgress > 0) {
      setStreamProgress(100);
      setStreamTokens(targetCost);
      setIsCompletedRecently(true);
      const hideTimer = setTimeout(() => setIsCompletedRecently(false), 5000);
      return () => clearTimeout(hideTimer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- streamProgress is intentionally excluded to avoid restarting the timer
  }, [isGenerating, targetCost]);

  return (
    <div className="bg-white dark:bg-[#161922] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ruby/10 border border-ruby/20 flex items-center justify-center text-ruby">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Bộ Điều Khiển Sinh Tài Nguyên AI</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Model AI được hệ thống tự động chọn theo từng prompt</p>
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
        {/* Scene Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tên Phân Cảnh</label>
          <input
            type="text"
            value={selectedJob?.title || newSceneTitle}
            onChange={(e) => onSceneTitleChange(e.target.value)}
            placeholder="Ví dụ: Cảnh 1: Phòng Thí Nghiệm Neon CyberLab..."
            className="w-full bg-slate-50/70 dark:bg-[#101218] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-ruby outline-none focus:ring-2 focus:ring-ruby/20 transition placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
          />
        </div>

        {/* Prompt steps: one scene can need many — video, voice, sfx, image... */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Bạn Muốn AI Tạo Sinh Gì?</label>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Hệ thống tự gán Model tương ứng</span>
          </div>

          {steps.length === 0 && (
            <div className="text-center py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-400 dark:text-slate-500">
              Chưa có prompt nào. Bấm &quot;+ Thêm prompt khác&quot; bên dưới để bắt đầu.
            </div>
          )}

          {steps.map((step) => {
            const meta = FUNCTION_TYPE_META[step.function_type];
            return (
              <div key={step.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {FUNCTION_TYPES.map((type) => {
                      const TypeIcon = FUNCTION_TYPE_META[type].icon;
                      const isSelected = step.function_type === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => onUpdateStep(step.id, { function_type: type, selected_model: FUNCTION_TYPE_META[type].model, token_cost: FUNCTION_TYPE_META[type].defaultTokens })}
                          className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 transition cursor-pointer border ${
                            isSelected
                              ? 'bg-ruby text-white border-ruby shadow-xs'
                              : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-ruby/40'
                          }`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          {FUNCTION_TYPE_META[type].label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveStep(step.id)}
                    aria-label="Xoá prompt này"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  value={step.prompt}
                  onChange={(e) => onUpdateStep(step.id, { prompt: e.target.value })}
                  rows={2}
                  placeholder={meta.placeholder}
                  className="w-full bg-white dark:bg-[#101218] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-ruby outline-none focus:ring-2 focus:ring-ruby/20 resize-none leading-relaxed transition"
                />

                <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400">
                  <span>
                    Model tự chọn: <strong className="text-slate-700 dark:text-slate-300">{meta.model}</strong>
                  </span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">~{step.token_cost} Tokens</span>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onAddStep}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-ruby hover:text-ruby dark:hover:text-ruby-light text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Prompt Khác</span>
          </button>
        </div>

        {/* Summary */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{steps.length} prompt cho phân cảnh này</span>
          </div>
          <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            {targetCost} Tokens
          </span>
        </div>

        {/* Live Streaming Token & Time Meter */}
        {isGenerating ? (
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-[#13151D] to-black border border-purple-500/40 shadow-lg text-white space-y-3 relative overflow-hidden">
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
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Thời gian: {streamTime}</span>
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
            disabled={isGenerating || steps.length === 0}
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
