import type { WebRole } from '@/lib/permissions';

/** A section of a tab: the notification types it collects. */
export interface NotificationSection {
  key: string;
  label: string;
  types: string[];
}

export interface NotificationTab {
  key: string;
  label: string;
  description: string;
  sections: NotificationSection[];
}

const section = (key: string, label: string, ...types: string[]): NotificationSection => ({ key, label, types });

/**
 * Reviewer: what the Creator did, what the Studio delivered on Studio Web (and its late episodes or failed emails),
 * what the Admin decided about the studio, the budget and requests, and releases. The studio no longer answers a brief
 * or mails films: the milestones move on their own, so there is nothing to notify for them.
 */
const REVIEWER_TABS: NotificationTab[] = [
  {
    key: 'creator',
    label: 'Creator',
    description: 'Kịch bản Creator nộp, trao đổi ý tưởng và đề xuất.',
    sections: [
      section('script', 'Kịch bản', 'SCRIPT_UPDATED'),
      section('notes', 'Trao đổi ý tưởng', 'PROJECT_NOTE'),
      section('change', 'Đề xuất', 'CHANGE_REQUESTED'),
    ],
  },
  {
    key: 'studio',
    label: 'Studio',
    description: 'Tập Studio nộp trên Studio Web, trễ hạn và lỗi gửi email.',
    sections: [
      section('delivery', 'Nộp tập', 'MEDIA_SUBMITTED', 'MEDIA_READY'),
      section('late', 'Trễ hạn', 'EPISODE_OVERDUE'),
      section('mail', 'Lỗi gửi email', 'BRIEF_EMAIL_FAILED'),
    ],
  },
  {
    key: 'admin',
    label: 'Admin & chi phí',
    description: 'Giao dự án, đổi Studio, Phim bản cuối bị trả lại, ngân sách, yêu cầu thêm chi phí, đề xuất và cảnh báo giá.',
    sections: [
      section('assign', 'Giao việc', 'PROJECT_ASSIGNED', 'STUDIO_SELECTED'),
      section('handoff', 'Đổi Studio', 'STUDIO_HANDOFF_SENT'),
      section('final', 'Phim bản cuối bị trả lại', 'FINAL_FILM_REJECTED'),
      section('budget', 'Ngân sách sản xuất', 'COST_BUDGET_CHANGED'),
      section('cost', 'Yêu cầu thêm chi phí', 'COST_REQUEST_APPROVED', 'COST_REQUEST_REJECTED'),
      section('change', 'Trả lời đề xuất', 'CHANGE_RESOLVED'),
      section('price', 'Giá Coin', 'PRICE_CHANGE_REQUEST', 'PRICE_OUT_OF_RANGE'),
    ],
  },
  {
    key: 'release',
    label: 'Phát hành & hệ thống',
    description: 'Nhãn AI, kiểm tra tuân thủ, phát hành (cả lần lỗi), lỗi video và link video hỏng.',
    sections: [
      section('review', 'Duyệt nội dung', 'AI_LABEL_APPLIED', 'COMPLIANCE_PASSED'),
      section('published', 'Phát hành', 'EPISODE_PUBLISHED', 'EPISODE_RELEASE_FAILED'),
      section('media', 'Lỗi video', 'MEDIA_FAILED', 'HLS_LINK_DEAD'),
    ],
  },
];

