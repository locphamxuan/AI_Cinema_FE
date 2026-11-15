'use client';

import { FinalFilmPanel } from '@/features/production/components/episode/FinalFilmPanel';
import { PublishPanel } from '@/features/production/components/episode/PublishPanel';
import { ReviewPanel } from '@/features/production/components/episode/ReviewPanel';
import type { ProjectCapabilities } from '@/features/production/lib/capabilities';
import { DELIVERY_PROJECT, isIn } from '@/features/production/lib/capabilities';
import type { Episode, MovieStatus, ReviewSheet } from '@/types/production';

/**
 * Right column of the audit desk: the same real actions as the episode page - approve or send back to the studio,
 * AI label, compliance, Coin price and Final Film confirmation. Publishing stays with the Admin.
 */
export function ReviewerFeedbackPanel({
  sheet,
  episode,
  projectStatus,
  caps,
  onChanged,
}: {
  sheet: ReviewSheet | null;
  episode: Episode;
  projectStatus: MovieStatus;
  caps: ProjectCapabilities;
  onChanged: () => Promise<void>;
}) {
  const delivering = isIn(projectStatus, DELIVERY_PROJECT);
  return (
    <aside aria-label="Phiếu thẩm định" className="w-full lg:w-[460px] xl:w-[480px] shrink-0 h-full border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] p-4 sm:p-5 space-y-5 overflow-y-auto">
      {sheet ? (
        <ReviewPanel sheet={sheet} canAct={caps.review && delivering} onChanged={onChanged} />
      ) : (
        <p className="text-xs text-slate-500">Phiếu duyệt hiện ra khi bản phim đã xử lý xong.</p>
      )}
      <FinalFilmPanel episode={episode} canConfirm={caps.review && delivering} canSendBack={caps.publish} onChanged={onChanged} />
      <PublishPanel episode={episode} projectStatus={projectStatus} canPrice={caps.price} canPublish={caps.publish} onChanged={onChanged} />
    </aside>
  );
}
