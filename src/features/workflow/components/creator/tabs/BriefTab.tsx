import { useState } from 'react';
import { FileText, Send } from 'lucide-react';
import type { ContentBrief, EpisodePackage, FieldReview, SceneBreakdownItem } from '@/types/workflow';
import { SceneBreakdownEditor } from '../SceneBreakdownEditor';
import { NumberField } from '@/features/workflow/components/shared/NumberField';
import { toast } from '@/components/ui/Toast';
import { UNLIMITED_EPISODE_MINUTES } from '@/features/workflow/lib/limits';

export interface BriefTabProps {
  currentPackage: EpisodePackage;
  /** Project-level overall script shared by every episode plan (with its version and Reviewer verdict). */
  overallScript: string;
  scriptVersion: number;
  scriptReview: FieldReview;
  updateOverallScript: (script: string) => void;
  /** Longest episode the Admin allows; null means no limit. */
  maxEpisodeMinutes: number | null;
  updateContentBrief: (packageId: string, data: Partial<ContentBrief>) => void;
  savePlanDraft: (packageId: string) => Promise<boolean>;
  submitProductionPlan: (packageId: string) => Promise<boolean>;
}

const NEW_SCENE_SECONDS = 15;
const NEW_SCENE_TOKENS = 60;

const INPUT =
  'w-full bg-white dark:bg-[#12141A] border border-slate-300 dark:border-white/15 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus-visible:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500 disabled:opacity-60';

const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });

/**
 * The episode's plan, edited straight in the store: switching episodes keeps what
 * was typed, and "Lưu nháp" writes it to the server without sending it for review.
 */