/** Creator: what the Studio did, what the Reviewer decided, and the episodes in production. */
const CREATOR_TABS: NotificationTab[] = [
  {
    key: 'studio',
    label: 'Studio',
    description: 'Tập trễ hạn và lỗi gửi bản yêu cầu.',
    sections: [
      section('late', 'Trễ hạn', 'EPISODE_OVERDUE'),
      section('mail', 'Lỗi gửi email', 'BRIEF_EMAIL_FAILED'),
    ],
  },
  {
    key: 'reviewer',
    label: 'Reviewer',
    description: 'Giao dự án / tập, kịch bản, trao đổi ý tưởng và về tập, kết quả duyệt và đề xuất.',
    sections: [
      section('assign', 'Giao việc', 'PROJECT_ASSIGNED', 'STUDIO_SELECTED', 'EPISODE_ASSIGNED', 'PROJECT_CANCELLED'),
      section('script', 'Kịch bản', 'SCRIPT_UPDATED'),
      section('ideas', 'Trao đổi ý tưởng', 'PROJECT_NOTE'),
      section('notes', 'Trao đổi về tập', 'EPISODE_NOTE'),
      section('review', 'Kết quả duyệt', 'CONTENT_APPROVED', 'CONTENT_CHANGES_REQUESTED'),
      section('change', 'Đề xuất', 'CHANGE_RESOLVED'),
    ],
  },
  {
    key: 'episodes',
    label: 'Tập phim',
    description: 'Video xử lý xong / lỗi, tập đã phát hành, link video hỏng.',
    sections: [
      section('ready', 'Xử lý xong', 'MEDIA_READY'),
      section('failed', 'Lỗi xử lý', 'MEDIA_FAILED', 'HLS_LINK_DEAD'),
      section('published', 'Phát hành', 'EPISODE_PUBLISHED', 'EPISODE_RELEASE_FAILED'),
    ],
  },
];

/** Staff and Admin: support cases the AI handed over, cases assigned to them and Member replies (MF-5). */
const SUPPORT_TAB: NotificationTab = {
  key: 'support',
  label: 'Hỗ trợ khách hàng',
  description: 'Yêu cầu hỗ trợ AI chuyển cho nhân viên, yêu cầu được giao cho bạn và Member trả lời.',
  sections: [
    section('escalated', 'AI chuyển nhân viên', 'SUPPORT_CASE_ESCALATED'),
    section('assigned', 'Được giao', 'SUPPORT_CASE_ASSIGNED'),
    section('replied', 'Member trả lời', 'SUPPORT_MEMBER_REPLIED'),
  ],
};

const STAFF_TABS: NotificationTab[] = [SUPPORT_TAB];

/** Admin: the projects it leads (script, contract, Final Film), requests to follow, budget and prices. */
const ADMIN_TABS: NotificationTab[] = [
  {
    key: 'projects',
    label: 'Dự án',
    description: 'Kịch bản bản cuối chờ duyệt, trao đổi ý tưởng, hợp đồng với Studio và Phim bản cuối chờ phát hành.',
    sections: [
      section('script', 'Kịch bản', 'SCRIPT_UPDATED'),
      section('notes', 'Trao đổi ý tưởng', 'PROJECT_NOTE'),
      section('contract', 'Studio & hợp đồng', 'STUDIO_SELECTED', 'CONTRACT_UPDATED'),
      section('final', 'Kiểm duyệt & Phim bản cuối', 'FINAL_FILM_CONFIRMED', 'AI_LABEL_APPLIED', 'COMPLIANCE_PASSED'),
      section('status', 'Tiến độ & sự cố', 'PROJECT_CANCELLED', 'EPISODE_OVERDUE', 'EPISODE_RELEASE_FAILED', 'HLS_LINK_DEAD'),
    ],
  },
  {
    key: 'requests',
    label: 'Đề xuất & chi phí',
    description: 'Đề xuất của Reviewer / Creator và yêu cầu thêm chi phí sản xuất của Reviewer.',
    sections: [
      section('change', 'Đề xuất', 'CHANGE_REQUESTED'),
      section('cost', 'Yêu cầu thêm chi phí', 'COST_REQUESTED'),
    ],
  },
  {
    key: 'budget',
    label: 'Giá',
    description: 'Cảnh báo giá Coin.',
    sections: [
      section('price', 'Giá Coin', 'PRICE_OUT_OF_RANGE', 'PRICE_CHANGE_REQUEST'),
    ],
  },
  SUPPORT_TAB,
];

export function notificationTabsFor(role: WebRole | undefined): NotificationTab[] {
  if (role === 'creator') return CREATOR_TABS;
  if (role === 'admin') return ADMIN_TABS;
  if (role === 'staff') return STAFF_TABS;
  return REVIEWER_TABS;
}

export const typesOf = (tab: NotificationTab) => tab.sections.flatMap((s) => s.types);