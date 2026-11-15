'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusPill } from '@/components/data/ui';
import { HlsPreview } from '@/features/production/components/episode/HlsPreview';
import { AI_PARTS, EPISODE_STATUS, INGEST_STATUS, LABEL_TYPE, SCRIPT_STATUS } from '@/features/production/lib/labels';
import type { Episode, MediaAsset, ProjectDetail, ProjectScript } from '@/types/production';

const TAB = 'px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all';
const tabClass = (active: boolean) => `${TAB} ${active ? 'bg-[#121212] text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`;
const NAV = 'w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5';

/** Centre of the audit desk: the delivered version on the player, its versions, the script and the AI disclosure. */
export function ReviewerAuditCanvas({
  project,
  episode,
  versions,
  selected,
  script,
  onPick,
  previousHref,
  nextHref,
}: {
  project: ProjectDetail;
  episode: Episode;
  versions: MediaAsset[];
  selected: MediaAsset | null;
  script: ProjectScript | null;
  onPick: (id: string) => void;
  previousHref: string | null;
  nextHref: string | null;
}) {
  const [tab, setTab] = useState<'script' | 'ai'>('script');
  const latestScript = script?.versions[0];

  return (
    <div className="flex-1 min-w-0 h-full bg-[#F9FAFB] dark:bg-[#090B10] p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="min-w-0">
          <Link href={`/reviewer/projects/${project.id}`} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">
            {project.title}
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2">
            Tập {episode.episodeNumber}: {episode.title} <StatusPill {...EPISODE_STATUS[episode.status]} />
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          {previousHref && (
            <Link href={previousHref} aria-label="Tập trước trong hàng đợi" className={NAV}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          {nextHref && (
            <Link href={nextHref} aria-label="Tập sau trong hàng đợi" className={NAV}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </header>

      {selected?.streamUrl && selected.ingestStatus === 'READY' ? (
        <section aria-label="Xem bản dựng">
          <HlsPreview src={selected.streamUrl} />
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-10 text-center text-sm text-slate-500">
          {selected ? `Bản ${selected.version}: ${INGEST_STATUS[selected.ingestStatus].label}` : 'Studio chưa nộp bản phim nào cho tập này.'}
        </p>
      )}

      {versions.length > 0 && (
        <div role="group" aria-label="Các bản Studio đã nộp" className="flex flex-wrap items-center gap-2 text-xs">
          {versions.map((v) => (
            <button key={v.id} type="button" aria-pressed={v.id === selected?.id} onClick={() => onPick(v.id)} className={tabClass(v.id === selected?.id)}>
              Bản {v.version}
            </button>
          ))}
        </div>
      )}

      <section className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-5 space-y-4">
        <div role="tablist" aria-label="Đối chiếu" className="flex items-center gap-2">
          <button type="button" role="tab" aria-selected={tab === 'script'} onClick={() => setTab('script')} className={tabClass(tab === 'script')}>
            Kịch bản
          </button>
          <button type="button" role="tab" aria-selected={tab === 'ai'} onClick={() => setTab('ai')} className={tabClass(tab === 'ai')}>
            Khai báo AI
          </button>
        </div>

        {tab === 'script' &&
          (latestScript ? (
            <div className="space-y-2 text-xs">
              <p className="flex flex-wrap items-center gap-2 text-slate-500">
                Bản {latestScript.version} <StatusPill {...SCRIPT_STATUS[script.status]} />
              </p>
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 dark:bg-white/5 p-3 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-200">{latestScript.content}</pre>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Dự án chưa có kịch bản.</p>
          ))}

        {tab === 'ai' &&
          (selected ? (
            <dl className="text-xs space-y-2 text-slate-700 dark:text-slate-200">
              <div>
                <dt className="font-semibold">Phần do AI tạo</dt>
                <dd>{selected.aiDisclosure.aiGeneratedParts.map((p) => AI_PARTS.find((x) => x.value === p)?.label ?? p).join(', ')}</dd>
              </div>
              <div>
                <dt className="font-semibold">Nhãn Studio đề xuất</dt>
                <dd>{LABEL_TYPE[selected.proposedLabelType]}</dd>
              </div>
              <div>
                <dt className="font-semibold">Cam kết của Studio</dt>
                <dd>
                  {selected.aiDisclosure.noRealPersonLikeness ? 'Không mô phỏng người thật' : 'Chưa cam kết về người thật'} ·{' '}
                  {selected.aiDisclosure.noCopyrightedMaterial ? 'Không dùng tác phẩm có bản quyền' : 'Chưa cam kết về bản quyền'}
                </dd>
              </div>
              {selected.submissionNote && (
                <div>
                  <dt className="font-semibold">Ghi chú khi nộp</dt>
                  <dd className="whitespace-pre-line">{selected.submissionNote}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-xs text-slate-500">Chưa có bản phim để xem khai báo AI.</p>
          ))}
      </section>
    </div>
  );
}
