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
 * Reviewer: what the Creator did, what the Studio answered (recorded by the Creator or reported by Studio Web),
 * what the Admin decided about the budget and requests, and releases.
 */
const REVIEWER_TABS: NotificationTab[] = [
  {
    key: 'creator',
    label: 'Creator',
    description: 'Creator bàn giao, nộp tập và đề xuất.',
    sections: [
      section('delivery', 'Nộp tập', 'MEDIA_SUBMITTED', 'MEDIA_READY'),
      section('handoff', 'Bàn giao Studio', 'STUDIO_HANDOFF_SENT'),
      section('change', 'Đề xuất', 'PROJECT_CHANGE_REQUESTED'),
    ],
  },
  {
    key: 'studio',
    label: 'Studio',
    description: 'Studio nhận / từ chối, đổi mốc tiến độ, gửi phim, trễ hạn và lỗi gửi email.',
    sections: [
      section('answer', 'Nhận / từ chối', 'STUDIO_ACCEPTED', 'STUDIO_DECLINED'),
      section('milestone', 'Mốc tiến độ', 'STUDIO_MILESTONE_CHANGED'),
      section('film', 'Studio gửi phim', 'STUDIO_FILM_SENT'),
      section('late', 'Trễ hạn', 'EPISODE_OVERDUE'),
      section('mail', 'Lỗi gửi email', 'BRIEF_EMAIL_FAILED'),
    ],
  },
  {
    key: 'admin',
    label: 'Admin & chi phí',
    description: 'Admin đặt / điều chỉnh ngân sách, trả lời yêu cầu thêm chi phí, đề xuất và cảnh báo giá.',
    sections: [
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
    description: 'Studio gửi phim, nhận / từ chối, mốc tiến độ, trễ hạn và lỗi gửi brief.',
    sections: [
      section('film', 'Studio gửi phim', 'STUDIO_FILM_SENT'),
      section('answer', 'Nhận / từ chối', 'STUDIO_ACCEPTED', 'STUDIO_DECLINED'),
      section('late', 'Trễ hạn', 'EPISODE_OVERDUE'),
      section('mail', 'Lỗi gửi email', 'BRIEF_EMAIL_FAILED'),
    ],
  },
  {
    key: 'reviewer',
    label: 'Reviewer',
    description: 'Giao dự án / tập, trao đổi về tập, kết quả duyệt và đề xuất.',
    sections: [
      section('assign', 'Giao việc', 'PROJECT_ASSIGNED', 'EPISODE_ASSIGNED', 'PROJECT_CANCELLED'),
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

/** Admin: requests to follow, budget and prices. */
const ADMIN_TABS: NotificationTab[] = [
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