'use client';

import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { Panel } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { aiConsoleService } from '@/services/aiConsoleService';
import type { KnowledgeArticle, KnowledgeFilters } from '@/types/support';
import { KnowledgeEditorModal, type ArticleDraft } from './KnowledgeEditorModal';
import { KnowledgeFiltersBar } from './KnowledgeFiltersBar';
import { KnowledgeTable } from './KnowledgeTable';

/** Another tab asks to open an article (a cited source) or to start one (from a weak AI answer). */
export type KnowledgeFocus = { kind: 'edit'; id: string } | { kind: 'new'; draft: ArticleDraft };

type Pending = { kind: 'delete' | 'hide'; article: KnowledgeArticle };

const PAGE_SIZE = 20;
const POLL_MS = 4000;

/**
 * The articles the AI answers from: write, use, hide, delete. `focus` opens the editor on mount: the tab is
 * mounted fresh each time another tab sends work here.
 */
export function KnowledgeTab({ focus }: { focus: KnowledgeFocus | null }) {
  const [filters, setFilters] = useState<KnowledgeFilters>({});
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ id: string | null; draft?: ArticleDraft } | null>(() =>
    focus ? (focus.kind === 'edit' ? { id: focus.id } : { id: null, draft: focus.draft }) : null,
  );
  const [pending, setPending] = useState<Pending | null>(null);
  const { busy, run } = useAction();
  const key = `admin:knowledge:${page}:${JSON.stringify(filters)}`;
  const list = useResource(key, () => aiConsoleService.listKnowledge(page, PAGE_SIZE, filters));

  // A saved article is read by the AI in the background: reload until none is still waiting.
  const waiting = list.data?.data.some((a) => a.status === 'PUBLISHED' && (a.indexStatus === 'PENDING' || a.indexStatus === 'INDEXING')) ?? false;
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
    if (pending.kind === 'delete') {
      await run(() => aiConsoleService.deleteKnowledge(pending.article.id), 'Đã xoá bài');
    } else {
      await run(() => aiConsoleService.archiveKnowledge(pending.article.id), 'Đã tạm ẩn bài');
    }
    setPending(null);
    await reload();
  };

  const retry = async (article: KnowledgeArticle) => {
    if (await run(() => aiConsoleService.reindexKnowledge(article.id), 'AI sẽ đọc lại bài trong ít phút')) await reload();
  };

  const show = async (article: KnowledgeArticle) => {
    if (await run(() => aiConsoleService.updateKnowledge(article.id, { status: 'PUBLISHED' }), 'Bài được dùng lại')) await reload();
  };

  const title = pending?.article.title ?? '';
  return (
    <Panel
      title="Bài kiến thức"
      description="AI chỉ trả lời Member dựa trên các bài Đang dùng. Bản nháp và bài tạm ẩn không được dùng."
      actions={
        <Button size="sm" onClick={() => setEditor({ id: null })}>
          Thêm bài
        </Button>
      }
    >
      <KnowledgeFiltersBar value={filters} onChange={changeFilters} />
      <KnowledgeTable
        resource={list}
        busy={busy}
        filtered={Object.values(filters).some(Boolean)}
        onPage={setPage}
        onEdit={(a) => setEditor({ id: a.id })}
        onRetry={(a) => void retry(a)}
        onHide={(a) => setPending({ kind: 'hide', article: a })}
        onShow={(a) => void show(a)}
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
      <ConfirmModal
        open={!!pending}
        title={pending?.kind === 'delete' ? `Xoá hẳn bài "${title}"?` : `Tạm ẩn bài "${title}"?`}
        description={
          pending?.kind === 'delete'
            ? 'Bài bị xoá hẳn và AI không dùng bài này nữa. Không hoàn tác được.'
            : 'AI ngừng dùng bài này nhưng bài vẫn được giữ lại. Bạn có thể bấm Dùng lại bất cứ lúc nào.'
        }
        confirmLabel={pending?.kind === 'delete' ? 'Xoá hẳn' : 'Tạm ẩn'}
        danger={pending?.kind === 'delete'}
        busy={busy}
        onClose={() => setPending(null)}
        onConfirm={() => void confirm()}
      />
    </Panel>
  );
}
