import { useState } from 'react';
import { ArrowLeft, ArrowRight, Pencil, RotateCcw } from 'lucide-react';
import type { ApiSceneAdvice } from '@/types/workflow-api';
import { ICON_BUTTON_CLASS, INPUT_CLASS, SMALL_BUTTON_CLASS } from './stepMeta';

type SceneLink = ApiSceneAdvice['previousScene'];

export interface SceneHeaderProps {
  sceneNumber: number;
  title: string;
  description: string;
  previousScene: SceneLink;
  nextScene: SceneLink;
  /** How many generated items the scene has; starting over removes them. */
  generatedCount: number;
  disabled: boolean;
  onSave: (data: { title: string; description: string }) => Promise<boolean>;
  onReset: () => Promise<boolean>;
}

/** The selected scene, where it sits between its neighbours, and its edit / start-over actions. */
export function SceneHeader({ sceneNumber, title, description, previousScene, nextScene, generatedCount, disabled, onSave, onReset }: SceneHeaderProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-reset'>('view');
  const [draft, setDraft] = useState({ title, description });
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);

  const act = async (action: () => Promise<boolean>) => {
    setBusy(true);
    const ok = await action();
    setBusy(false);
    if (ok) setMode('view');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">Cảnh {sceneNumber}</p>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white break-words">{title}</h2>
        </div>
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setDraft({ title, description });
              setMode('edit');
            }}
            disabled={disabled || mode !== 'view'}
            aria-label="Sửa cảnh"
            title="Sửa tên và mô tả cảnh"
            className={`${ICON_BUTTON_CLASS} hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 focus-visible:ring-purple-500/40`}
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMode('confirm-reset')}
            disabled={disabled || mode !== 'view' || generatedCount === 0}
            aria-label="Làm lại cảnh"
            title={generatedCount === 0 ? 'Cảnh chưa có nội dung nào để làm lại' : 'Gỡ mọi nội dung đã tạo để làm lại cảnh'}
            className={`${ICON_BUTTON_CLASS} hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 focus-visible:ring-rose-500/40`}
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {(previousScene || nextScene) && (
        <p aria-label="Liên kết cảnh" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          {previousScene && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <ArrowLeft className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="truncate">Nối từ cảnh {previousScene.number}: {previousScene.title}</span>
            </span>
          )}
          {nextScene && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <span className="truncate">Dẫn vào cảnh {nextScene.number}: {nextScene.title}</span>
              <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            </span>
          )}
        </p>
      )}

      {mode === 'edit' ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            act(() => onSave({ title: draft.title.trim(), description: draft.description }));
          }}
        >
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-label="Tên cảnh" maxLength={255} autoComplete="off" className={INPUT_CLASS} />
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
            aria-label="Mô tả cảnh"
            placeholder="Chuyện gì xảy ra, ở đâu, lúc nào, không khí ra sao…"
            className={`${INPUT_CLASS} resize-y leading-relaxed`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Kịch bản và thời lượng đã duyệt giữ nguyên.</p>
            <span className="flex gap-1.5 ml-auto">
              <button type="button" onClick={() => setMode('view')} disabled={busy} className={`${SMALL_BUTTON_CLASS} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 focus-visible:ring-slate-400/40`}>
                Hủy
              </button>
              <button type="submit" disabled={busy || !draft.title.trim()} className={`${SMALL_BUTTON_CLASS} bg-purple-600 hover:bg-purple-700 text-white focus-visible:ring-purple-500/40`}>
                {busy ? 'Đang lưu…' : 'Lưu cảnh'}
              </button>
            </span>
          </div>
        </form>
      ) : description ? (
        <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line ${showAll ? '' : 'line-clamp-2'}`}>
          {description}{' '}
          {description.length > 120 && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
              {showAll ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </p>
      ) : (
        <p className="text-xs italic text-slate-400 dark:text-slate-500">Cảnh chưa có mô tả. Thêm mô tả để gợi ý và nội dung sát hơn.</p>
      )}

      {mode === 'confirm-reset' && (
        <div role="alert" className="px-2.5 py-2 rounded-md bg-rose-50 dark:bg-rose-500/10 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-rose-700 dark:text-rose-300">Làm lại cảnh? {generatedCount} mục đã tạo sẽ bị gỡ, token đã dùng không hoàn lại.</p>
          <span className="flex gap-1.5">
            <button type="button" onClick={() => setMode('view')} disabled={busy} className={`${SMALL_BUTTON_CLASS} text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/5 focus-visible:ring-slate-400/40`}>
              Hủy
            </button>
            <button type="button" onClick={() => act(onReset)} disabled={busy} className={`${SMALL_BUTTON_CLASS} bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500/40`}>
              {busy ? 'Đang làm lại…' : 'Xác nhận làm lại'}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
