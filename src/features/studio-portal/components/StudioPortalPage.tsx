'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, Film, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDateTime, formatNumber, saveBlob } from '@/features/production/lib/format';
import { Facts, Loading, Panel } from '@/features/production/components/shared/ui';
import { studioPortalService } from '@/services/studioPortalService';
import type { StudioPortalOverview } from '@/types/studio-portal';
import { PortalEpisodes } from './PortalEpisodes';
import { RespondPanel } from './RespondPanel';

const POLL_MS = 5000;

/** A delivery the platform is still processing: the page refreshes until it settles. */
function processing(overview: StudioPortalOverview): boolean {
  return overview.seasons.some((s) =>
    s.episodes.some((e) => e.status === 'PROCESSING' || (e.latestDelivery && !['READY', 'FAILED', 'SUPERSEDED'].includes(e.latestDelivery.ingestStatus))),
  );
}

/** The outside studio's page for one hand-off; the link from the brief email is all it needs. */
export function StudioPortalPage() {
  const { token } = useParams<{ token: string }>();
  const portal = useResource(`studio-portal:${token}`, () => studioPortalService.overview(token));
  const overview = portal.data;
  const busy = overview ? processing(overview) : false;
  const { reload } = portal;

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => void reload(), POLL_MS);
    return () => clearInterval(timer);
  }, [busy, reload]);

  if (portal.loading && !overview) return <Shell><Loading /></Shell>;
  if (!overview) {
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 text-center space-y-2">
          <LinkIcon className="w-8 h-8 mx-auto text-slate-400" aria-hidden="true" />
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">Link không còn hiệu lực</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Link có thể đã được thay bằng link mới, dự án đã đổi studio hoặc đã dừng. Vui lòng liên hệ người phụ trách tại AI Cinema.
          </p>
        </div>
      </Shell>
    );
  }

  const { project, studio } = overview;
  const download = async (load: () => Promise<Blob | null>, name: string) => {
    const blob = await load();
    if (blob) saveBlob(blob, name);
  };

  return (
    <Shell>
      <div className="space-y-5">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cổng studio · {studio.studioName} · bàn giao lúc {formatDateTime(studio.handedOffAt)}
          </p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
        </div>

        <RespondPanel token={token} overview={overview} onAnswered={reload} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <PortalEpisodes token={token} overview={overview} onChanged={reload} />
          </div>
          <div className="space-y-5 order-1 lg:order-2">
            <Panel
              title="Brief"
              actions={
                <Button size="sm" variant="secondary" onClick={() => download(() => studioPortalService.downloadBrief(token), `brief-${project.title}.pdf`)}>
                  <Download className="w-3.5 h-3.5" aria-hidden="true" /> PDF
                </Button>
              }
            >
              <Facts
                stacked
                items={[
                  ['Thể loại', project.genres.join(', ') || '—'],
                  ['Phí sản xuất', `${formatNumber(project.productionFeeTokens)} Token`],
                  ['Đầu mối', project.creator ? `${project.creator.fullName} — ${project.creator.email}` : '—'],
                ]}
              />
              <p className="mt-3 text-xs whitespace-pre-line text-slate-600 dark:text-slate-300">{project.ideaDescription}</p>
            </Panel>
            {overview.ideaFiles.length > 0 && (
              <Panel title="File ý tưởng">
                <ul className="space-y-1 text-xs">
                  {overview.ideaFiles.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-slate-700 dark:text-slate-200">{f.fileName}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Tải ${f.fileName}`}
                        onClick={() => download(() => studioPortalService.downloadIdeaFile(token, f.id), f.fileName)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0B0C10]/90">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-2">
          <Film className="w-5 h-5 text-purple-600" aria-hidden="true" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">AI Cinema · Cổng studio</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
