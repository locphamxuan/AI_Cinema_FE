import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { autoCloseAt, awaitsStaffReply, formatSpan, queueTiming } from '@/features/staff/caseTiming';
import { CaseMilestones } from '@/features/staff/components/CaseMilestones';
import type { SupportCase } from '@/types/support';

const NOW = new Date('2026-11-14T10:00:00Z').getTime();
const ago = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString();
const base: SupportCase = {
  id: 'c1', status: 'WAITING_FOR_STAFF', priority: 'NORMAL', escalationReason: null, escalationNote: null, aiSummary: null,
  memberId: 'u1', memberFullName: 'An', assignedAgentId: null, assignedAgentName: null, lastMessageAt: ago(5), escalatedAt: ago(45),
  claimedAt: null, resolvedAt: null, closedAt: null, resolutionNote: null, satisfactionRating: null, satisfactionComment: null,
  aiTurns: 2, createdAt: ago(60), updatedAt: ago(5),
};

describe('case timing', () => {
  it('reads spans the way Staff say them', () => {
    expect(formatSpan(10_000)).toBe('dưới 1 phút');
    expect(formatSpan(45 * 60_000)).toBe('45 phút');
    expect(formatSpan(120 * 60_000)).toBe('2 giờ');
    expect(formatSpan(200 * 60_000)).toBe('3 giờ 20 phút');
    expect(formatSpan(50 * 3_600_000)).toBe('2 ngày');
    expect(formatSpan(-5)).toBe('dưới 1 phút');
  });

  it('says who each case waits on', () => {
    expect(queueTiming({ ...base, status: 'AI_HANDLING' }, NOW)).toEqual({ text: 'AI đang trả lời Member', urgent: false });
    expect(queueTiming(base, NOW)).toEqual({ text: 'Chờ người nhận 45 phút', urgent: false });
    expect(queueTiming({ ...base, priority: 'URGENT', escalatedAt: null }, NOW)).toEqual({ text: 'Chờ người nhận 1 giờ', urgent: true });

    const handling = { ...base, status: 'STAFF_HANDLING' as const, claimedAt: ago(30) };
    expect(queueTiming({ ...handling, lastMemberMessageAt: ago(8), lastStaffMessageAt: ago(20) }, NOW)).toEqual({ text: 'Member chờ trả lời 8 phút', urgent: true });
    expect(queueTiming({ ...handling, lastMemberMessageAt: ago(8) }, NOW).urgent).toBe(true);
    expect(queueTiming({ ...handling, lastMemberMessageAt: ago(20), lastStaffMessageAt: ago(5) }, NOW).text).toBe('Đã trả lời, chờ Member · 5 phút trước');
    expect(queueTiming({ ...handling, lastMessageAt: null }, NOW).text).toBe('Đã trả lời, chờ Member · 30 phút trước');

    expect(queueTiming({ ...base, status: 'RESOLVED', resolvedAt: ago(60) }, NOW).text).toBe('Tự đóng sau 23 giờ nếu Member không phản hồi');
    expect(queueTiming({ ...base, status: 'RESOLVED' }, NOW).text).toBe('Chờ Member xác nhận');
    expect(queueTiming({ ...base, status: 'CLOSED', closeReason: 'INACTIVITY' }, NOW).text).toBe('Tự đóng vì Member không phản hồi');
    expect(queueTiming({ ...base, status: 'CLOSED' }, NOW).text).toBe('Đã kết thúc');
  });

  it('only counts a member message after the last Staff one as waiting on Staff', () => {
    expect(awaitsStaffReply(base)).toBe(false);
    expect(awaitsStaffReply({ ...base, status: 'STAFF_HANDLING' })).toBe(false);
    expect(autoCloseAt(base)).toBeNull();
  });
});

describe('CaseMilestones', () => {
  it('marks the milestones passed and says what comes next for each status', () => {
    const { rerender } = render(<CaseMilestones c={{ ...base, status: 'AI_HANDLING' }} />);
    expect(screen.getByText(/Trợ lý AI đang trả lời \(2 lượt\)/)).toBeInTheDocument();
    expect(screen.getAllByText('Chưa có')).toHaveLength(4);

    rerender(<CaseMilestones c={base} />);
    expect(screen.getByText(/Chưa ai nhận, Member đã chờ/)).toBeInTheDocument();
    rerender(<CaseMilestones c={{ ...base, escalatedAt: null }} />);
    expect(screen.getByText(/Chưa ai nhận/)).toBeInTheDocument();

    const handling = { ...base, status: 'STAFF_HANDLING' as const, claimedAt: ago(30) };
    rerender(<CaseMilestones c={{ ...handling, lastMemberMessageAt: ago(3) }} />);
    expect(screen.getByText(/đang chờ nhân viên trả lời/)).toBeInTheDocument();
    rerender(<CaseMilestones c={{ ...handling, firstStaffReplyAt: ago(20) }} />);
    expect(screen.getByText(/Nhân viên đã trả lời tin mới nhất/)).toBeInTheDocument();

    rerender(<CaseMilestones c={{ ...base, status: 'RESOLVED', resolvedAt: ago(10), resolutionNote: 'Đã hoàn 10 Coin' }} />);
    expect(screen.getByText(/Đang chờ Member xác nhận.*tự đóng lúc/)).toBeInTheDocument();
    expect(screen.getByText('Ghi chú gửi Member: Đã hoàn 10 Coin')).toBeInTheDocument();
    rerender(<CaseMilestones c={{ ...base, status: 'RESOLVED' }} />);
    expect(screen.getByText(/không phản hồi thì tự đóng\.$/)).toBeInTheDocument();

    rerender(<CaseMilestones c={{ ...base, status: 'CLOSED', closeReason: 'STAFF_RESOLVED', satisfactionRating: 4, satisfactionComment: 'Nhanh' }} />);
    expect(screen.getByText(/Member xác nhận nhân viên đã giải quyết/)).toBeInTheDocument();
    expect(screen.getByText('Member đánh giá 4/5: "Nhanh"')).toBeInTheDocument();
    rerender(<CaseMilestones c={{ ...base, status: 'CLOSED', satisfactionRating: 5 }} />);
    expect(screen.getByText(/không rõ lý do/)).toBeInTheDocument();
    expect(screen.getByText('Member đánh giá 5/5')).toBeInTheDocument();
    rerender(<CaseMilestones c={{ ...base, status: 'CLOSED' }} />);
    expect(screen.getByText(/không rõ lý do/)).toBeInTheDocument();
  });
});
