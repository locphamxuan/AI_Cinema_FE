'use client';

import { useEffect, useState } from 'react';
import { Loading } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { KnowledgeArticleDetail, KnowledgeInput, KnowledgeSource, SupportAudience } from '@/types/support';
import { AUDIENCE, CATEGORY_SUGGESTIONS, SOURCE, toSlug } from './aiLabels';
import { MarkdownPreview } from './MarkdownPreview';

export interface ArticleDraft {
  title: string;
  contentMarkdown: string;
}

const EMPTY: KnowledgeInput = { title: '', slug: '', category: CATEGORY_SUGGESTIONS[0], contentMarkdown: '', audience: 'MEMBER', source: 'MANUAL', sourceRef: '', status: 'DRAFT' };

/**
 * Write or edit one article. "Xuất bản" = PUBLISHED: the backend queues it for indexing, and the AI uses it once
 * indexed. Changing the content of a published article re-indexes it.
 */
export function KnowledgeEditorModal({
  articleId,
  draft,
  onClose,
  onSaved,
}: {
  articleId: string | null;
  draft?: ArticleDraft;
  onClose: () => void;
  onSaved: (article: KnowledgeArticleDetail) => void;
}) {
  const [form, setForm] = useState<KnowledgeInput>(() => ({ ...EMPTY, ...draft, slug: draft ? toSlug(draft.title) : '' }));
  const [slugTouched, setSlugTouched] = useState(!!articleId);
  const [loaded, setLoaded] = useState<KnowledgeArticleDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const { busy, run } = useAction();

  useEffect(() => {
    if (!articleId) return;
    let active = true;
    void aiConsoleService.getKnowledge(articleId).then((res) => {
      if (!active) return;
      if (!res.success) return setLoadError(res.message ?? 'Không tải được bài.');
      const a = res.data;
      setLoaded(a);
      setForm({
        title: a.title,
        slug: a.slug,
        category: a.category,
        contentMarkdown: a.contentMarkdown,
        audience: a.audience,
        source: a.source,
        sourceRef: a.sourceRef ?? '',
        status: a.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      });
    });
    return () => {
      active = false;
    };
  }, [articleId]);

  const set = <K extends keyof KnowledgeInput>(key: K, value: KnowledgeInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug);
  const ready = form.title.trim() && slugOk && form.category.trim() && form.contentMarkdown.trim();
  const archived = loaded?.status === 'ARCHIVED';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const body: KnowledgeInput = { ...form, title: form.title.trim(), category: form.category.trim(), sourceRef: form.sourceRef?.trim() || undefined };
    const saved = await run(
      () => (articleId ? aiConsoleService.updateKnowledge(articleId, body) : aiConsoleService.createKnowledge(body)),
      form.status === 'PUBLISHED' ? 'Đã lưu và xuất bản, bài đang chờ cập nhật cho AI' : 'Đã lưu bản nháp',
    );
    if (saved) onSaved(saved as KnowledgeArticleDetail);
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={articleId ? 'Sửa bài tri thức' : 'Thêm bài tri thức'}
      subtitle={loaded ? `Phiên bản ${loaded.version} · ${loaded.chunks.length} đoạn đã cắt` : 'Không ghi số liệu thay đổi (tỷ giá Coin, giá gói) vào bài: AI đọc số thật từ hệ thống.'}
    >
      {articleId && !loaded && !loadError && <Loading />}
      {loadError && <p role="alert" className="text-sm text-destructive">{loadError}</p>}
      {(!articleId || loaded) && (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <FormField label="Tiêu đề">
              <input
                required
                maxLength={255}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: slugTouched ? f.slug : toSlug(e.target.value) }))}
                className={fieldInputClass}
              />
            </FormField>
            <FormField label="Mã bài viết (không trùng)" error={form.slug && !slugOk ? 'Chỉ chữ thường không dấu, số và dấu gạch ngang.' : null}>
              <input
                required
                maxLength={255}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', e.target.value);
                }}
                className={`${fieldInputClass} font-mono`}
              />
            </FormField>
            <FormField label="Danh mục">
              <input required maxLength={100} list="knowledge-categories" value={form.category} onChange={(e) => set('category', e.target.value)} className={fieldInputClass} />
              <datalist id="knowledge-categories">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </FormField>
            <FormField label="Dành cho">
              <select value={form.audience} onChange={(e) => set('audience', e.target.value as SupportAudience)} className={fieldInputClass}>
                {(Object.keys(AUDIENCE) as SupportAudience[]).map((a) => (
                  <option key={a} value={a}>
                    {AUDIENCE[a]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Nguồn">
              <select value={form.source} onChange={(e) => set('source', e.target.value as KnowledgeSource)} className={fieldInputClass}>
                {(Object.keys(SOURCE) as KnowledgeSource[]).map((s) => (
                  <option key={s} value={s}>
                    {SOURCE[s]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Số hiệu nguồn (tuỳ chọn)" hint="Ví dụ: số điều khoản, mã gói">
              <input maxLength={255} value={form.sourceRef ?? ''} onChange={(e) => set('sourceRef', e.target.value)} className={fieldInputClass} />
            </FormField>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nội dung (Markdown)</span>
              <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-0.5 text-xs">
                {(['write', 'preview'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={`cursor-pointer rounded px-3 py-1 ${mode === m ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground'}`}
                  >
                    {m === 'write' ? 'Soạn' : 'Xem trước'}
                  </button>
                ))}
              </div>
            </div>
            {mode === 'write' ? (
              <textarea
                required
                rows={14}
                aria-label="Nội dung (Markdown)"
                value={form.contentMarkdown}
                onChange={(e) => set('contentMarkdown', e.target.value)}
                placeholder={'## Tiêu đề mục\nNội dung trả lời…'}
                className={`${fieldTextareaClass} font-mono text-xs`}
              />
            ) : (
              <div className="h-[302px] overflow-y-auto rounded-lg border border-border p-4">
                <MarkdownPreview source={form.contentMarkdown} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.status === 'PUBLISHED'}
                onChange={(e) => set('status', e.target.checked ? 'PUBLISHED' : 'DRAFT')}
                className="size-4 accent-primary"
              />
              Xuất bản cho AI dùng
              {archived && <span className="text-xs text-muted-foreground">(bài đang lưu trữ)</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
                Huỷ
              </Button>
              <Button type="submit" disabled={busy || !ready}>
                {busy ? 'Đang lưu…' : 'Lưu bài'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
