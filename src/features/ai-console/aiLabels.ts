import type { Tone } from '@/features/production/lib/labels';
import type { AiResolution, KnowledgeArticle } from '@/types/support';

type Label = { label: string; tone: Tone };

/** What an Admin needs to know about an article, in one word: the article state and the AI reading state together. */
export type ArticleState = 'IN_USE' | 'UPDATING' | 'NOT_READ' | 'DRAFT' | 'HIDDEN';

export const ARTICLE_STATE: Record<ArticleState, Label> = {
  IN_USE: { label: 'Đang dùng', tone: 'emerald' },
  UPDATING: { label: 'AI đang đọc bài', tone: 'blue' },
  NOT_READ: { label: 'AI chưa đọc được', tone: 'rose' },
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
  HIDDEN: { label: 'Tạm ẩn', tone: 'amber' },
};

export function articleState(a: Pick<KnowledgeArticle, 'status' | 'indexStatus'>): ArticleState {
  if (a.status === 'DRAFT') return 'DRAFT';
  if (a.status === 'ARCHIVED') return 'HIDDEN';
  if (a.indexStatus === 'FAILED') return 'NOT_READ';
  return a.indexStatus === 'INDEXED' ? 'IN_USE' : 'UPDATING';
}

/** Topics of the seeded articles; an Admin may also type a new one. */
export const TOPICS = [
  'Gói Tháng',
  'Coin',
  'Nạp Coin',
  'Mở khóa tập',
  'Hoàn Coin và khiếu nại',
  'Điểm danh và vòng quay',
  'Tài khoản',
  'Thiết bị',
  'Xem phim',
  'Phim và đề xuất',
];

/** The AI hands the case to Staff when it needs a person or is not sure. */
export const handsOff = (r: AiResolution | null | undefined) => r === 'NEEDS_HUMAN' || r === 'UNCERTAIN';

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
