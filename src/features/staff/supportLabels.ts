import type { Tone } from '@/features/production/lib/labels';
import type { SupportCase, SupportEscalationReason, SupportPriority, SupportStatus } from '@/types/support';

type Label = { label: string; tone: Tone };

export const CASE_STATUS: Record<SupportStatus, Label> = {
  AI_HANDLING: { label: 'AI đang xử lý', tone: 'purple' },
  WAITING_FOR_STAFF: { label: 'Chờ nhân viên', tone: 'amber' },
  STAFF_HANDLING: { label: 'Nhân viên đang xử lý', tone: 'blue' },
  RESOLVED: { label: 'Đã giải quyết', tone: 'emerald' },
  CLOSED: { label: 'Đã đóng', tone: 'neutral' },
};

export const PRIORITY: Record<SupportPriority, Label> = {
  LOW: { label: 'Thấp', tone: 'neutral' },
  NORMAL: { label: 'Bình thường', tone: 'neutral' },
  HIGH: { label: 'Cao', tone: 'amber' },
  URGENT: { label: 'Khẩn', tone: 'rose' },
};

/** BE `escalationText`. */
export const ESCALATION: Record<SupportEscalationReason, string> = {
  AI_UNAVAILABLE: 'Trợ lý AI tạm thời không phản hồi',
  INSUFFICIENT_INFO: 'Không đủ thông tin để trả lời chắc chắn',
  ACCOUNT_VERIFICATION: 'Cần xác minh tài khoản hoặc giao dịch',
  MEMBER_REQUEST: 'Member yêu cầu nhân viên',
  STAFF_NEEDED: 'Vượt quá phạm vi của trợ lý AI',
};

/**
 * What the signed-in account may do on a case — the backend's state machine (support-status.ts) and ownership
 * rules (staff-support.service): claim only WAITING_FOR_STAFF; reply once escalated, unless another Staff holds it;
 * resolve from STAFF_HANDLING; close from STAFF_HANDLING / RESOLVED; release by the holder or an Admin.
 */
export function caseActions(c: SupportCase, me: { id?: string; isAdmin: boolean; canManage: boolean; canAssign: boolean }) {
  const mine = !!me.id && c.assignedAgentId === me.id;
  const heldByOther = c.status === 'STAFF_HANDLING' && !!c.assignedAgentId && !mine;
  const open = c.status === 'WAITING_FOR_STAFF' || c.status === 'STAFF_HANDLING';
  const m = me.canManage;
  return {
    claim: m && c.status === 'WAITING_FOR_STAFF',
    release: m && c.status === 'STAFF_HANDLING' && (mine || me.isAdmin),
    reply: m && open && (!heldByOther || me.isAdmin),
    resolve: m && c.status === 'STAFF_HANDLING' && (!heldByOther || me.isAdmin),
    close: m && (c.status === 'STAFF_HANDLING' || c.status === 'RESOLVED') && (!heldByOther || me.isAdmin),
    assign: me.canAssign && open,
    suggest: m && open,
  };
}
