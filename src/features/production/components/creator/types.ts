import type { ProjectPipeline } from '@/services/pipelineService';

/** Where the script of a project assigned to the Creator stands, from the first draft to the signed contract. */
export type ScriptStage = 'DRAFT' | 'REVISION' | 'IN_REVIEW' | 'ADMIN_REVIEW' | 'NEGOTIATING' | 'HANDED_OFF';

export type ScriptFilterKey = 'all' | 'draft' | 'review' | 'admin_approval' | 'handed_off';

const STAGE_LABEL: Record<ScriptStage, string> = {
  DRAFT: 'CHƯA NỘP KỊCH BẢN',
  REVISION: 'CẦN SỬA KỊCH BẢN',
  IN_REVIEW: 'CHỜ REVIEWER DUYỆT',
  ADMIN_REVIEW: 'CHỜ ADMIN DUYỆT FINAL',
  NEGOTIATING: 'ĐANG KÝ HỢP ĐỒNG STUDIO',
  HANDED_OFF: 'ĐÃ BÀN GIAO STUDIO',
};

/** The steps a script goes through; the card's progress is how many are behind it. */
const STAGE_STEP: Record<ScriptStage, number> = { DRAFT: 0, REVISION: 0, IN_REVIEW: 1, ADMIN_REVIEW: 2, NEGOTIATING: 3, HANDED_OFF: 4 };
export const SCRIPT_STEPS = 4;

export interface ScriptProjectItem {
  id: string;
  title: string;
  posterUrl: string | null;
  stage: ScriptStage;
  stageLabel: string;
  step: number;
  genreTags: string[];
  totalEpisodes: number;
  currentVersion: number;
  reviewerName: string;
  studioName: string | null;
}

export function scriptStageOf({ project, script }: ProjectPipeline): ScriptStage {
  if (project.status !== 'DRAFT' && project.status !== 'ASSIGNED' && project.status !== 'CANCELLED') return 'HANDED_OFF';
  switch (script?.status) {
    case 'SUBMITTED':
      return 'IN_REVIEW';
    case 'REVIEWER_APPROVED':
      return 'ADMIN_REVIEW';
    case 'REVISION_REQUESTED':
      return 'REVISION';
    case 'FINAL':
      return 'NEGOTIATING';
    default:
      return 'DRAFT';
  }
}

export function toScriptItem(row: ProjectPipeline): ScriptProjectItem {
  const { project, script } = row;
  const stage = scriptStageOf(row);
  return {
    id: project.id,
    title: project.title,
    posterUrl: project.posterUrl,
    stage,
    stageLabel: STAGE_LABEL[stage],
    step: STAGE_STEP[stage],
    genreTags: project.genres.map((g) => g.name),
    totalEpisodes: project.seasons.reduce((n, s) => n + s.episodes.length, 0),
    currentVersion: script?.currentVersion ?? 0,
    reviewerName: project.reviewer.fullName,
    studioName: project.studio?.name ?? null,
  };
}

export const matchesFilter = (item: ScriptProjectItem, filter: ScriptFilterKey): boolean =>
  filter === 'all' ||
  (filter === 'draft' && item.stage === 'DRAFT') ||
  (filter === 'review' && (item.stage === 'IN_REVIEW' || item.stage === 'REVISION')) ||
  (filter === 'admin_approval' && item.stage === 'ADMIN_REVIEW') ||
  (filter === 'handed_off' && (item.stage === 'NEGOTIATING' || item.stage === 'HANDED_OFF'));
