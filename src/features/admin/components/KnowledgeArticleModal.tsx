'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { staffSupportService } from '@/services/staffSupportService';
import type { KnowledgeArticle } from '@/types/support';

function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

const SUGGESTED_CATEGORIES = [
  'Gói dịch vụ',
  'Coin & Nạp tiền',
  'Bản quyền & Studio',
  'Kỹ thuật & Sự cố',
  'Xem phim nhóm',
  'Tài khoản & Bảo mật',
];

interface KnowledgeArticleModalProps {
  article: KnowledgeArticle | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export function KnowledgeArticleModal({
  article,
  onClose,
  onSaved,
}: KnowledgeArticleModalProps) {
  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [slugManual, setSlugManual] = useState(!!article?.slug);
  const [category, setCategory] = useState(article?.category ?? 'Gói dịch vụ');
  const [content, setContent] = useState(article?.contentMarkdown || article?.content || '');
  const [isPublished, setIsPublished] = useState(
    article ? article.status === 'PUBLISHED' || article.isPublished !== false : true,
  );
  const { busy, run } = useAction();

  useEffect(() => {
    if (!article?.id) return;
    let active = true;
    staffSupportService.getKnowledgeDetail(article.id).then((res) => {
      if (!active || !res.success || !res.data) return;
      const data = res.data;
      if (data.title) setTitle(data.title);
      if (data.slug) setSlug(data.slug);
      if (data.category) setCategory(data.category);
      if (data.contentMarkdown || data.content) setContent(data.contentMarkdown || data.content || '');
      if (data.status) setIsPublished(data.status === 'PUBLISHED');
    });
    return () => {
      active = false;
    };
  }, [article?.id]);

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    if (!slugManual) {
      setSlug(toSlug(nextTitle));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim();
    const finalContent = content.trim();
    const finalSlug = (slug.trim() || toSlug(finalTitle)) || `kb-${Date.now()}`;
    const finalCategory = category.trim() || 'General';

    if (!finalTitle || !finalContent) return;

    const payload = {
      title: finalTitle,
      slug: finalSlug,
      category: finalCategory,
      contentMarkdown: finalContent,
      status: (isPublished ? 'PUBLISHED' : 'DRAFT') as 'PUBLISHED' | 'DRAFT',
    };

    const done = await run(
      () =>
        article
          ? staffSupportService.updateKnowledge(article.id, payload)
          : staffSupportService.createKnowledge(payload),
      article ? 'Đã cập nhật bài viết và nạp vào AI' : 'Đã thêm bài viết mới và nạp vào AI',
    );

    if (done) await onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-2xl"
      icon={<BookOpen className="w-5 h-5 text-sky-500" />}
      title={article ? 'Chỉnh sửa bài viết tri thức cho AI' : 'Thêm bài viết mới cho AI'}
      subtitle="Dữ liệu này sẽ làm nguồn ngữ cảnh để AI Chatbox học và tự động trả lời khách hàng."
    >
      <form onSubmit={submit} className="space-y-4 pt-2">
        <FormField label="Tiêu đề bài viết">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ví dụ: Quy định hoàn tiền Coin và đổi điểm thưởng"
            required
            className={fieldInputClass}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Đường dẫn định danh (Slug)">
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              placeholder="quy-dinh-hoan-tien"
              required
              className={fieldInputClass}
            />
          </FormField>

          <FormField label="Danh mục chủ đề">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ví dụ: Gói dịch vụ"
              required
              className={fieldInputClass}
            />
          </FormField>
        </div>

        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            Gợi ý danh mục nhanh:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <FormField
          label="Nội dung giải đáp (Hỗ trợ Markdown)"
          hint={`${content.length} ký tự`}
        >
          <textarea
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung quy định, hướng dẫn hoặc giải đáp chi tiết cho khách hàng. AI sẽ tự động học nội dung này để trả lời khi khách hàng hỏi."
            required
            className={fieldTextareaClass}
          />
        </FormField>

        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-slate-300 dark:border-white/20 text-sky-600 focus:ring-sky-500"
          />
          <span className="text-slate-700 dark:text-slate-200 font-medium text-xs">
            Xuất bản ngay (AI Chatbot sẽ tự động vector hóa và trả lời khách hàng ngay lập tức)
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || !title.trim() || !content.trim()}>
            {article ? 'Lưu & Nạp vào AI' : 'Thêm & Nạp vào AI'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
