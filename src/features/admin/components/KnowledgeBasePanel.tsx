'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Edit3, Search, Sparkles, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import { staffSupportService } from '@/services/staffSupportService';
import { Empty, Loading } from '@/components/data/ui';
import { Pager } from '@/components/data/Pager';
import type { KnowledgeArticle } from '@/types/support';
import { KnowledgeMetrics } from './KnowledgeMetrics';
import { KnowledgeArticleModal } from './KnowledgeArticleModal';

export function KnowledgeBasePanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editing, setEditing] = useState<KnowledgeArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const { busy, run } = useAction();

  const articles = useResource(`admin:knowledge:${page}`, () =>
    staffSupportService.listKnowledge(page, 50),
  );

  const rawItems = articles.data?.data ?? [];
  const meta = articles.data?.meta;

  const categories = useMemo(() => {
    const set = new Set<string>();
    rawItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [rawItems]);

  const filtered = useMemo(() => {
    let list = rawItems;
    if (selectedCategory !== 'ALL') {
      list = list.filter((item) => item.category === selectedCategory);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.slug?.toLowerCase().includes(q) ||
          (item.contentMarkdown || item.content || '').toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [rawItems, selectedCategory, search]);

  const remove = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá bài viết này? AI Chatbox sẽ ngừng sử dụng nguồn tri thức này.')) return;
    if (await run(() => staffSupportService.deleteKnowledge(id), 'Đã xoá bài viết')) {
      await articles.reload();
    }
  };

  const totalCount = meta?.totalItems ?? rawItems.length;
  const publishedCount = rawItems.filter((a) => a.status === 'PUBLISHED' || a.isPublished).length;
  const categoryCount = Math.max(0, categories.length - 1);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Cơ sở tri thức làm nguồn dữ liệu trả lời cho AI Chatbot và gợi ý cho nhân viên CSKH.
          </p>
        </div>

        <Button onClick={() => setCreating(true)} className="gap-2 text-xs sm:text-sm shrink-0 self-start sm:self-auto shadow-xs">
          <Plus className="w-4 h-4" /> Thêm bài viết mới
        </Button>
      </div>

      {/* ── KPI Metric Cards ── */}
      <KnowledgeMetrics
        totalCount={totalCount}
        publishedCount={publishedCount}
        categoryCount={categoryCount}
      />

      {/* ── Search & Filter Toolbar ── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, danh mục, nội dung giải đáp..."
              className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0 self-center">
            Hiển thị <span className="font-semibold text-slate-800 dark:text-slate-200">{filtered.length}</span> / {totalCount} bài viết
          </div>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Chủ đề:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs'
                    : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/10'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả chủ đề' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Article Card List ── */}
      <div className="space-y-3">
        {articles.loading && !articles.data && <Loading />}

        {filtered.length === 0 && !articles.loading && (
          <div className="p-12 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#111420]/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {search || selectedCategory !== 'ALL'
                ? 'Không tìm thấy bài viết nào phù hợp với bộ lọc'
                : 'Chưa có bài viết nào trong Knowledge Base'}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tạo bài viết tri thức mới để AI Chatbot tự động học và giải đáp các thắc mắc của khách hàng.
            </p>
            <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Thêm bài viết đầu tiên
            </Button>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-3.5">
            {filtered.map((art) => {
              const isPublished = art.status === 'PUBLISHED' || (art.status !== 'DRAFT' && art.isPublished !== false);
              const displayContent = art.contentMarkdown || art.content || '';

              return (
                <div
                  key={art.id}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-2.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                        {art.title}
                      </span>
                      {art.category && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20">
                          <Tag className="w-3 h-3 text-sky-400" />
                          {art.category}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20'
                            : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {isPublished && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {isPublished ? 'Đã xuất bản (AI dùng)' : 'Bản nháp'}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed text-xs sm:text-sm">
                      {displayContent}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>{displayContent.length} ký tự</span>
                      <span>·</span>
                      <span>Slug: <code className="text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded">{art.slug || 'chưa tạo'}</code></span>
                      <span>·</span>
                      <span>Cập nhật: {formatDateTime(art.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditing(art)}
                      className="h-8 px-3 gap-1.5 text-xs font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(art.id)}
                      disabled={busy}
                      className="h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] shadow-xs">
            <Pager page={page} totalPages={meta.totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {(creating || editing) && (
        <KnowledgeArticleModal
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
