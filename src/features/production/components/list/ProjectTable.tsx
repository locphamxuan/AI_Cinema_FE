'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProjectSummary } from '@/types/production';
import { MOVIE_STATUS } from '../../lib/labels';
import { formatDateTime } from '@/lib/format';
import { productionPaths, type ProductionBase } from '../../lib/routes';
import { CARD, StatusPill } from '@/components/data/ui';

/** The projects as a table; a Creator sees who reviews each one, the others who creates it. */
export function ProjectTable({ projects, base }: { projects: ProjectSummary[]; base: ProductionBase }) {
  const router = useRouter();
  const isCreator = base === '/creator';
  return (
    <div className={`${CARD} overflow-hidden`}>
      <table className="w-full text-xs">
        <thead className="bg-muted/60 text-muted-foreground text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Phim</th>
            <th className="px-4 py-3 font-semibold">Trạng thái</th>
            <th className="px-4 py-3 font-semibold hidden md:table-cell">Studio</th>
            <th className="px-4 py-3 font-semibold hidden md:table-cell">{isCreator ? 'Reviewer' : 'Creator'}</th>
            <th className="px-4 py-3 font-semibold hidden sm:table-cell text-right">Số tập</th>
            <th
              className="px-4 py-3 font-semibold hidden lg:table-cell"
              title="Thời điểm thay đổi gần nhất của dự án: sửa thông tin, mùa/tập, giao cho Studio, duyệt, phát hành…"
            >
              Cập nhật lần cuối
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {projects.map((p) => {
            const href = productionPaths.project(base, p.id);
            return (
              <tr key={p.id} onClick={() => router.push(href)} className="hover:bg-muted/60 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={href}
                    className="font-semibold text-foreground hover:underline hover:text-sky-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusPill {...MOVIE_STATUS[p.status]} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{p.studio?.name ?? '—'}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {(isCreator ? p.reviewer : p.creator)?.fullName ?? 'Chưa giao'}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-right text-muted-foreground font-bold tabular-nums">
                  {p._count.episodes}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{formatDateTime(p.lastActivityAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
