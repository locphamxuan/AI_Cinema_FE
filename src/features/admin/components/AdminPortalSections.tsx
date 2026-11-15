'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, FileSignature, Film, Rocket, ShieldCheck } from 'lucide-react';
import { useAction } from '@/hooks/useAction';
import { formatVnd } from '@/lib/format';
import { productionService } from '@/services/productionService';
import type { AdminPipeline, ContractToSign, ReadyFilm } from '../adminPipeline';

const CARD = 'rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-xs';

function Dot({ tone, value, label }: { tone: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tone}`} />
      <span>
        <strong>{value}</strong> {label}
      </span>
    </div>
  );
}

export function PortalMetrics({ data }: { data: AdminPipeline }) {
  return (
    <section aria-label="Thống kê dự án và hợp đồng" className={`${CARD} space-y-5`}>
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dự Án & Hợp Đồng Đang Chạy</h2>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{data.totalProjects}</span>
        <span className="text-base font-bold text-slate-500 dark:text-slate-400">Dự án phim trong hệ thống</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <Dot tone="bg-emerald-500" value={data.completedProjects} label="Dự án đã hoàn tất" />
        <Dot tone="bg-purple-500" value={data.producingProjects} label="Dự án đã ký hợp đồng, đang sản xuất" />
        <Dot tone="bg-amber-500" value={data.finalScripts.length} label="Kịch bản chờ Admin duyệt Final" />
        <Dot tone="bg-slate-900 dark:bg-white" value={data.readyFilms.length} label="Phim Final chờ Publish" />
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
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
          <FileSignature className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Ký Duyệt Hợp Đồng Studio {items.length > 1 && `(${items.length} hợp đồng chờ)`}
          </span>
          {first ? (
            <>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dự án: {first.project.title} • Đối tác: <span className="text-indigo-600 dark:text-indigo-300">{first.contract.studio.name}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Studio đề xuất <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatVnd(first.contract.costVnd)}</strong> và đã ký; chờ Admin ký hoặc đề xuất giá khác.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">Không có hợp đồng nào chờ Admin ký.</p>
          )}
        </div>
      </div>
      {first && (
        <button type="button" onClick={() => onOpen(first)} className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] text-slate-900 dark:text-white border border-slate-300 dark:border-white/15 text-xs font-semibold cursor-pointer transition-all">
          Xem Báo Giá &amp; Ký <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

function ReadyFilmRow({ film: { project, episode }, onPublished }: { film: ReadyFilm; onPublished: () => Promise<void> }) {
  const { busy, run } = useAction();
  const publish = async () => {
    if (await run(() => productionService.publish(episode.id), `Đã phát hành tập ${episode.episodeNumber}`)) await onPublished();
  };
  return (
    <li className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-black/60 shrink-0 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center">
          {project.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.posterUrl} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <Film className="w-6 h-6 text-slate-400" aria-hidden="true" />
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{project.genres.map((g) => g.name).join(' / ')}</span>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {project.title} - Tập {episode.episodeNumber}: {episode.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Reviewer xác nhận: {project.reviewer.fullName}</p>
        </div>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold">
        <ShieldCheck className="w-3.5 h-3.5" /> Đã gắn nhãn AI & đạt tuân thủ
      </span>
      <span className="shrink-0 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {project.studio?.name ?? '-'}
      </span>
      <div className="shrink-0 flex flex-wrap gap-2">
        <Link href={`/admin/projects/${project.id}/episodes/${episode.id}`} className="px-4 py-2.5 rounded-full border border-slate-300 dark:border-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
          Xem Phim Final
        </Link>
        <button type="button" disabled={busy} onClick={publish} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 transition-all">
          <Rocket className="w-4 h-4" /> Phát Hành Ngay
        </button>
      </div>
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
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Rocket className="w-5 h-5 text-slate-900 dark:text-white" /> Phim Final — Sẵn Sàng Phát Hành
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reviewer đã duyệt, gắn nhãn AI, đạt tuân thủ, đặt giá Coin và xác nhận Phim Final.</p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-3 py-1 rounded-full border border-slate-200 dark:border-white/[0.08]">
          {films.length} tập chờ lên sóng
        </span>
      </div>
      {films.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có Phim Final nào chờ phát hành.</p>}
      <ul className="space-y-3">
        {shown.map((film) => (
          <ReadyFilmRow key={film.episode.id} film={film} onPublished={onPublished} />
        ))}
      </ul>
      {films.length > shown.length && (
        <button type="button" onClick={() => setShowAll(true)} className="text-xs font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer">
          Xem thêm {films.length - shown.length} tập
        </button>
      )}
    </section>
  );
}
