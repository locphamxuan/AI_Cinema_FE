import type { SupportCase, SupportCloseReason } from '@/types/support';

/** BE `SUPPORT_AUTO_CLOSE_HOURS` default: a resolved case the member leaves unanswered closes after this. */
export const AUTO_CLOSE_HOURS = 24;

export const CLOSE_REASON: Record<SupportCloseReason, string> = {
  AI_RESOLVED: 'Member xác nhận AI đã giải quyết',
  STAFF_RESOLVED: 'Member xác nhận nhân viên đã giải quyết',
  INACTIVITY: 'Tự đóng vì Member không phản hồi',
  MEMBER_CLOSED: 'Member tự kết thúc',
};

const MINUTE = 60_000;

/** A span of time as Staff read it at a glance: "45 phút", "3 giờ 20 phút", "2 ngày". */
export function formatSpan(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / MINUTE));
  if (minutes < 1) return 'dưới 1 phút';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours} giờ ${minutes % 60} phút` : `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
}

const since = (iso: string | null | undefined, now: number) => (iso ? formatSpan(now - new Date(iso).getTime()) : null);

/** The member wrote after the last Staff message: the case waits on Staff, not on the member. */
export function awaitsStaffReply(c: SupportCase): boolean {
  if (c.status !== 'STAFF_HANDLING' || !c.lastMemberMessageAt) return false;
  return !c.lastStaffMessageAt || new Date(c.lastMemberMessageAt) > new Date(c.lastStaffMessageAt);
}

/** When a resolved case closes on its own if the member neither confirms nor reopens it. */
export function autoCloseAt(c: SupportCase): Date | null {
  return c.status === 'RESOLVED' && c.resolvedAt ? new Date(new Date(c.resolvedAt).getTime() + AUTO_CLOSE_HOURS * 60 * MINUTE) : null;
}

/** One line under a queue row saying who the case waits on and for how long; `urgent` asks for attention. */
export function queueTiming(c: SupportCase, now = Date.now()): { text: string; urgent: boolean } {
  switch (c.status) {
    case 'AI_HANDLING':
      return { text: 'AI đang trả lời Member', urgent: false };
    case 'WAITING_FOR_STAFF':
      return { text: `Chờ người nhận ${since(c.escalatedAt ?? c.createdAt, now)}`, urgent: c.priority === 'HIGH' || c.priority === 'URGENT' };
    case 'STAFF_HANDLING':
      return awaitsStaffReply(c)
        ? { text: `Member chờ trả lời ${since(c.lastMemberMessageAt, now)}`, urgent: true }
        : { text: `Đã trả lời, chờ Member · ${since(c.lastMessageAt ?? c.claimedAt, now)} trước`, urgent: false };
    case 'RESOLVED': {
      const at = autoCloseAt(c);
      return { text: at ? `Tự đóng sau ${formatSpan(at.getTime() - now)} nếu Member không phản hồi` : 'Chờ Member xác nhận', urgent: false };
    }
    case 'CLOSED':
      return { text: c.closeReason ? CLOSE_REASON[c.closeReason] : 'Đã kết thúc', urgent: false };
  }
}
