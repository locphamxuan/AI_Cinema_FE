'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Coins, Eye, Film, Heart, Megaphone, ShoppingCart } from 'lucide-react';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { formatNumber } from '@/lib/format';
import { productionPaths } from '@/features/production/lib/routes';
import { filmReportService } from '@/services/filmReportService';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import type { FilmFigures } from '@/types/film-report';
import { EpisodeAdSlotsModal } from './EpisodeAdSlotsModal';
import { Pager, pageOf } from '@/components/data/Pager';

const STAT = 'inline-flex items-center gap-1 tabular-nums';

/**
 * Film management: one tab per genre (a movie of several genres shows in each of them), and for every movie its
 * hearts, plays, purchases and the Coin Members paid, then the same figures episode by episode.
 */
export function AdminMoviesPanel() {
  const genres = useResource('admin:films:genres', filmReportService.genres);
  const [chosen, setChosen] = useState<string | null>(null);
  const genreId = chosen ?? genres.data?.[0]?.id ?? null;
  const films = useResource(genreId ? `admin:films:${genreId}` : null, () => filmReportService.movies(genreId!));
  const [open, setOpen] = useState<string | null>(null);
  const [adsOf, setAdsOf] = useState<{ id: string; label: string } | null>(null);
  const can = useCan();
  const rows = films.data ?? [];
  const [page, setPage] = useState(1);
  const paged = pageOf(rows ?? [], page, 10);
  const total = (key: 'likeCount' | 'viewCount' | 'purchases' | 'coinsEarned') => rows.reduce((n, f) => n + f[key], 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Quản lý phim</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Phim đang có trên nền tảng theo từng thể loại: số tim, lượt xem, lượt mua và Coin Member đã trả, chi tiết tới từng tập.
        </p>
      </div>
      {genres.error && <ErrorNote message={genres.error} onRetry={genres.reload} />}
      {genres.loading && !genres.data && <Loading />}
      {genres.data && (
        <div role="tablist" aria-label="Thể loại" className="flex gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-white/5 overflow-x-auto">
          {genres.data.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={g.id === genreId}
              onClick={() => { setChosen(g.id); setOpen(null); }}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                g.id === genreId ? 'bg-white dark:bg-sky-600 text-sky-800 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {g.name} <span className="opacity-60">({g.movieCount})</span>
            </button>
          ))}
        </div>
      )}
      {genres.data?.length === 0 && <Empty>Chưa có phim nào trên nền tảng.</Empty>}
      {genreId && (
        <Panel
          title={genres.data?.find((g) => g.id === genreId)?.name ?? 'Thể loại'}
          description={`${rows.length} phim · ${formatNumber(total('likeCount'))} tim · ${formatNumber(total('viewCount'))} lượt xem · ${formatNumber(total('purchases'))} lượt mua · ${formatNumber(total('coinsEarned'))} Coin`}
        >
          {films.error && <ErrorNote message={films.error} onRetry={films.reload} />}
          {films.loading && !films.data && <Loading />}
          {films.data && rows.length === 0 && <Empty>Thể loại này chưa có phim.</Empty>}
          {rows.length > 0 && (
            <div className="overflow-x-auto -mx-6 -my-6">
              <table className="w-full text-xs">
                <thead className="text-[11px] text-slate-500 text-left bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Phim</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Tim</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Lượt xem</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Lượt mua</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Coin nhận được</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {paged.rows.map((film) => (
                    <FilmRow
                      key={film.id}
                      film={film}
                      expanded={open === film.id}
                      onToggle={() => setOpen(open === film.id ? null : film.id)}
                      onAds={can(PERMISSION.AD_MANAGE) ? setAdsOf : undefined}
                    />
                  ))}
                </tbody>
              </table>
              <Pager page={page} totalPages={paged.totalPages} onChange={setPage} className="px-4 pb-4" />
            </div>
          )}
        </Panel>
      )}
      {adsOf && <EpisodeAdSlotsModal episode={adsOf} onClose={() => setAdsOf(null)} />}
    </div>
  );
}

interface FilmRowProps {
  film: FilmFigures;
  expanded: boolean;
  onToggle: () => void;
  /** Present for an account allowed to place the episode's ads (BR-32). */
  onAds?: (episode: { id: string; label: string }) => void;
}

