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
      section('change', 'Đề xuất', 'PROJECT_CHANGE_REQUESTED'),
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
    description: 'Giao dự án, đổi Studio, Phim Final bị trả lại, ngân sách, yêu cầu thêm chi phí, đề xuất và cảnh báo giá.',
    sections: [
      section('assign', 'Dự án được giao', 'PROJECT_ASSIGNED'),
      section('handoff', 'Đổi Studio', 'STUDIO_HANDOFF_SENT'),
      section('final', 'Phim Final bị trả lại', 'FINAL_FILM_REJECTED'),
      section('budget', 'Ngân sách sản xuất', 'COST_BUDGET_CHANGED'),
      section('cost', 'Yêu cầu thêm chi phí', 'COST_REQUEST_APPROVED', 'COST_REQUEST_REJECTED'),
      section('change', 'Trả lời đề xuất', 'PROJECT_CHANGE_RESOLVED'),
      section('price', 'Giá Coin', 'PRICE_CHANGE_REQUEST', 'PRICE_OUT_OF_RANGE'),
    ],
  },
  {
    key: 'release',
    label: 'Phát hành & hệ thống',
    description: 'Tập đã phát hành, lỗi xử lý video và link HLS hỏng.',
    sections: [
      section('published', 'Đã phát hành', 'EPISODE_PUBLISHED'),
      section('media', 'Lỗi video', 'MEDIA_FAILED', 'HLS_LINK_DEAD'),
    ],
  },
];

/** Creator: what the Studio did, what the Reviewer decided, and the episodes in production. */
const CREATOR_TABS: NotificationTab[] = [
  {
    key: 'studio',
    label: 'Studio',
    description: 'Tập trễ hạn và lỗi gửi brief.',
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
      section('assign', 'Giao việc', 'PROJECT_ASSIGNED', 'EPISODE_ASSIGNED', 'PROJECT_CANCELLED'),
      section('script', 'Kịch bản', 'SCRIPT_UPDATED'),
      section('ideas', 'Trao đổi ý tưởng', 'PROJECT_NOTE'),
      section('notes', 'Trao đổi về tập', 'EPISODE_NOTE'),
      section('review', 'Kết quả duyệt', 'CONTENT_APPROVED', 'CONTENT_CHANGES_REQUESTED'),
      section('change', 'Đề xuất', 'PROJECT_CHANGE_RESOLVED'),
    ],
  },
  {
    key: 'episodes',
    label: 'Tập phim',
    description: 'Video xử lý xong / lỗi, tập đã phát hành, link HLS hỏng.',
    sections: [
      section('ready', 'Xử lý xong', 'MEDIA_READY'),
      section('failed', 'Lỗi xử lý', 'MEDIA_FAILED', 'HLS_LINK_DEAD'),
      section('published', 'Đã phát hành', 'EPISODE_PUBLISHED'),
    ],
  },
];

/** Admin: the projects it leads (script, contract, Final Film), requests to follow, budget and prices. */
const ADMIN_TABS: NotificationTab[] = [
  {
    key: 'projects',
    label: 'Dự án',
    description: 'Kịch bản chờ duyệt Final, trao đổi ý tưởng, hợp đồng với Studio và Phim Final chờ publish.',
    sections: [
      section('script', 'Kịch bản', 'SCRIPT_UPDATED'),
      section('notes', 'Trao đổi ý tưởng', 'PROJECT_NOTE'),
      section('contract', 'Hợp đồng', 'CONTRACT_UPDATED'),
      section('final', 'Phim Final', 'FINAL_FILM_CONFIRMED'),
    ],
  },
  {
    key: 'requests',
    label: 'Đề xuất & chi phí',
    description: 'Đề xuất của Reviewer / Creator và yêu cầu thêm chi phí sản xuất của Reviewer.',
    sections: [
      section('change', 'Đề xuất', 'PROJECT_CHANGE_REQUESTED'),
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
];

export function notificationTabsFor(role: WebRole | undefined): NotificationTab[] {
  if (role === 'creator') return CREATOR_TABS;
  if (role === 'admin') return ADMIN_TABS;
  return REVIEWER_TABS;
}

export const typesOf = (tab: NotificationTab) => tab.sections.flatMap((s) => s.types);