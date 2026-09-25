import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { adaptApiProjectToUiProject } from '@/features/workflow/lib/apiAdapter';
import { buildReviewLog } from '@/features/workflow/lib/reviewLog';
import { canRequestQuota, pendingQuotaRequest, quotaUsage } from '@/features/workflow/lib/quota';
import { QuotaRequestPanel } from '@/features/workflow/components/creator/tabs/QuotaRequestPanel';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { apiPlan, apiProject, apiQuotaRequest } from '@/tests/fixtures/workflowApiFixtures';
import type { ApiQuotaAllocation } from '@/types/workflow-api';

const reviewer = { id: 'reviewer-1', fullName: 'Reviewer Một' };
const allocation = (overrides: Partial<ApiQuotaAllocation> = {}): ApiQuotaAllocation => ({
  id: 'q1',
  allocationType: 'INITIAL',
  allocatedAmount: '400',
  remainingAmount: '40',
  status: 'ACTIVE',
  allocatedBy: reviewer,
  createdAt: '2026-09-02T00:00:00Z',
  ...overrides,
});

const topUp = allocation({ id: 'q2', allocationType: 'TOP_UP', allocatedAmount: '300', remainingAmount: '300', createdAt: '2026-09-05T00:00:00Z' });
const approved = apiQuotaRequest({ id: 'r-approved', status: 'APPROVED', quotaAllocationId: 'q2', decisionNote: 'Cấp một phần', decidedBy: reviewer, decidedAt: '2026-09-05T00:00:00Z' });
const rejected = apiQuotaRequest({ id: 'r-rejected', status: 'REJECTED', decisionNote: 'Hết ngân sách', decidedBy: reviewer, decidedAt: '2026-09-06T00:00:00Z' });

const episodeWith = (...args: Parameters<typeof apiPlan>) => adaptApiProjectToUiProject(apiProject([apiPlan(...args)])).episodes[0];

describe('quota top-up requests', () => {
  it('maps each request with the tokens its top-up actually granted', () => {
    const episode = episodeWith({ status: 'APPROVED', quotaAllocations: [allocation(), topUp], quotaRequests: [rejected, approved] });
    expect(episode.quota_requests.map((r) => [r.id, r.status, r.granted_amount])).toEqual([
      ['r-rejected', 'rejected', undefined],
      ['r-approved', 'approved', 300],
    ]);
    expect(episode.quota_requests[1]).toMatchObject({ requested_amount: 500, decided_by_name: 'Reviewer Một', decision_note: 'Cấp một phần' });
  });

  it('logs the note of an approved request on its grant and a refused request on its own', () => {
    const log = buildReviewLog(apiPlan({ quotaAllocations: [allocation(), topUp], quotaRequests: [rejected, approved] }));
    expect(log.map((e) => [e.id, e.decision])).toEqual([
      ['r-rejected', 'rejected'],
      ['q2', 'approved'],
      ['q1', 'approved'],
    ]);
    expect(log[0].feedback_notes).toBe('Không cấp thêm 500 token: Hết ngân sách');
    expect(log[1].feedback_notes).toBe('Đã cấp 300 token bổ sung.\nCấp một phần');
  });

  it("measures an episode's own quota and warns near its end", () => {
    expect(quotaUsage({ actual_tokens_used: 360, quota_allocated: 400 })).toEqual({ used: 360, allocated: 400, remaining: 40, percent: 90, isWarning: true });
    expect(quotaUsage(undefined)).toMatchObject({ percent: 0, isWarning: false });
  });

  it('allows one pending request at a time, only while the episode is produced', () => {
    const producing = episodeWith({ status: 'APPROVED', quotaAllocations: [allocation()], _count: { generationJobs: 1 } });
    expect(canRequestQuota(producing)).toBe(true);
    expect(canRequestQuota({ ...producing, quota_requests: [pendingOf()] })).toBe(false);
    expect(canRequestQuota({ ...producing, status: 'EPISODE_SUBMITTED' })).toBe(false);
    expect(canRequestQuota({ ...producing, quota_allocated: 0 })).toBe(false);
  });
});

function pendingOf() {
  const episode = episodeWith({ status: 'APPROVED', quotaAllocations: [allocation()], quotaRequests: [apiQuotaRequest()] });
  const pending = pendingQuotaRequest(episode);
  if (!pending) throw new Error('expected a pending request');
  return pending;
}

describe('QuotaRequestPanel', () => {
  const requestQuota = vi.fn();
  beforeEach(() => {
    requestQuota.mockReset().mockResolvedValue(true);
    useWorkflowStore.setState({ requestQuota });
  });

  it('sends the amount and reason the Creator typed', async () => {
    const episode = episodeWith({ status: 'APPROVED', quotaAllocations: [allocation()], _count: { generationJobs: 1 } });
    render(<QuotaRequestPanel currentPackage={episode} />);

    const send = screen.getByRole('button', { name: 'Gửi yêu cầu' });
    expect(send).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Số token cần thêm'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('Lý do'), { target: { value: '  Sinh lại cảnh 3 ' } });
    fireEvent.click(send);

    expect(requestQuota).toHaveBeenCalledWith(episode.id, 500, 'Sinh lại cảnh 3');
  });

  it('shows the pending request instead of the form', () => {
    const episode = episodeWith({ status: 'APPROVED', quotaAllocations: [allocation()], quotaRequests: [apiQuotaRequest()] });
    render(<QuotaRequestPanel currentPackage={episode} />);

    expect(screen.getByRole('status')).toHaveTextContent('Đang chờ Reviewer duyệt yêu cầu 500 token');
    expect(screen.queryByRole('button', { name: 'Gửi yêu cầu' })).not.toBeInTheDocument();
  });
});
