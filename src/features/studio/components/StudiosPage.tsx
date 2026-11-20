'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { studioService } from '@/services/studioService';
import type { Studio } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { Pager, pageOf } from '@/components/data/Pager';
import { CARD, Empty, ErrorNote, Loading } from '@/components/data/ui';
import { StudioAccountsModal } from './StudioAccountsModal';
import { StudioModal } from './StudioModal';

const PAGE_SIZE = 15;

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
  const [asking, setAsking] = useState<{ studio: Studio; action: 'deactivate' | 'remove' } | null>(null);
  const [page, setPage] = useState(1);
  const { busy, run } = useAction();
  const { rows, totalPages } = pageOf(studios.data ?? [], page, PAGE_SIZE);
  // After the last studio of the last page goes, step back to the page that still exists.
  if (studios.data && page > totalPages) setPage(totalPages);

  const toggle = async (studio: Studio) => {
    const nextActive = !studio.isActive;
    const done = await run(
      () => studioService.update(studio.id, { isActive: nextActive }),
      nextActive ? 'Đã dùng lại Studio' : 'Đã ngừng dùng Studio',
      (res) => {
        // The studio still makes films: list those projects so the Admin can change their studio first.
        const raw = res.rawDetails as { code?: string; projects?: { id: string; title: string }[] } | undefined;
        if (res.statusCode !== 409 || !(raw?.code === 'STUDIO_HAS_ACTIVE_PROJECTS' || raw?.projects?.length)) return false;
        setBusyProjects({ studioName: studio.name, projects: raw?.projects ?? [] });
        return true;
      },
    );
    setAsking(null);
    if (done) await studios.reload();
  };
  const remove = async (studio: Studio) => {
    if (await run(() => studioService.remove(studio.id), 'Đã xoá Studio')) {
      setAsking(null);
      await studios.reload();
    }
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Studio đối tác</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Studio là đối tác bên thứ ba, đăng nhập Studio Web bằng tài khoản Admin cấp để ký hợp đồng và nộp phim. Mỗi dự án đặt hàng một
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
              <thead className="bg-muted/60 text-muted-foreground text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Studio</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Liên hệ</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell text-right">Dự án</th>
                  <th className="px-4 py-2.5 font-medium">Trạng thái</th>
                  <th className="px-4 py-2.5 w-40" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {rows.map((studio) => {
                  const used = (studio._count?.projects ?? 0) + (studio._count?.handoffs ?? 0) > 0;
                  return (
                    <tr key={studio.id}>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1.5 font-semibold text-foreground">
                          {studio.name}
                        </p>
                        <p className="text-muted-foreground">{studio.email}</p>
                        {studio.note && <p className="text-muted-foreground">{studio.note}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {studio.contactName ?? '-'}
                        {studio.phone && <p className="text-muted-foreground">{studio.phone}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-right text-muted-foreground">{studio._count?.projects ?? 0}</td>
                      <td className="px-4 py-3">
                        <Badge tone={studio.isActive ? 'emerald' : 'neutral'}>{studio.isActive ? 'Đang hoạt động' : 'Ngừng dùng'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {manageAccounts && (
                          <Button size="sm" variant="ghost" onClick={() => setAccountsOf(studio)} aria-label={`Tài khoản của ${studio.name}`}>
                            Tài khoản
                          </Button>
                        )}
                        {manage && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(studio)} aria-label={`Sửa ${studio.name}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" disabled={busy} onClick={() => (studio.isActive ? setAsking({ studio, action: 'deactivate' }) : void toggle(studio))}>
                              {studio.isActive ? 'Ngừng dùng' : 'Dùng lại'}
                            </Button>
                            {!used && (
                              <Button size="sm" variant="ghost" disabled={busy} onClick={() => setAsking({ studio, action: 'remove' })} aria-label={`Xoá ${studio.name}`}>
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
      <Pager page={page} totalPages={totalPages} onChange={setPage} />

      <ConfirmModal
        open={!!asking}
        title={asking?.action === 'remove' ? 'Xoá Studio' : 'Ngừng dùng Studio'}
        description={
          asking?.action === 'remove'
            ? `Xoá ${asking.studio.name} khỏi danh mục. Chỉ xoá được Studio chưa từng nhận dự án; không hoàn tác được.`
            : `${asking?.studio.name ?? ''} không được chọn cho dự án mới nữa. Có thể dùng lại sau.`
        }
        confirmLabel={asking?.action === 'remove' ? 'Xoá Studio' : 'Ngừng dùng'}
        danger
        busy={busy}
        onClose={() => setAsking(null)}
        onConfirm={() => asking && void (asking.action === 'remove' ? remove(asking.studio) : toggle(asking.studio))}
      />

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
            <p className="text-muted-foreground">
              Vui lòng đổi Studio cho các dự án sau trước khi ngừng dùng Studio này:
            </p>
            <ul className="divide-y divide-slate-100 dark:divide-white/5 rounded-2xl border border-border overflow-hidden bg-muted/60">
              {busyProjects.projects.map((p) => (
                <li key={p.id} className="p-3 flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">{p.title}</span>
                  <Link
                    href={`/admin/projects/${p.id}?tab=studio`}
                    className="text-xs font-semibold text-sky-600 hover:underline shrink-0"
                  >
                    Đổi Studio
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
