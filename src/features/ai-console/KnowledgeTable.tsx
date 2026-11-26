'use client';

import { MetaPager } from '@/components/data/MetaPager';
import { Empty, ErrorNote, Loading, StatusPill } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import type { Resource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import type { Page } from '@/types/production';
import type { KnowledgeArticle } from '@/types/support';
import { ARTICLE_STATE, articleState } from './aiLabels';

interface Props {
  resource: Resource<Page<KnowledgeArticle>>;
  busy: boolean;
  filtered: boolean;
  onPage: (page: number) => void;
  onEdit: (a: KnowledgeArticle) => void;
  onRetry: (a: KnowledgeArticle) => void;
  onHide: (a: KnowledgeArticle) => void;
  onShow: (a: KnowledgeArticle) => void;
  onDelete: (a: KnowledgeArticle) => void;
}

/** One row per article: title, topic, state in plain words, last change, and what can be done with it. */
export function KnowledgeTable({ resource, busy, filtered, onPage, onEdit, onRetry, onHide, onShow, onDelete }: Props) {
  const page = resource.data;
  if (resource.error) return <ErrorNote message={resource.error} onRetry={resource.reload} />;
  if (!page) return <Loading />;
  if (!page.data.length) {
    return <Empty>{filtered ? 'Không có bài nào khớp bộ lọc.' : 'Chưa có bài kiến thức nào. Thêm bài đầu tiên để AI có nội dung trả lời.'}</Empty>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="py-2 pr-3 font-medium">Tiêu đề</th>
              <th className="py-2 pr-3 font-medium">Chủ đề</th>
              <th className="py-2 pr-3 font-medium">Tình trạng</th>
              <th className="py-2 pr-3 font-medium">Sửa lần cuối</th>
              <th className="py-2 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {page.data.map((a) => {
              const state = articleState(a);
              return (
                <tr key={a.id}>
                  <td className="max-w-80 py-2.5 pr-3">
                    <p className="truncate font-medium" title={a.title}>
                      {a.title}
                    </p>
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{a.category}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    <StatusPill {...ARTICLE_STATE[state]} />
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-muted-foreground">{formatDateTime(a.updatedAt)}</td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(a)}>
                        Sửa
                      </Button>
                      {state === 'NOT_READ' && (
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onRetry(a)}>
                          Thử lại
                        </Button>
                      )}
                      {a.status === 'ARCHIVED' ? (
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onShow(a)}>
                          Dùng lại
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onHide(a)}>
                          Tạm ẩn
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" disabled={busy} onClick={() => onDelete(a)} className="text-destructive hover:text-destructive">
                        Xoá
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <MetaPager meta={page.meta} onPage={onPage} />
    </>
  );
}
