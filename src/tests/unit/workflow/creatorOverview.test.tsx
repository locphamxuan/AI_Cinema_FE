import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OverviewTab } from '@/features/workflow/components/creator/tabs/OverviewTab';
import { initialProject } from '@/tests/fixtures/workflowFixtures';
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
    ['PLAN_DRAFT', 'Kịch bản & phân cảnh'],
    ['PLAN_PENDING', 'Duyệt kế hoạch & quota'],
    ['IN_PRODUCTION', 'Sản xuất video AI'],
    ['CUT_CHANGES_REQUESTED', 'Sản xuất video AI'],
    ['EPISODE_SUBMITTED', 'Kiểm định & công chiếu'],
  ] as const)('places a %s episode at the "%s" stage', (status, stage) => {
    renderOverview(status);
    expect(currentStep()).toHaveTextContent(stage);
  });

  it('marks every stage done once the episode is published', () => {
    renderOverview('PUBLISHED');
    expect(screen.queryByRole('listitem', { current: 'step' })).toBeNull();
    expect(screen.getByText('Tập phim đã công chiếu')).toBeInTheDocument();
  });

  it.each([
    ['content', 'Mở AI Studio để sinh lại', 'onGotoStudio'],
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

  it('lists only the milestones the Reviewer set, never placeholder ones', () => {
    renderOverview('IN_PRODUCTION', []);
    expect(screen.getByText('Reviewer chưa đặt cột mốc nào cho dự án này.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Thay đổi trạng thái giai đoạn' })).toBeNull();
  });
});
