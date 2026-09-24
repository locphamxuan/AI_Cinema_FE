import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverviewTab } from '@/features/workflow/components/creator/tabs/OverviewTab';
import { initialProject } from '@/tests/fixtures/workflowFixtures';
import type { WorkflowState } from '@/types/workflow';

const renderOverview = (status: WorkflowState, milestones = initialProject.milestones) =>
  render(
    <OverviewTab
      project={{ ...initialProject, milestones }}
      currentPackage={{ ...initialProject.episodes[0], status }}
      isQuotaWarning={false}
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

  it('lists only the milestones the Reviewer set, never placeholder ones', () => {
    renderOverview('IN_PRODUCTION', []);
    expect(screen.getByText('Reviewer chưa đặt cột mốc nào cho dự án này.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Thay đổi trạng thái giai đoạn' })).toBeNull();
  });
});