export function BriefTab({
  currentPackage,
  overallScript,
  maxEpisodeMinutes,
  scriptVersion,
  const maxMinutes = maxEpisodeMinutes ?? UNLIMITED_EPISODE_MINUTES;
  scriptReview,
  updateOverallScript,
  updateContentBrief,
  savePlanDraft,
  submitProductionPlan,
}: BriefTabProps) {
  const brief = currentPackage.brief;
  const scenes = brief.scene_breakdown;
  const allottedMinutes = currentPackage.target_duration_minutes;
  const editable = currentPackage.status === 'PLAN_DRAFT' || currentPackage.status === 'CHANGES_REQUESTED';
  const isRevision = currentPackage.status === 'CHANGES_REQUESTED';
  const [busy, setBusy] = useState<'save' | 'submit' | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const sceneSeconds = scenes.reduce((sum, s) => sum + Number(s.target_duration_sec || 0), 0);
  const overBudget = sceneSeconds > brief.target_duration_minutes * 60;

  const flaggedFields = [
    { label: 'Kịch bản tổng thể', review: scriptReview },
    { label: 'Thời lượng đề xuất', review: brief.duration_review },
    { label: 'Token dự tính', review: brief.token_review },
  ].filter((f) => f.review?.status === 'changes_requested');
  const scenesNeedingRework = (brief.scene_reviews || []).filter((sr) => sr.status === 'changes_requested');

  const change = (data: Partial<ContentBrief>) => updateContentBrief(currentPackage.id, { ...data, has_unsaved_changes: true });

  const changeScenes = (updated: SceneBreakdownItem[]) =>
    change({
      scene_breakdown: updated,
      scene_count: updated.length,
      estimated_tokens: updated.reduce((sum, s) => sum + Number(s.estimated_tokens || 0), 0),
    });

  const handleAddScene = () => {
    const next = scenes.length + 1;
    changeScenes([
      ...scenes,
      { scene_number: next, title: `Cảnh ${next}`, description: '', target_duration_sec: NEW_SCENE_SECONDS, estimated_tokens: NEW_SCENE_TOKENS },
    ]);
  };

  const handleRemoveScene = (index: number) =>
    changeScenes(scenes.filter((_, i) => i !== index).map((s, i) => ({ ...s, scene_number: i + 1 })));

  const handleSceneChange = <K extends keyof SceneBreakdownItem>(index: number, field: K, value: SceneBreakdownItem[K]) =>
    changeScenes(scenes.map((s, i) => (i === index ? { ...s, [field]: value } : s)));

  const handleSaveDraft = async () => {
    setBusy('save');
    const ok = await savePlanDraft(currentPackage.id);
    setBusy(null);
    if (ok) setSavedAt(new Date());
  };

  const handleSubmitPlan = async () => {
    if (scenes.length === 0) {
      toast.error('Chưa có cảnh nào', 'Thêm ít nhất một cảnh rồi gửi lại.');
      return;
    }
    if (overBudget) {
      toast.error('Các cảnh dài hơn thời lượng đề xuất', 'Rút ngắn cảnh hoặc tăng thời lượng đề xuất rồi gửi lại.');
      return;
    }
    setBusy('submit');
    const ok = await submitProductionPlan(currentPackage.id);
    setBusy(null);
    if (!ok) return;
    toast.success(
      isRevision ? 'Đã gửi lại kế hoạch' : 'Đã gửi kế hoạch',
      'Reviewer sẽ duyệt và cấp token cho tập này. Bạn sẽ thấy kết quả ở mục Phản hồi.'
    );
  };

  const saveLabel = busy === 'save' ? 'Đang lưu…' : 'Lưu nháp';
  const saveStatus = brief.has_unsaved_changes
    ? 'Có thay đổi chưa lưu'
    : savedAt
      ? `Đã lưu lúc ${timeFormat.format(savedAt)}`
      : null;

  return (
    <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 space-y-6 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Kế hoạch sản xuất
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {editable
              ? 'Viết kịch bản, chia cảnh và đề xuất thời lượng. Lưu nháp để làm tiếp sau, gửi khi đã xong.'
              : 'Kế hoạch đã gửi nên không sửa được nữa.'}
          </p>
        </div>

        {editable && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {saveStatus && (
              <span
                aria-live="polite"
                className={`text-[11px] ${brief.has_unsaved_changes ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {saveStatus}
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={busy !== null}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-white/10 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {saveLabel}
            </button>
            <button
              type="button"
              onClick={handleSubmitPlan}
              disabled={busy !== null}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <Send className="w-3.5 h-3.5" />
              {busy === 'submit' ? 'Đang gửi…' : isRevision ? 'Gửi lại kế hoạch' : 'Gửi kế hoạch'}
            </button>
          </div>
        )}
      </div>

      {(flaggedFields.length > 0 || scenesNeedingRework.length > 0) && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 text-xs text-rose-700 dark:text-rose-300 space-y-1.5">
          <strong>Reviewer cần bạn sửa</strong>
          {flaggedFields.map((f) => (
            <p key={f.label}>
              • {f.label}: {f.review.comment}
            </p>
          ))}
          {scenesNeedingRework.length > 0 && <p>• {scenesNeedingRework.length} cảnh cần làm lại, xem ghi chú ở từng cảnh bên dưới.</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <label htmlFor="overall-script" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Kịch bản tổng thể <span className="text-slate-400 font-medium">· dùng chung cho cả phim, bản {scriptVersion}</span>
          </label>
          <textarea
            id="overall-script"
            rows={9}
            value={overallScript}
            disabled={!editable}
            onChange={(e) => {
              updateOverallScript(e.target.value);
              change({});
            }}
            placeholder="Bối cảnh, nhân vật chính, mạch truyện, cao trào và kết thúc…"
            className={`${INPUT} p-3 leading-relaxed font-sans`}
          />
        </div>

        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">Thông số tập này</h3>
          <div>
            <label htmlFor="proposed-duration" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Thời lượng đề xuất (phút)
            </label>
            <NumberField
              id="proposed-duration"
              value={brief.target_duration_minutes}
              min={1}
              max={maxMinutes}
              disabled={!editable}
              onCommit={(minutes) => change({ target_duration_minutes: minutes })}
              className={INPUT}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Reviewer giao {allottedMinutes} phút{maxEpisodeMinutes !== null && `, tối đa ${maxEpisodeMinutes} phút`}. Nếu lệch nhiều, Reviewer sẽ xem lại khi duyệt.
            </p>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Tổng thời lượng các cảnh</span>
            <p className={`text-sm font-mono font-bold ${overBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {Math.floor(sceneSeconds / 60)} phút {sceneSeconds % 60} giây
            </p>
            {overBudget && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Dài hơn thời lượng đề xuất. Rút ngắn cảnh hoặc tăng thời lượng.</p>
            )}
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Token dự tính</span>
            <p className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">{brief.estimated_tokens.toLocaleString('vi-VN')}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Cộng từ token dự tính của từng cảnh.</p>
          </div>
        </div>
      </div>

      <SceneBreakdownEditor
        scenes={scenes}
        sceneReviews={brief.scene_reviews}
        editable={editable}
        maxSceneSeconds={maxMinutes * 60}
        onAddScene={handleAddScene}
        onRemoveScene={handleRemoveScene}
        onSceneChange={handleSceneChange}
      />
    </div>
  );
}
