'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { Panel } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { KnowledgeArticle, KnowledgeFilters } from '@/types/support';
import { KnowledgeEditorModal, type ArticleDraft } from './KnowledgeEditorModal';
import { KnowledgeFiltersBar } from './KnowledgeFiltersBar';
import { KnowledgeTable } from './KnowledgeTable';
import { RetrievalPreviewModal } from './RetrievalPreviewModal';

/** Another tab asks to open an article (a cited source) or to start one (from a weak AI answer). */
export type KnowledgeFocus = { kind: 'edit'; id: string } | { kind: 'new'; draft: ArticleDraft };

type Pending = { kind: 'delete' | 'archive'; article: KnowledgeArticle } | { kind: 'reindex-all' };

const PAGE_SIZE = 20;
const POLL_MS = 4000;

/** The articles the AI answers from: write, publish (then indexed), archive, delete, and test retrieval. */
/** `focus` opens the editor on mount: the tab is mounted fresh each time another tab sends work here. */
export function KnowledgeTab({ focus }: { focus: KnowledgeFocus | null }) {
  const [filters, setFilters] = useState<KnowledgeFilters>({});
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ id: string | null; draft?: ArticleDraft } | null>(() =>
    focus ? (focus.kind === 'edit' ? { id: focus.id } : { id: null, draft: focus.draft }) : null,
  );
  const [pending, setPending] = useState<Pending | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const { busy, run } = useAction();
  const key = `admin:knowledge:${page}:${JSON.stringify(filters)}`;
  const list = useResource(key, () => aiConsoleService.listKnowledge(page, PAGE_SIZE, filters));

  // A published article waits for the index job: reload until none is PENDING / INDEXING.
  const waiting = list.data?.data.some((a) => a.indexStatus === 'PENDING' || a.indexStatus === 'INDEXING') ?? false;
  const { reload } = list;
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => void reload(), POLL_MS);
    return () => clearInterval(timer);
  }, [waiting, reload]);

  const changeFilters = (next: KnowledgeFilters) => {
    setFilters(next);
    setPage(1);
  };

  const confirm = async () => {
    if (!pending) return;
    if (pending.kind === 'reindex-all') {
      const res = await run(() => aiConsoleService.reindexAll());
      if (res) toast.success(`Đã đưa ${res.queued}/${res.total} bài vào danh sách chờ cập nhật cho AI`);
    } else if (pending.kind === 'delete') {
      await run(() => aiConsoleService.deleteKnowledge(pending.article.id), 'Đã xoá bài, AI không dùng bài này nữa');
    } else {
      await run(() => aiConsoleService.archiveKnowledge(pending.article.id), 'Đã lưu trữ bài');
    }
    setPending(null);
    await reload();
  };

  const reindex = async (article: KnowledgeArticle) => {
    if (await run(() => aiConsoleService.reindexKnowledge(article.id), 'Đã đưa bài vào danh sách chờ cập nhật cho AI')) await reload();
  };

  return (
    <Panel
      title="Kho tri thức"
      description="AI chỉ trả lời từ các bài đang dùng và đã cập nhật cho AI. Bài nháp và bài lưu trữ không được dùng."
      actions={
        <>
          <Button size="sm" variant="ghost" onClick={() => setPreviewing(true)}>
            Thử tìm bài
          </Button>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => setPending({ kind: 'reindex-all' })}>
            <RefreshCw className="size-3.5" aria-hidden="true" /> Cập nhật lại tất cả cho AI
          </Button>
          <Button size="sm" onClick={() => setEditor({ id: null })}>
            Thêm bài
          </Button>
        </>
      }
    >
      <KnowledgeFiltersBar value={filters} onChange={changeFilters} />
      <KnowledgeTable
        resource={list}
        busy={busy}
        filtered={Object.values(filters).some(Boolean)}
        onPage={setPage}
        onEdit={(a) => setEditor({ id: a.id })}
        onReindex={(a) => void reindex(a)}
        onArchive={(a) => setPending({ kind: 'archive', article: a })}
        onDelete={(a) => setPending({ kind: 'delete', article: a })}
      />

      {editor && (
        <KnowledgeEditorModal
          articleId={editor.id}
          draft={editor.draft}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            void reload();
          }}
        />
      )}
      {previewing && <RetrievalPreviewModal onClose={() => setPreviewing(false)} />}
      <ConfirmModal
        open={!!pending}
        title={
          pending?.kind === 'delete' ? `Xoá bài "${pending.article.title}"?` : pending?.kind === 'archive' ? `Lưu trữ bài "${pending.article.title}"?` : 'Cập nhật lại dữ liệu AI cho mọi bài đang dùng?'
        }
        description={
          pending?.kind === 'delete'
            ? 'Bài và toàn bộ dữ liệu AI của bài bị xoá hẳn, AI không trích dẫn bài này nữa. Không hoàn tác được.'
            : pending?.kind === 'archive'
              ? 'Bài bị ẩn khỏi AI nhưng vẫn giữ lại; bạn có thể sửa và xuất bản lại sau.'
              : 'Mọi bài đang dùng được đưa vào danh sách chờ cập nhật cho AI. Trong lúc chờ, AI vẫn dùng dữ liệu cũ.'
        }
        confirmLabel={pending?.kind === 'delete' ? 'Xoá bài' : pending?.kind === 'archive' ? 'Lưu trữ' : 'Cập nhật lại cho AI'}
        danger={pending?.kind === 'delete'}
        busy={busy}
        onClose={() => setPending(null)}
        onConfirm={() => void confirm()}
      />
    </Panel>
  );
}
