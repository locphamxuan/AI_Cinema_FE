'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KeyRound, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { studioService } from '@/services/studioService';
import type { Studio } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { CARD, Empty, ErrorNote, Loading } from '@/components/data/ui';
import { StudioAccountsModal } from './StudioAccountsModal';
import { StudioModal } from './StudioModal';

/**
 * Catalog of partner studios (BR-59): add, edit, deactivate and remove the studios a project can be ordered from;
 * the Admin also opens each studio's STUDIO login accounts for Studio Web.
 */
export function StudiosPage() {
  const pathname = usePathname();
  const isReviewer = Boolean(pathname?.startsWith('/reviewer'));
  const can = useCan();
  const manage = !isReviewer && can(PERMISSION.STUDIO_MANAGE);
  const manageAccounts = !isReviewer && can(PERMISSION.USER_MANAGE);
  const [accountsOf, setAccountsOf] = useState<Studio | null>(null);
  const studios = useResource('studios:all', () => studioService.list());
  const [editing, setEditing] = useState<Studio | 'new' | null>(null);
  const [busyProjects, setBusyProjects] = useState<{ studioName: string; projects: { id: string; title: string }[] } | null>(null);
  const { busy, run } = useAction();

  const toggle = async (studio: Studio) => {
    const nextActive = !studio.isActive;
    const res = await studioService.update(studio.id, { isActive: nextActive });
    if (res.success) {
      toast.success(nextActive ? 'Đã dùng lại Studio' : 'Đã ngừng dùng Studio');
      await studios.reload();
      return;
    }
    const raw = res.rawDetails as { code?: string; projects?: { id: string; title: string }[] } | undefined;
    if (res.statusCode === 409 && (raw?.code === 'STUDIO_HAS_ACTIVE_PROJECTS' || raw?.projects?.length)) {
      setBusyProjects({ studioName: studio.name, projects: raw?.projects ?? [] });
      return;
    }
    toast.error('Không cập nhật được trạng thái Studio', res.message || 'Lỗi hệ thống');
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
            Studio là đối tác bên thứ 3, đăng nhập Studio Web bằng tài khoản Admin cấp để ký hợp đồng và nộp phim. Mỗi dự án đặt hàng một
            Studio đang hoạt động.
          </p>
        </div>
        {manage && (
          <Button onClick={() => setEditing('new')}>
            Thêm Studio
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
                  <th className="px-4 py-2.5 w-40" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {studios.data.map((studio) => {
                  const used = (studio._count?.projects ?? 0) + (studio._count?.handoffs ?? 0) > 0;
                  return (
                    <tr key={studio.id}>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                          {studio.name}
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
                        {manageAccounts && (
                          <Button size="sm" variant="ghost" onClick={() => setAccountsOf(studio)} aria-label={`Tài khoản của ${studio.name}`}>
                            <KeyRound className="w-3.5 h-3.5" /> Tài khoản
                          </Button>
                        )}
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

      {accountsOf && <StudioAccountsModal studio={accountsOf} onClose={() => setAccountsOf(null)} />}
      {editing && <StudioModal studio={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={studios.reload} />}
      {busyProjects && (
        <Modal
          open
          onClose={() => setBusyProjects(null)}
          title="Không thể ngừng dùng Studio"
          subtitle={`Studio ${busyProjects.studioName} đang có ${busyProjects.projects.length} dự án sản xuất chưa hoàn tất`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Vui lòng đổi Studio cho các dự án sau trước khi ngừng dùng Studio này:
            </p>
            <ul className="divide-y divide-slate-100 dark:divide-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
              {busyProjects.projects.map((p) => (
                <li key={p.id} className="p-3 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{p.title}</span>
                  <Link
                    href={`/admin/projects/${p.id}?tab=studio`}
                    className="text-xs font-semibold text-sky-600 hover:underline shrink-0"
                  >
                    Đổi Studio &rarr;
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setBusyProjects(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
