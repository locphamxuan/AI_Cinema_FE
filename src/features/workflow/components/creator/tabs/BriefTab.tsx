import { useState } from 'react';
import { FileText, Send } from 'lucide-react';
import type { EpisodePackage, FieldReview, SceneBreakdownItem } from '@/types/workflow';
import { SceneBreakdownEditor } from '../SceneBreakdownEditor';
import { clamp, MAX_EPISODE_MINUTES } from '@/features/workflow/lib/limits';

export interface BriefTabProps {
  currentPackage: EpisodePackage;
  /** Project-level overall script shared by every episode plan (with its version and Reviewer verdict). */
  overallScript: string;
  scriptVersion: number;
  scriptReview: FieldReview;
  updateOverallScript: (script: string) => void;
  updateContentBrief: (packageId: string, data: Partial<EpisodePackage['brief']>) => void;
  submitProductionPlan: (packageId: string) => void;
  reviseProductionPlan: (packageId: string, data: Partial<EpisodePackage['brief']>) => void;
}

/**
 * Content-brief editor form. Mount with `key={currentPackage.id}` from the
 * parent so switching episodes remounts this component with fresh initial
 * state instead of syncing local state to prop changes inside an effect.
 */
export function BriefTab({
  currentPackage,
  overallScript,
  scriptVersion,
  scriptReview,
  updateOverallScript,
  updateContentBrief,
  submitProductionPlan,
  reviseProductionPlan,
}: BriefTabProps) {
  const brief = currentPackage.brief;
  const reviewerTargetDuration = currentPackage.target_duration_minutes;

  const [draftScript, setDraftScript] = useState(overallScript);
  const [productionApproach, setProductionApproach] = useState(brief.production_approach);
  const [draftTargetDuration, setDraftTargetDuration] = useState(brief.target_duration_minutes);
  const [estimatedTokens, setEstimatedTokens] = useState(brief.estimated_tokens);
  const [storyboardSummary, setStoryboardSummary] = useState(brief.storyboard_summary);
  const [scenes, setScenes] = useState<SceneBreakdownItem[]>(brief.scene_breakdown);
  const [isSaved, setIsSaved] = useState(false);

  const flaggedFields = [
    { label: 'Kịch bản tổng thể', review: scriptReview },
    { label: 'Thời lượng đề xuất', review: brief.duration_review },
    { label: 'Token dự toán', review: brief.token_review },
  ].filter((f) => f.review.status === 'changes_requested');
  const scenesNeedingRework = brief.scene_reviews.filter((sr) => sr.status === 'changes_requested');

  const handleAddScene = () => {
    const nextNum = scenes.length + 1;
    const newScene: SceneBreakdownItem = {
      scene_number: nextNum,
      title: `Phân Cảnh Mới #${nextNum}`,
      description: 'Mô tả bối cảnh và diễn biến phân cảnh...',
      target_duration_sec: 15,
      estimated_tokens: 60,
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
    updateOverallScript(draftScript);
    updateContentBrief(currentPackage.id, {
      production_approach: productionApproach,
      target_duration_minutes: draftTargetDuration,
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
        production_approach: productionApproach,
        target_duration_minutes: draftTargetDuration,
        estimated_tokens: estimatedTokens,
        storyboard_summary: storyboardSummary,
        scene_breakdown: scenes,
      });
      alert('Đã nộp bản kế hoạch chỉnh sửa cho người kiểm duyệt.');
    } else {
      submitProductionPlan(currentPackage.id);
      alert('Đã nộp kế hoạch sản xuất cho người kiểm duyệt.');
    }
  };

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Kế Hoạch Sản Xuất
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Kịch bản tổng thể và danh sách phân cảnh của tập phim</p>
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
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {currentPackage.status === 'CHANGES_REQUESTED' ? 'Nộp lại kế hoạch' : 'Nộp kế hoạch'}
          </button>
        </div>
      </div>

      {(flaggedFields.length > 0 || scenesNeedingRework.length > 0) && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 text-xs text-rose-700 dark:text-rose-300 space-y-1.5">
          <strong>Reviewer yêu cầu chỉnh sửa</strong>
          {flaggedFields.map((f) => (
            <p key={f.label}>
              • {f.label}: {f.review.comment}
            </p>
          ))}
          {scenesNeedingRework.length > 0 && <p>• {scenesNeedingRework.length} phân cảnh cần làm lại — xem ghi chú tại từng phân cảnh bên dưới.</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kịch Bản Tổng Thể <span className="text-slate-400 normal-case font-medium">— cả dự án, phiên bản v{scriptVersion}</span>
            </label>
            <textarea
              rows={6}
              value={draftScript}
              onChange={(e) => setDraftScript(e.target.value)}
              placeholder="Nhập kịch bản tổng thể của toàn bộ phim/series: bối cảnh, mạch truyện, cao trào và kết thúc…"
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500 leading-relaxed font-sans"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Cách Thực Hiện Dự Kiến
            </label>
            <textarea
              rows={3}
              value={productionApproach}
              onChange={(e) => setProductionApproach(e.target.value)}
              placeholder="Dự kiến tạo/ghép asset thế nào: chiến lược prompt, thứ tự sinh ảnh/video/âm thanh…"
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-white/10 pb-2">
            Thông Số Kỹ Thuật Dự Kiến
          </h4>
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
              Thời lượng mục tiêu (Phút) <span className="text-slate-400">— Reviewer đề ra {reviewerTargetDuration} phút cho tập này</span>:
            </label>
            <input
              type="number"
              min={1}
              max={MAX_EPISODE_MINUTES}
              value={draftTargetDuration}
              onChange={(e) => setDraftTargetDuration(clamp(Number(e.target.value), 1, MAX_EPISODE_MINUTES))}
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Tổng Token Dự Toán:</label>
            <input
              type="number"
              value={estimatedTokens}
              onChange={(e) => setEstimatedTokens(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono font-bold focus:outline-none focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Ghi chú storyboard</label>
            <textarea
              rows={2}
              value={storyboardSummary}
              onChange={(e) => setStoryboardSummary(e.target.value)}
              className="w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg p-2 text-[11px] text-slate-900 dark:text-white focus:outline-none focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <SceneBreakdownEditor
        scenes={scenes}
        sceneReviews={brief.scene_reviews}
        onAddScene={handleAddScene}
        onRemoveScene={handleRemoveScene}
        onSceneChange={handleSceneChange}
      />
    </div>
  );
}
