'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileSignature, Film, ScrollText } from 'lucide-react';
import { StatCard } from '@/components/data/StatCard';
import { useAction } from '@/hooks/useAction';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { formatVnd } from '@/lib/format';
import { productionService } from '@/services/productionService';
import type { AdminPipeline, ContractToSign, ReadyFilm } from '../adminPipeline';

const CARD = 'rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-xs';

export function PortalMetrics({ data }: { data: AdminPipeline }) {
  return (
    <section aria-label="Thống kê dự án và hợp đồng" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Kịch bản chờ duyệt Final" value={data.finalScripts.length} icon={ScrollText} accent={1} note="Duyệt xong là hợp đồng tự gửi Studio" />
        <StatCard label="Hợp đồng chờ Admin ký" value={data.contractsToSign.length} icon={FileSignature} accent={0} note="Studio đã ký trước" />
        <StatCard label="Phim Final chờ phát hành" value={data.readyFilms.length} icon={Film} accent={2} note="Đã gắn nhãn AI và qua kiểm tra pháp lý" />
      </div>
      {data.finalScripts.length > 0 && (
        <ul aria-label="Kịch bản chờ duyệt Final" className="flex flex-wrap gap-2 pt-1 text-xs">
          {data.finalScripts.map((project) => (
            <li key={project.id}>
              <Link href={`/admin/projects/${project.id}?tab=script`} className="inline-block px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 font-semibold">
                Duyệt kịch bản: {project.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PortalContractQuickSign({ items, onOpen }: { items: ContractToSign[]; onOpen: (item: ContractToSign) => void }) {
  const first = items[0];
  return (
    <section aria-label="Ký duyệt hợp đồng Studio" className={`${CARD} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
      <div className="flex items-start gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
            Ký duyệt hợp đồng Studio {items.length > 1 && `(${items.length} hợp đồng chờ)`}
          </span>
          {first ? (
            <>
              <h3 className="text-lg font-bold text-foreground">
                Dự án: {first.project.title} • Đối tác: <span className="text-indigo-600 dark:text-indigo-300">{first.contract.studio.name}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Studio đề xuất <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums">{formatVnd(first.contract.costVnd)}</strong> và đã ký; chờ Admin ký hoặc đề xuất giá khác.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Không có hợp đồng nào chờ Admin ký.</p>
          )}
        </div>
      </div>
      {first && (
        <button type="button" onClick={() => onOpen(first)} className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-white/[0.06] hover:bg-muted/60 text-foreground border border-input text-xs font-semibold cursor-pointer transition-all">
          Xem Báo Giá &amp; Ký
        </button>
      )}
    </section>
  );
}

function ReadyFilmRow({ film: { project, episode }, onPublished }: { film: ReadyFilm; onPublished: () => Promise<void> }) {
  const { busy, run } = useAction();
  const [confirming, setConfirming] = useState(false);
  const publish = async () => {
    if (await run(() => productionService.publish(episode.id), `Đã phát hành tập ${episode.episodeNumber}`)) {
      setConfirming(false);
      await onPublished();
    }
  };
  return (
    <li className="rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-black/60 shrink-0 border border-border flex items-center justify-center">
          {project.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.posterUrl} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[11px] text-muted-foreground">Chưa có ảnh</span>
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{project.genres.map((g) => g.name).join(' / ')}</span>
          <h4 className="text-sm sm:text-base font-bold text-foreground truncate">
            {project.title} - Tập {episode.episodeNumber}: {episode.title}
          </h4>
          <p className="text-xs text-muted-foreground">Reviewer xác nhận: {project.reviewer.fullName}</p>
        </div>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold">
        Đã gắn nhãn AI & đạt tuân thủ
      </span>
      <span className="shrink-0 text-xs font-bold text-foreground flex items-center gap-1.5">
        {project.studio?.name ?? '-'}
      </span>
      <div className="shrink-0 flex flex-wrap gap-2">
        <Link href={`/admin/projects/${project.id}/episodes/${episode.id}`} className="px-4 py-2.5 rounded-full border border-input text-xs font-semibold text-secondary-foreground hover:bg-muted/60 transition-all">
          Xem Phim Final
        </Link>
        <button type="button" disabled={busy} onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 transition-all">
          Phát Hành Ngay
        </button>
      </div>
      <ConfirmModal
        open={confirming}
        title="Phát hành ngay"
        description={`${project.title} - Tập ${episode.episodeNumber}: ${episode.title} lên kệ ngay cho Member. Muốn hẹn giờ thì mở Phim Final.`}
        confirmLabel="Phát hành"
        busy={busy}
        onClose={() => setConfirming(false)}
        onConfirm={() => void publish()}
      />
    </li>
  );
}

export function PortalReadyFilms({ films, onPublished }: { films: ReadyFilm[]; onPublished: () => Promise<void> }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? films : films.slice(0, 5);
  return (
    <section aria-label="Phim Final chờ phát hành" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Phim Final chờ phát hành
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Reviewer đã duyệt, gắn nhãn AI, đạt tuân thủ, đặt giá Coin và xác nhận Phim Final.</p>
        </div>
        <span className="text-xs tabular-nums font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
          {films.length} tập chờ lên sóng
        </span>
      </div>
      {films.length === 0 && <p className="text-sm text-muted-foreground">Chưa có Phim Final nào chờ phát hành.</p>}
      <ul className="space-y-3">
        {shown.map((film) => (
          <ReadyFilmRow key={film.episode.id} film={film} onPublished={onPublished} />
        ))}
      </ul>
      {films.length > shown.length && (
        <button type="button" onClick={() => setShowAll(true)} className="text-xs font-semibold text-foreground hover:underline cursor-pointer">
          Xem thêm {films.length - shown.length} tập
        </button>
      )}
    </section>
  );
}
