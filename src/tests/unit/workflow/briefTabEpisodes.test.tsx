import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { BriefTab } from '@/features/workflow/components/creator/tabs/BriefTab';
import { apiPlan, apiProject, apiScene } from '@/tests/fixtures/workflowApiFixtures';
import { serveBackendProject } from '@/tests/support/workflowStoreHarness';

vi.mock('@/services/workflowService', () => import('@/tests/support/workflowServiceMock'));

/** The Creator's plan screen with an episode switcher, wired to the real store. */
function PlanScreen() {
  const s = useWorkflowStore();
  const pkg = s.getPackage(s.activePackageId)!;
  return (
    <>
      {s.project.episodes.map((e) => (
        <button key={e.id} type="button" onClick={() => s.setActivePackage(e.id)}>
          Mở {e.id}
        </button>
      ))}
      <BriefTab
        key={pkg.id}
        currentPackage={pkg}
        scriptReview={pkg.brief.script_review}
        updateContentBrief={s.updateContentBrief}
        savePlanDraft={s.savePlanDraft}
        submitProductionPlan={s.submitProductionPlan}
        maxEpisodeMinutes={60}
      />
    </>
  );
}

describe('BriefTab across episodes', () => {
  it('keeps each episode its own script and scenes when switching back and forth', () => {
    serveBackendProject(
      apiProject([
        apiPlan({ status: 'DRAFT', scenes: [apiScene(1)] }),
        apiPlan({ id: 'plan-2', episodeNumber: 2, status: 'DRAFT', scenes: [], scriptText: null }),
      ])
    );
    render(<PlanScreen />);

    fireEvent.change(screen.getByLabelText(/Kịch bản tập này/), { target: { value: 'Kịch bản tập 1' } });
    fireEvent.change(screen.getByLabelText('Tên cảnh 1'), { target: { value: 'Cảnh của tập 1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Mở plan-2' }));
    expect(screen.getByLabelText(/Kịch bản tập này/)).toHaveValue('');
    expect(screen.queryByLabelText('Tên cảnh 1')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Kịch bản tập này/), { target: { value: 'Kịch bản tập 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm cảnh' }));
    fireEvent.change(screen.getByLabelText('Tên cảnh 1'), { target: { value: 'Cảnh của tập 2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Mở plan-1' }));
    expect(screen.getByLabelText(/Kịch bản tập này/)).toHaveValue('Kịch bản tập 1');
    expect(screen.getByLabelText('Tên cảnh 1')).toHaveValue('Cảnh của tập 1');
  });
});
