/** The Reviewer's work, derived from the real projects: scripts to review, films to check, and everything else. */
import type { PipelineEpisode, ProjectPipeline } from '@/services/pipelineService';

export type QueueStage = 'SCRIPT_PENDING' | 'MASTER_AUDIT' | 'STUDIO_REVISING' | 'FINAL_CONFIRMED' | 'PROJECT';
export type QueueFilter = 'all' | 'script' | 'master' | 'revising' | 'approved';

export interface QueueItem {
  id: string;
  projectId: string;
  title: string;
  /** Null on a project-level item (a script, or a project with nothing to review yet). */
  episodeId: string | null;
  episodeNumber: number | null;
  totalEpisodes: number;
  genre: string;
  creatorName: string;
  studioName: string;
  stage: QueueStage;
  stageLabel: string;
  posterUrl: string | null;
  updatedAt: string;
  href: string;
}

export const FILTER_STAGE: Record<Exclude<QueueFilter, 'all'>, QueueStage> = {
  script: 'SCRIPT_PENDING',
  master: 'MASTER_AUDIT',
  revising: 'STUDIO_REVISING',
  approved: 'FINAL_CONFIRMED',
};

const AUDIT_LABEL: Partial<Record<PipelineEpisode['status'], string>> = {
  IN_REVIEW: 'Bản phim chờ duyệt',
  APPROVED: 'Đã duyệt, chờ gắn nhãn AI',
  LABELED: 'Đã gắn nhãn, chờ kiểm tra tuân thủ',
  COMPLIANCE_PASSED: 'Đạt tuân thủ, chờ xác nhận Phim Final',
};

function episodeStage(episode: PipelineEpisode): { stage: QueueStage; label: string } | null {
  if (episode.status === 'CHANGES_REQUESTED') return { stage: 'STUDIO_REVISING', label: 'Studio đang sửa' };
  if (episode.status === 'COMPLIANCE_PASSED' && episode.finalConfirmedAt) return { stage: 'FINAL_CONFIRMED', label: 'Phim Final chờ Admin publish' };
  const label = AUDIT_LABEL[episode.status];
  return label ? { stage: 'MASTER_AUDIT', label } : null;
}

/** Every item the Reviewer can act on; a project with none still gets one, so each project stays reachable. */
export function toQueueItems(rows: ProjectPipeline[]): QueueItem[] {
  return rows.flatMap((project) => {
    const { script, episodes } = project;
    const base = {
      projectId: project.id,
      title: project.title,
      totalEpisodes: episodes.length,
      genre: project.genres.map((g) => g.name).join(' / '),
      creatorName: project.creator?.fullName ?? 'Chưa giao Creator',
      studioName: project.studio?.name ?? 'Chưa có Studio',
      posterUrl: project.posterUrl,
    };
    const projectHref = `/reviewer/projects/${project.id}`;
    const items: QueueItem[] = [];
    if (script?.status === 'SUBMITTED') {
      items.push({
        ...base,
        id: `script-${project.id}`,
        episodeId: null,
        episodeNumber: null,
        stage: 'SCRIPT_PENDING',
        stageLabel: `Kịch bản bản ${script.currentVersion} chờ duyệt`,
        updatedAt: script.latestVersionAt ?? project.updatedAt,
        href: `${projectHref}?tab=script`,
      });
    }
    for (const episode of episodes) {
      const state = episodeStage(episode);
      if (!state) continue;
      items.push({
        ...base,
        id: episode.id,
        episodeId: episode.id,
        episodeNumber: episode.episodeNumber,
        stage: state.stage,
        stageLabel: state.label,
        updatedAt: episode.updatedAt,
        href: `/reviewer?project=${project.id}&episode=${episode.id}`,
      });
    }
    if (items.length === 0) {
      items.push({
        ...base,
        id: `project-${project.id}`,
        episodeId: null,
        episodeNumber: null,
        stage: 'PROJECT',
        stageLabel: 'Chưa có việc cần duyệt',
        updatedAt: project.updatedAt,
        href: projectHref,
      });
    }
    return items;
  });
}

export function filterQueue(items: QueueItem[], filter: QueueFilter, search: string): QueueItem[] {
  const query = search.trim().toLowerCase();
  return items.filter(
    (item) =>
      (filter === 'all' || item.stage === FILTER_STAGE[filter]) &&
      (!query || [item.title, item.studioName, item.creatorName].some((text) => text.toLowerCase().includes(query))),
  );
}
