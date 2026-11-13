'use client';

import { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import { staffSupportService } from '@/services/staffSupportService';
import { Empty, Loading } from '@/components/data/ui';
import type { KnowledgeArticle } from '@/types/support';

export function KnowledgeBasePanel() {
  const [page] = useState(1);
  const [editing, setEditing] = useState<KnowledgeArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const { busy, run } = useAction();

  const articles = useResource(`admin:knowledge:${page}`, () => staffSupportService.listKnowledge(page, 20));

  const items = articles.data?.data ?? [];

  const remove = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá bài viết kiến thức này?')) return;
    if (await run(() => staffSupportService.deleteKnowledge(id), 'Đã xoá bài viết')) {
      await articles.reload();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cơ sở tri thức làm nguồn dữ liệu trả lời cho AI Chatbot và gợi ý cho nhân viên CSKH.
          </p>
        </div>

        <Button onClick={() => setCreating(true)} className="gap-1.5 text-xs">
          <Plus className="w-4 h-4" /> Thêm bài viết
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
            Danh sách bài viết ({articles.data?.meta?.totalItems ?? items.length})
          </p>
        </div>

        {articles.loading && !articles.data && <Loading />}
        {items.length === 0 && !articles.loading && (
          <Empty>Chưa có bài viết nào trong Knowledge Base.</Empty>
        )}

        {items.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {items.map((art) => (
              <div key={art.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{art.title}</span>
                    {art.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400">
                        {art.category}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        art.isPublished
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                      }`}
                    >
                      {art.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{art.content}</p>
                  <p className="text-[11px] text-slate-400">Cập nhật: {formatDateTime(art.updatedAt)}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(art)} className="h-7 px-2">
                    <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(art.id)} disabled={busy} className="h-7 px-2 text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(creating || editing) && (
        <ArticleModal
          article={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            await articles.reload();
          }}
        />
      )}
    </div>
  );
}

function ArticleModal({
  article,
  onClose,
  onSaved,
}: {
  article: KnowledgeArticle | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState(article?.title ?? '');
  const [category, setCategory] = useState(article?.category ?? '');
  const [content, setContent] = useState(article?.content ?? '');
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? true);
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title: title.trim(),
      category: category.trim() || undefined,
      content: content.trim(),
      isPublished,
    };

    const done = await run(
      () =>
        article
          ? staffSupportService.updateKnowledge(article.id, payload)
          : staffSupportService.createKnowledge(payload),
      article ? 'Đã cập nhật bài viết' : 'Đã thêm bài viết mới',
    );

    if (done) await onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-2xl"
      icon={<BookOpen className="w-5 h-5 text-sky-500" />}
      title={article ? 'Sửa bài viết Knowledge Base' : 'Thêm bài viết mới'}
    >
      <form onSubmit={submit} className="space-y-4 text-xs">
        <FormField label="Tiêu đề">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={fieldInputClass} />
        </FormField>
        <FormField label="Danh mục (tuỳ chọn)">
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ví dụ: Gói cước, Coin, Quy chế..." className={fieldInputClass} />
        </FormField>
        <FormField label="Nội dung tri thức">
          <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} required className={fieldTextareaClass} />
        </FormField>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-slate-300 dark:border-white/20 text-sky-600 focus:ring-sky-500"
          />
          <span className="text-slate-700 dark:text-slate-200 font-medium">Xuất bản bài viết cho AI sử dụng</span>
        </label>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !title.trim() || !content.trim()}>
            {article ? 'Lưu bài viết' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
