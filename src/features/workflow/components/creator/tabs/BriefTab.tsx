import { useState } from 'react';
import { FileText, Send } from 'lucide-react';
import type { EpisodePackage, SceneBreakdownItem } from '@/types/workflow';
import { SceneBreakdownEditor } from '../SceneBreakdownEditor';

export interface BriefTabProps {
  currentPackage: EpisodePackage;
  updateContentBrief: (packageId: string, data: Partial<EpisodePackage['brief']>) => void;
  submitProductionPlan: (packageId: string) => void;
  reviseProductionPlan: (packageId: string, data: Partial<EpisodePackage['brief']>) => void;
}

/**
 * Content-brief editor form. Mount with `key={currentPackage.id}` from the
 * parent so switching episodes remounts this component with fresh initial
 * state instead of syncing local state to prop changes inside an effect.
 */
export function BriefTab({ currentPackage, updateContentBrief, submitProductionPlan, reviseProductionPlan }: BriefTabProps) {
  const brief = currentPackage.brief;

  const [synopsis, setSynopsis] = useState(brief.synopsis);
  const [overviewScript, setOverviewScript] = useState(brief.overview_script);
  const [targetDuration, setTargetDuration] = useState(brief.target_duration_minutes);
  const [estimatedTokens, setEstimatedTokens] = useState(brief.estimated_tokens);
  const [storyboardSummary, setStoryboardSummary] = useState(brief.storyboard_summary);
  const [scenes, setScenes] = useState<SceneBreakdownItem[]>(brief.scene_breakdown);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddScene = () => {
    const nextNum = scenes.length + 1;
    const newScene: SceneBreakdownItem = {
      scene_number: nextNum,
      title: `Phân Cảnh Mới #${nextNum}`,
      description: 'Mô tả bối cảnh và diễn biến phân cảnh...',
      target_duration_sec: 15,
      estimated_tokens: 60,
      visual_prompt: 'Cinematic lighting, high detailed scene.',
      audio_prompt: 'Voiceover and ambient SFX sound.',
    };
    const updated = [...scenes, newScene];
    setScenes(updated);
    setEstimatedTokens(updated.reduce((sum, s) => sum + s.estimated_tokens, 0));
  };

  const handleRemoveScene = (index: number) => {
    const updated = scenes.filter((_, i) => i !== index).map((s, i) => ({ ...s, scene_number: i + 1 }));
    setScenes(updated);
    setEstimatedTokens(updated.reduce((sum, s) => sum + s.estimated_tokens, 0));
  };

  const handleSceneChange = <K extends keyof SceneBreakdownItem>(index: number, field: K, value: SceneBreakdownItem[K]) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: value };
    setScenes(updated);
    if (field === 'estimated_tokens') {
      setEstimatedTokens(updated.reduce((sum, s) => sum + Number(s.estimated_tokens || 0), 0));
    }
  };

  const handleSaveDraft = () => {
    updateContentBrief(currentPackage.id, {
      synopsis,
      overview_script: overviewScript,
      target_duration_minutes: targetDuration,
      estimated_tokens: estimatedTokens,
      storyboard_summary: storyboardSummary,
      scene_breakdown: scenes,
      scene_count: scenes.length,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSubmitPlan = () => {
    handleSaveDraft();
    if (currentPackage.status === 'CHANGES_REQUESTED') {
      reviseProductionPlan(currentPackage.id, {
        synopsis,
        overview_script: overviewScript,
        target_duration_minutes: targetDuration,
        estimated_tokens: estimatedTokens,
        storyboard_summary: storyboardSummary,
        scene_breakdown: scenes,
      });
      alert('Đã nộp bản kế hoạch hiệu chỉnh lên Reviewer (Checker) để duyệt và cấp lại Quota!');
    } else {
      submitProductionPlan(currentPackage.id);
      alert('Đã nộp Kế hoạch Sản xuất lên Thẩm định viên (Reviewer) để phê duyệt và cấp Token Quota!');
    }
  };

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-ruby" />
            Soạn Thảo Kế Hoạch & Kịch Bản (Content Brief)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">PostgreSQL Schema: `content_brief`</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 transition cursor-pointer"
          >
            {isSaved ? '✓ Đã Lưu' : 'Lưu Bản Nháp'}
          </button>

          <button
            type="button"
            onClick={handleSubmitPlan}
            className="px-5 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white text-xs font-bold shadow-md shadow-ruby/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {currentPackage.status === 'CHANGES_REQUESTED' ? 'Nộp Lại Bản Hiệu Chỉnh' : 'Nộp Kế Hoạch & Xin Quota'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tóm Tắt Cốt Truyện (Synopsis)
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Nhập bối cảnh và tóm tắt diễn biến chính của tập phim..."
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-ruby focus:ring-1 focus:ring-ruby leading-relaxed font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kịch Bản Tổng Thể (Overview Script)
            </label>
            <textarea
              rows={4}
              value={overviewScript}
              onChange={(e) => setOverviewScript(e.target.value)}
              placeholder="Diễn giải kịch bản mở đầu, cao trào và kết thúc..."
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-ruby focus:ring-1 focus:ring-ruby leading-relaxed font-sans"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-white/10 pb-2">
            Thông Số Kỹ Thuật Dự Kiến
          </h4>
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Thời lượng mục tiêu (Phút):</label>
            <input
              type="number"
              value={targetDuration}
              onChange={(e) => setTargetDuration(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-ruby"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Tổng Token Dự Toán:</label>
            <input
              type="number"
              value={estimatedTokens}
              onChange={(e) => setEstimatedTokens(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono font-bold focus:outline-none focus:border-ruby"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Ghi Chú Storyboard:</label>
            <textarea
              rows={2}
              value={storyboardSummary}
              onChange={(e) => setStoryboardSummary(e.target.value)}
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg p-2 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-ruby"
            />
          </div>
        </div>
      </div>

      <SceneBreakdownEditor
        scenes={scenes}
        onAddScene={handleAddScene}
        onRemoveScene={handleRemoveScene}
        onSceneChange={handleSceneChange}
      />
    </div>
  );
}
