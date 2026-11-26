'use client';

import { useEffect, useState } from 'react';
import { Loading } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { KnowledgeArticleDetail, KnowledgeArticleStatus } from '@/types/support';
import { TOPICS, toSlug } from './aiLabels';

export interface ArticleDraft {
  title: string;
  contentMarkdown: string;
}

interface Form {
  title: string;
  category: string;
  contentMarkdown: string;
}

/** The hidden article code the backend needs; made from the title so the Admin never sees it. */
const slugFor = (title: string) => toSlug(title) || `bai-${Date.now().toString(36)}`;

/**
 * Write or edit one article: title, topic and text. "Cho AI dùng" publishes it; the AI reads it in the
 * background. The article code, audience and source are kept as they are (new articles: for members, written here).
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
  const [form, setForm] = useState<Form>(() => ({ title: draft?.title ?? '', category: TOPICS[0], contentMarkdown: draft?.contentMarkdown ?? '' }));
  const [status, setStatus] = useState<KnowledgeArticleStatus | null>(null);
  const [loading, setLoading] = useState(!!articleId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { busy, run } = useAction();

  useEffect(() => {
    if (!articleId) return;
    let active = true;
    void aiConsoleService.getKnowledge(articleId).then((res) => {
      if (!active) return;
      setLoading(false);
      if (!res.success) return setLoadError(res.message ?? 'Không tải được bài.');
      const a = res.data;
      setStatus(a.status);
      setForm({ title: a.title, category: a.category, contentMarkdown: a.contentMarkdown });
    });
    return () => {
      active = false;
    };
  }, [articleId]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const ready = !!(form.title.trim() && form.category.trim() && form.contentMarkdown.trim());
  const inUse = status === 'PUBLISHED';

  const save = async (next: 'DRAFT' | 'PUBLISHED') => {
    if (!ready) return;
    const fields = { title: form.title.trim(), category: form.category.trim(), contentMarkdown: form.contentMarkdown, status: next };
    const saved = await run(
      () =>
        articleId
          ? aiConsoleService.updateKnowledge(articleId, fields)
          : aiConsoleService.createKnowledge({ ...fields, slug: slugFor(fields.title), audience: 'MEMBER', source: 'MANUAL' }),
      next === 'PUBLISHED' ? 'Đã lưu. AI sẽ đọc bài trong ít phút' : 'Đã lưu bản nháp',
    );
    if (saved) onSaved(saved as KnowledgeArticleDetail);
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-3xl"
      title={articleId ? 'Sửa bài kiến thức' : 'Thêm bài kiến thức'}
      subtitle="Viết như đang trả lời Member. Không cần ghi giá gói hay tỷ giá Coin: AI tự lấy số mới nhất từ hệ thống."
    >
      {loading && <Loading />}
      {loadError && (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      )}
      {!loading && !loadError && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save('PUBLISHED');
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[2fr_1fr]">
            <FormField label="Tiêu đề" required>
              <input required maxLength={255} value={form.title} onChange={(e) => set('title', e.target.value)} className={fieldInputClass} />
            </FormField>
            <FormField label="Chủ đề" required>
              <input required maxLength={100} list="knowledge-topics" value={form.category} onChange={(e) => set('category', e.target.value)} className={fieldInputClass} />
              <datalist id="knowledge-topics">
                {TOPICS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </FormField>
          </div>

          <FormField label="Nội dung" hint="Mỗi câu hỏi nên có một dòng tiêu đề riêng bắt đầu bằng ##, ví dụ: ## Coin thưởng có hết hạn không?" required>
            <textarea
              required
              rows={14}
              value={form.contentMarkdown}
              onChange={(e) => set('contentMarkdown', e.target.value)}
              placeholder={'## Câu hỏi của Member\nCâu trả lời ngắn gọn, dễ hiểu…'}
              className={`${fieldTextareaClass} text-sm`}
            />
          </FormField>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
              Huỷ
            </Button>
            {!inUse && (
              <Button type="button" variant="secondary" disabled={busy || !ready} onClick={() => void save('DRAFT')}>
                Lưu nháp
              </Button>
            )}
            <Button type="submit" disabled={busy || !ready}>
              {busy ? 'Đang lưu…' : inUse ? 'Lưu thay đổi' : 'Lưu và cho AI dùng'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
