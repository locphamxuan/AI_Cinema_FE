'use client';

import { useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { studioService } from '@/services/studioService';
import type { Studio } from '@/types/production';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { CARD, Empty, ErrorNote, Loading } from '@/features/production/components/shared/ui';
import { StudioModal } from './StudioModal';

/** Catalog of partner studios (BR-59): the Reviewer adds, edits, deactivates and removes the studios a project can be ordered from. */
export function StudiosPage() {
  const can = useCan();
  const manage = can(PERMISSION.STUDIO_MANAGE);
  const studios = useResource('studios:all', () => studioService.list());
  const [editing, setEditing] = useState<Studio | 'new' | null>(null);
  const { busy, run } = useAction();

  const toggle = async (studio: Studio) => {
    if (await run(() => studioService.update(studio.id, { isActive: !studio.isActive }), studio.isActive ? 'Đã ngừng dùng Studio' : 'Đã dùng lại Studio')) {
      await studios.reload();
    }
  };
  const remove = async (studio: Studio) => {
    if (await run(() => studioService.remove(studio.id), 'Đã xoá Studio')) await studios.reload();
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Studio đối tác</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Studio là đối tác bên thứ 3, không có tài khoản: brief và material được gửi qua email. Mỗi dự án đặt hàng một Studio đang hoạt động.
          </p>
        </div>
        {manage && (
          <Button onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" aria-hidden="true" /> Thêm Studio
          </Button>
        )}
      </div>

      {studios.error && <ErrorNote message={studios.error} onRetry={studios.reload} />}
      {studios.loading && !studios.data && <Loading />}

      {studios.data && (
        <div className={`${CARD} overflow-hidden`}>
          {studios.data.length === 0 ? (
            <Empty>Chưa có Studio nào trong danh mục.</Empty>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Studio</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Liên hệ</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell text-right">Dự án</th>
                  <th className="px-4 py-2.5 font-medium">Trạng thái</th>
                  <th className="px-4 py-2.5 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {studios.data.map((studio) => {
                  const used = (studio._count?.projects ?? 0) + (studio._count?.handoffs ?? 0) > 0;
                  return (
                    <tr key={studio.id}>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" /> {studio.name}
                        </p>
                        <p className="text-slate-500">{studio.email}</p>
                        {studio.note && <p className="text-slate-400">{studio.note}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                        {studio.contactName ?? '-'}
                        {studio.phone && <p className="text-slate-400">{studio.phone}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-right text-slate-600 dark:text-slate-300">{studio._count?.projects ?? 0}</td>
                      <td className="px-4 py-3">
                        <Badge tone={studio.isActive ? 'emerald' : 'neutral'}>{studio.isActive ? 'Đang hoạt động' : 'Ngừng dùng'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {manage && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(studio)} aria-label={`Sửa ${studio.name}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" disabled={busy} onClick={() => toggle(studio)}>
                              {studio.isActive ? 'Ngừng dùng' : 'Dùng lại'}
                            </Button>
                            {!used && (
                              <Button size="sm" variant="ghost" disabled={busy} onClick={() => remove(studio)} aria-label={`Xoá ${studio.name}`}>
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {editing && <StudioModal studio={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={studios.reload} />}
    </main>
  );
}
