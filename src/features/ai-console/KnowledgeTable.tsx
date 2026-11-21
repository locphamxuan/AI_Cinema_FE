'use client';

import { Archive, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { MetaPager } from '@/components/data/MetaPager';
import { Empty, ErrorNote, Loading, StatusPill } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import type { Resource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import type { Page } from '@/types/production';
import type { KnowledgeArticle } from '@/types/support';
import { ARTICLE_STATUS, AUDIENCE, INDEX_STATUS } from './aiLabels';

interface Props {
  resource: Resource<Page<KnowledgeArticle>>;
  busy: boolean;
  filtered: boolean;
  onPage: (page: number) => void;
  onEdit: (a: KnowledgeArticle) => void;
  onReindex: (a: KnowledgeArticle) => void;
  onArchive: (a: KnowledgeArticle) => void;
  onDelete: (a: KnowledgeArticle) => void;
}

/** One row per article: where it stands for the AI (status, index) and what can be done with it. */
export function KnowledgeTable({ resource, busy, filtered, onPage, onEdit, onReindex, onArchive, onDelete }: Props) {
  const page = resource.data;
  if (resource.error) return <ErrorNote message={resource.error} onRetry={resource.reload} />;
  if (!page) return <Loading />;
  if (!page.data.length) {
    return <Empty>{filtered ? 'Không có bài nào khớp bộ lọc.' : 'Kho tri thức còn trống. Thêm bài đầu tiên để AI có nội dung trả lời.'}</Empty>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2 pr-3 font-medium">Tiêu đề</th>
              <th className="py-2 pr-3 font-medium">Danh mục</th>
              <th className="py-2 pr-3 font-medium">Đối tượng</th>
              <th className="py-2 pr-3 font-medium">Trạng thái</th>
              <th className="py-2 pr-3 font-medium">Chỉ mục</th>
              <th className="py-2 pr-3 font-medium">Cập nhật lúc</th>
              <th className="py-2 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {page.data.map((a) => (
              <tr key={a.id}>
                <td className="max-w-72 py-2.5 pr-3">
                  <p className="truncate font-medium" title={a.title}>
                    {a.title}
                  </p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {a.slug} · v{a.version}
                  </p>
                </td>
                <td className="py-2.5 pr-3">{a.category}</td>
                <td className="py-2.5 pr-3">{AUDIENCE[a.audience]}</td>
                <td className="py-2.5 pr-3">
                  <StatusPill {...ARTICLE_STATUS[a.status]} />
                </td>
                <td className="py-2.5 pr-3" title={a.indexError ?? undefined}>
                  <StatusPill {...INDEX_STATUS[a.indexStatus]} />
                  {a.indexStatus === 'FAILED' && a.indexError && <p className="mt-1 max-w-48 truncate text-[11px] text-destructive">{a.indexError}</p>}
                </td>
                <td className="py-2.5 pr-3 whitespace-nowrap">{formatDateTime(a.updatedAt)}</td>
                <td className="py-2.5">
                  <div className="flex justify-end gap-1">
                    <IconAction label="Sửa" onClick={() => onEdit(a)} icon={<Pencil className="size-3.5" />} />
                    <IconAction
                      label="Lập lại chỉ mục"
                      disabled={busy || a.status !== 'PUBLISHED'}
                      onClick={() => onReindex(a)}
                      icon={<RefreshCw className="size-3.5" />}
                    />
                    <IconAction label="Lưu trữ" disabled={busy || a.status === 'ARCHIVED'} onClick={() => onArchive(a)} icon={<Archive className="size-3.5" />} />
                    <IconAction label="Xoá" danger disabled={busy} onClick={() => onDelete(a)} icon={<Trash2 className="size-3.5" />} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MetaPager meta={page.meta} onPage={onPage} />
    </>
  );
}

function IconAction({ label, icon, onClick, disabled, danger }: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <Button size="sm" variant="ghost" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={danger ? 'text-destructive hover:text-destructive' : undefined}>
      {icon}
    </Button>
  );
}
