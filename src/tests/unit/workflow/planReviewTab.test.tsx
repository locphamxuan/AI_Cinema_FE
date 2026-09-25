import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PlanReviewTab } from '@/features/workflow/components/reviewer/tabs/PlanReviewTab';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { initialProject } from '@/tests/fixtures/workflowFixtures';
import type { EpisodePackage, WorkflowState } from '@/types/workflow';

const pendingPlan = initialProject.episodes.find((e) => e.status === 'PLAN_PENDING')!;

const withBrief = (reviews: Partial<EpisodePackage['brief']>, status: WorkflowState = 'PLAN_PENDING'): EpisodePackage => ({
  ...pendingPlan,
  status,
  brief: { ...pendingPlan.brief, ...reviews },
});

const approvedEverything = {
  script_review: { status: 'approved' as const },
  duration_review: { status: 'approved' as const },
  token_review: { status: 'approved' as const },
  scene_reviews: pendingPlan.brief.scene_breakdown.map((s) => ({ scene_number: s.scene_number, status: 'approved' as const })),
};

describe('PlanReviewTab', () => {
  const reviewPlanField = vi.fn().mockResolvedValue(true);
  const reviewScene = vi.fn().mockResolvedValue(true);
  const onAllocateQuota = vi.fn();
  const onRequestChanges = vi.fn();

  const renderTab = (episode: EpisodePackage) =>
    render(<PlanReviewTab currentPackage={episode} onAllocateQuota={onAllocateQuota} onRequestChanges={onRequestChanges} />);

  beforeEach(() => {
    vi.clearAllMocks();
    useWorkflowStore.setState({ project: initialProject, reviewPlanField, reviewScene });
  });

  it('decides each field of a submitted plan', () => {
    renderTab(withBrief({ duration_review: { status: 'pending' } }));

    fireEvent.click(screen.getByRole('button', { name: 'Duyệt thời lượng' }));
    expect(reviewPlanField).toHaveBeenCalledWith(pendingPlan.id, 'duration', 'approved', undefined);

    const [sceneRework] = screen.getAllByRole('button', { name: 'Yêu cầu làm lại' }).slice(-1);
    fireEvent.click(sceneRework);
    fireEvent.change(screen.getByPlaceholderText('Mô tả cụ thể phần này cần sửa gì…'), { target: { value: ' Thiếu ánh sáng ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu làm lại' }));
    const lastScene = pendingPlan.brief.scene_breakdown.at(-1)!.scene_number;
    expect(reviewScene).toHaveBeenCalledWith(pendingPlan.id, lastScene, 'changes_requested', 'Thiếu ánh sáng');
  });

  it('grants tokens only once every field is approved, and returns the plan only when one is flagged', () => {
    const { unmount } = renderTab(withBrief({ ...approvedEverything, token_review: { status: 'pending' } }));
    expect(screen.getByRole('button', { name: 'Duyệt và cấp token' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trả về để sửa' })).toBeDisabled();
    unmount();

    renderTab(withBrief(approvedEverything));
    fireEvent.click(screen.getByRole('button', { name: 'Duyệt và cấp token' }));
    expect(onAllocateQuota).toHaveBeenCalled();
  });

  it('lets the Reviewer send back a plan with a flagged field', () => {
    renderTab(withBrief({ ...approvedEverything, token_review: { status: 'changes_requested', comment: 'Quá ngân sách' } }));
    expect(screen.getByText('Ghi chú đã gửi:')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Trả về để sửa' }));
    expect(onRequestChanges).toHaveBeenCalled();
  });

  it.each(['PLAN_DRAFT', 'CHANGES_REQUESTED'] as const)('shows a %s plan without review actions', (status) => {
    renderTab(withBrief({}, status));
    expect(screen.queryByRole('button', { name: 'Yêu cầu làm lại' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Duyệt thời lượng' })).toBeNull();
  });

  it.each(['IN_PRODUCTION', 'CUT_CHANGES_REQUESTED', 'PUBLISHED'] as const)('shows a %s episode as approved with its quota', (status) => {
    renderTab(withBrief(approvedEverything, status));
    expect(screen.queryByRole('button', { name: 'Duyệt và cấp token' })).toBeNull();
    expect(screen.getByText(`Đã cấp ${pendingPlan.quota_allocated} token`)).toBeInTheDocument();
  });
});