function FilmRow({ film, expanded, onToggle, onAds }: FilmRowProps) {
  const many = film.episodes.length > 1;
  return (
    <Fragment>
      <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-label={`${expanded ? 'Ẩn' : 'Xem'} từng tập của ${film.title}`}
              className="text-slate-400 hover:text-sky-700 cursor-pointer"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {film.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={film.posterUrl} alt="" className="w-9 h-12 rounded-md object-cover bg-slate-200 dark:bg-white/10" />
            ) : (
              <span className="w-9 h-12 rounded-md bg-slate-200 dark:bg-white/10 flex items-center justify-center"><Film className="w-4 h-4 text-slate-400" /></span>
            )}
            <div className="min-w-0">
              <Link href={productionPaths.project('/admin', film.id, 'episodes')} className="font-semibold text-slate-900 dark:text-white hover:text-sky-700">
                {film.title}
              </Link>
              <p className="text-[11px] text-slate-500">
                {film.episodes.length} tập{film.releaseYear ? ` · ${film.releaseYear}` : ''}{film.ageRating ? ` · ${film.ageRating}` : ''} · {film.genres.map((g) => g.name).join(', ')}
              </p>
            </div>
          </div>
        </td>
        <td className="py-3 px-3 text-right"><span className={`${STAT} text-rose-600`}><Heart className="w-3 h-3" />{formatNumber(film.likeCount)}</span></td>
        <td className="py-3 px-3 text-right"><span className={STAT}><Eye className="w-3 h-3" />{formatNumber(film.viewCount)}</span></td>
        <td className="py-3 px-3 text-right"><span className={STAT}><ShoppingCart className="w-3 h-3" />{formatNumber(film.purchases)}</span></td>
        <td className="py-3 px-4 text-right">
          <span className={`${STAT} text-amber-600 font-bold`}><Coins className="w-3 h-3" />{formatNumber(film.coinsEarned)}</span>
          {film.refundedCoins > 0 && <span className="block text-xs text-rose-500">đã hoàn {formatNumber(film.refundedCoins)}</span>}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/60 dark:bg-white/[0.02]">
          <td colSpan={5} className="px-4 py-3">
            {!many && <p className="text-[11px] text-slate-500 mb-2">Phim một tập - số liệu của tập chính là của phim.</p>}
            <table className="w-full text-[11px]">
              <thead className="text-slate-500 text-left">
                <tr>
                  <th className="py-1.5 pl-10">Tập</th>
                  <th className="py-1.5 text-right">Giá</th>
                  <th className="py-1.5 text-right">Lượt xem</th>
                  <th className="py-1.5 text-right">Lượt mua</th>
                  <th className="py-1.5 pr-0 text-right">Coin nhận được</th>
                  {onAds && <th className="py-1.5 pl-3 text-right">Quảng cáo</th>}
                </tr>
              </thead>
              <tbody>
                {film.episodes.map((e) => (
                  <tr key={e.id} className="border-t border-slate-200/60 dark:border-white/5">
                    <td className="py-1.5 pl-10">Tập {e.episodeNumber}{e.title && e.title !== `Tập ${e.episodeNumber}` ? ` - ${e.title}` : ''}</td>
                    <td className="py-1.5 text-right tabular-nums">{e.coinPrice ? `${e.coinPrice} Coin` : 'Miễn phí'}</td>
                    <td className="py-1.5 text-right tabular-nums">{formatNumber(e.views)}</td>
                    <td className="py-1.5 text-right tabular-nums">{formatNumber(e.purchases)}</td>
                    <td className="py-1.5 text-right tabular-nums text-amber-600">
                      {formatNumber(e.coinsEarned)}
                      {e.refundedCoins > 0 && <span className="text-rose-500"> (hoàn {formatNumber(e.refundedCoins)})</span>}
                    </td>
                    {onAds && (
                      <td className="py-1.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => onAds({ id: e.id, label: `${film.title} - Tập ${e.episodeNumber}` })}
                          className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800 font-semibold cursor-pointer"
                        >
                          <Megaphone className="w-3 h-3" /> Đặt vị trí
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </Fragment>
  );
}