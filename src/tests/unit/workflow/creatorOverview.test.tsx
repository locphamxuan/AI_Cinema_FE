import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OverviewTab } from '@/features/workflow/components/creator/tabs/OverviewTab';
import { initialProject } from '@/tests/fixtures/workflowFixtures';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { ReviewLog, WorkflowState } from '@/types/workflow';

const FEEDBACK: ReviewLog = {
  id: 'r1',
  episode_package_id: 'ep-1',
  reviewer_id: 'reviewer-1',
  reviewer_name: 'Reviewer',
  review_type: 'content',
  decision: 'changes_requested',
  feedback_notes: 'Cảnh 2 thiếu sáng',
  created_at: '2026-09-25T00:00:00Z',
};

const renderOverview = (status: WorkflowState, milestones = initialProject.milestones) =>
  render(
    <OverviewTab
      project={{ ...initialProject, milestones }}
      currentPackage={{ ...initialProject.episodes[0], status }}
      scenesCount={3}
      estimatedTokens={300}
      synopsis=""
      canEnterStudio
      onGotoBrief={vi.fn()}
    />
  );

const currentStep = () => screen.getByRole('listitem', { current: 'step' });

describe('Creator OverviewTab', () => {
  it.each([
    ['PLAN_DRAFT', 'Kịch bản và cảnh'],
    ['PLAN_PENDING', 'Duyệt kế hoạch và cấp token'],
    ['IN_PRODUCTION', 'Sản xuất'],
    ['CUT_CHANGES_REQUESTED', 'Sản xuất'],
    ['EPISODE_SUBMITTED', 'Kiểm định và phát hành'],
  ] as const)('places a %s episode at the "%s" stage', (status, stage) => {
    renderOverview(status);
    expect(currentStep()).toHaveTextContent(stage);
  });

  it('marks every stage done once the episode is published', () => {
    renderOverview('PUBLISHED');
    expect(screen.queryByRole('listitem', { current: 'step' })).toBeNull();
    expect(screen.getByText('Tập đã phát hành')).toBeInTheDocument();
  });

  it.each([
    ['content', 'Mở Studio để làm lại', 'onGotoStudio'],
    ['plan', 'Mở kịch bản để sửa', 'onGotoBrief'],
  ] as const)('sends %s feedback to the place it is fixed', (reviewType, action, handler) => {
    const handlers = { onGotoBrief: vi.fn(), onGotoStudio: vi.fn() };
    render(
      <OverviewTab
        project={initialProject}
        currentPackage={initialProject.episodes[0]}
        scenesCount={3}
        estimatedTokens={300}
        synopsis=""
        canEnterStudio
        latestFeedback={{ ...FEEDBACK, review_type: reviewType }}
        {...handlers}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: action }));
    expect(handlers[handler]).toHaveBeenCalled();
  });

  it('asks what was achieved before completing a milestone, then locks it', async () => {
    const updateMilestoneStatus = vi.fn().mockResolvedValue(true);
    useWorkflowStore.setState({ updateMilestoneStatus });
    const milestone = { id: 'm1', title: 'Kịch bản', deadline: '2026-10-30', status: 'in_progress' as const };
    const { rerender } = renderOverview('IN_PRODUCTION', [milestone]);

    fireEvent.click(screen.getByRole('button', { name: 'Đổi trạng thái cột mốc' }));
    fireEvent.click(screen.getByRole('option', { name: 'Hoàn thành' }));
    expect(updateMilestoneStatus).not.toHaveBeenCalled();

    const confirm = screen.getByRole('button', { name: 'Hoàn thành' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Kết quả đạt được'), { target: { value: ' Xong kịch bản ' } });
    fireEvent.click(confirm);
    expect(updateMilestoneStatus).toHaveBeenCalledWith('m1', 'completed', 'Xong kịch bản');

    rerender(
      <OverviewTab
        project={{ ...initialProject, milestones: [{ ...milestone, status: 'completed', result: 'Xong kịch bản' }] }}
        currentPackage={{ ...initialProject.episodes[0], status: 'IN_PRODUCTION' }}
        scenesCount={3}
        estimatedTokens={300}
        synopsis=""
        canEnterStudio
        onGotoBrief={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: 'Đổi trạng thái cột mốc' })).toBeNull();
    expect(screen.getByText('Kết quả: Xong kịch bản')).toBeInTheDocument();
  });

  it('lists only the milestones the Reviewer set, never placeholder ones', () => {
    renderOverview('IN_PRODUCTION', []);
    expect(screen.getByText('Reviewer chưa đặt cột mốc nào cho dự án này.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đổi trạng thái cột mốc' })).toBeNull();
  });
});
