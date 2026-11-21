import type { Tone } from '@/features/production/lib/labels';
import type { AiResolution, KnowledgeArticleStatus, KnowledgeIndexStatus, KnowledgeSource, SupportAudience } from '@/types/support';

type Label = { label: string; tone: Tone };

export const ARTICLE_STATUS: Record<KnowledgeArticleStatus, Label> = {
  DRAFT: { label: 'Nháp', tone: 'neutral' },
  PUBLISHED: { label: 'Đang dùng', tone: 'emerald' },
  ARCHIVED: { label: 'Lưu trữ', tone: 'amber' },
};

export const INDEX_STATUS: Record<KnowledgeIndexStatus, Label> = {
  PENDING: { label: 'Chờ lập chỉ mục', tone: 'blue' },
  INDEXING: { label: 'Đang lập chỉ mục', tone: 'blue' },
  INDEXED: { label: 'Đã lập chỉ mục', tone: 'emerald' },
  FAILED: { label: 'Lỗi lập chỉ mục', tone: 'rose' },
};

export const AUDIENCE: Record<SupportAudience, string> = {
  MEMBER: 'Member',
  STAFF: 'Nhân viên',
  ALL: 'Tất cả',
};

export const SOURCE: Record<KnowledgeSource, string> = {
  MANUAL: 'Tự viết',
  POLICY: 'Chính sách',
  PLAN: 'Gói thành viên',
  FAQ: 'Câu hỏi thường gặp',
};

/** Suggested categories; the backend takes any text up to 100 characters. */
export const CATEGORY_SUGGESTIONS = ['Gói cước', 'Coin & Thanh toán', 'Kỹ thuật & Sự cố', 'Bản quyền', 'Tài khoản'];

/** The AI hands the case to Staff when it needs a person or is not sure. */
export const handsOff = (r: AiResolution | null | undefined) => r === 'NEEDS_HUMAN' || r === 'UNCERTAIN';

/** 0.82 → "82%" */
export const percent = (value: number | null | undefined) => (value === null || value === undefined ? '—' : `${Math.round(value * 100)}%`);

/** A slug the backend accepts: lowercase ASCII words joined by hyphens. */
export function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
