import type { ProductionProject } from '@/types/workflow';

export interface ProjectGroup {
  key: string;
  label: string;
  emptyText: string;
  projects: ProductionProject[];
}

/** Creator sees what they have been assigned and what they have already delivered. */
export function creatorGroups(projects: ProductionProject[]): ProjectGroup[] {
  return [
    {
      key: 'assigned',
      label: 'Phim được giao sản xuất',
      emptyText: 'Chưa có phim nào được giao.',
      projects: projects.filter((p) => p.overall_status !== 'COMPLETED'),
    },
    {
      key: 'completed',
      label: 'Phim đã hoàn thành',
      emptyText: 'Chưa có phim nào hoàn thành.',
      projects: projects.filter((p) => p.overall_status === 'COMPLETED'),
    },
  ];
}

type ReviewerStage = 'new' | 'planReview' | 'production' | 'released';

/** Which stage of the pipeline a project is in, from the Reviewer's point of view. */
function reviewerStage(project: ProductionProject): ReviewerStage {
  if (project.overall_status === 'COMPLETED') return 'released';
  if (project.overall_status === 'NOT_STARTED') return 'new';
  const awaitingPlanReview = project.episodes.some((ep) => ep.status === 'PLAN_PENDING' || ep.brief.status === 'CHANGES_REQUESTED');
  return awaitingPlanReview || project.overall_status === 'PENDING_REVIEW' ? 'planReview' : 'production';
}

/** Reviewer sees the pipeline in the order work reaches them. */
export function reviewerGroups(projects: ProductionProject[]): ProjectGroup[] {
  const inStage = (stage: ReviewerStage) => projects.filter((p) => reviewerStage(p) === stage);
  return [
    { key: 'new', label: 'Dự án mới', emptyText: 'Chưa có dự án mới.', projects: inStage('new') },
    { key: 'planReview', label: 'Chờ duyệt kế hoạch', emptyText: 'Không có kế hoạch nào đang chờ duyệt.', projects: inStage('planReview') },
    { key: 'production', label: 'Đang sản xuất', emptyText: 'Chưa có phim nào đang sản xuất.', projects: inStage('production') },
    { key: 'released', label: 'Đã phát hành', emptyText: 'Chưa có phim nào phát hành.', projects: inStage('released') },
  ];
}
