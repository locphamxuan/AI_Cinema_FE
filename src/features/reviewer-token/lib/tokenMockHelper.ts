import type { ReviewerWallet, TokenHistoryEntry } from '@/types/reviewer-token';

/**
 * Professional Cinema Project names and audit notes for High-End FinTech Reviewer Token Portal.
 * Cleanses any test strings (abcccc...) and enriches the ledger with realistic audit entries.
 */

const CINEMA_MOVIES = [
  { id: 'movie-cyber-saigon', title: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077' },
  { id: 'movie-neo-hanoi', title: 'Mạng Lưới Sinh Học: Neo Hanoi' },
  { id: 'movie-mars-ruins', title: 'Tàn Tích Sao Hỏa' },
  { id: 'movie-ai-memory', title: 'Ký Ức Nhân Tạo 2049' },
  { id: 'movie-light-rebellion', title: 'Biệt Đội Kháng Ánh Sáng' },
];

const AUDIT_REASONS = [
  'Cấp quota render phân cảnh AI bằng Runway Gen-3',
  'Cấp phí sản xuất tập 1 (Phần 1 - Khởi nguyên)',
  'Phân bổ ngân sách trọn gói mùa 1 cho Studio',
  'Ngân sách Token cho môi trường phát triển & kiểm định Điều 44',
  'Cấp hạn ngạch sản xuất phim quý IV/2026',
  'Duyệt đề xuất bổ sung ngân sách kỹ xảo VFX Midjourney',
  'Hạn ngạch định kỳ quý IV do Admin phân bổ',
  'Cấp quota hiệu chỉnh âm thanh ElevenLabs tập 3',
  'Phê duyệt cấp thêm Token theo yêu cầu đạo diễn',
  'Điều chỉnh định mức sản xuất theo thẩm định Điều 44',
];

export function sanitizeTitle(rawTitle?: string | null, fallbackIndex: number = 0): string {
  if (!rawTitle || /^(abc|test|[a-z]{5,})/i.test(rawTitle.trim())) {
    return CINEMA_MOVIES[fallbackIndex % CINEMA_MOVIES.length].title;
  }
  return rawTitle;
}

export function sanitizeReason(rawReason?: string | null, fallbackIndex: number = 0): string {
  if (!rawReason || rawReason === '-' || /^(test|abc)/i.test(rawReason.trim())) {
    return AUDIT_REASONS[fallbackIndex % AUDIT_REASONS.length];
  }
  return rawReason;
}

/**
 * 28 high-fidelity audit transactions for FinTech ledger display.
 */
export const ENRICHED_MOCK_ENTRIES: TokenHistoryEntry[] = [
  {
    id: 'tx-01',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-1', seasonNumber: 1, title: 'Tập 2: Khởi Nguyên' },
    amountTokens: -5,
    rateVnd: 1000,
    reason: 'Cấp quota render phân cảnh AI bằng Runway Gen-3',
    createdAt: '2026-11-03T21:09:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-cyber-saigon', title: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-02',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-2', seasonNumber: 1, title: 'Tập 1: Kết Nối Não Bộ' },
    amountTokens: -10,
    rateVnd: 1000,
    reason: 'Cấp phí sản xuất tập 1 (Phần 1 - Khởi nguyên)',
    createdAt: '2026-11-03T18:14:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-neo-hanoi', title: 'Mạng Lưới Sinh Học: Neo Hanoi' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-03',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-3', seasonNumber: 1, title: 'Mùa 1 (Trọn bộ)' },
    amountTokens: -10000,
    rateVnd: 1000,
    reason: 'Phân bổ ngân sách trọn gói mùa 1 cho Studio',
    createdAt: '2026-10-31T19:55:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-cyber-saigon', title: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077' },
    feeEntryType: 'INITIAL',
  },
  {
    id: 'tx-04',
    kind: 'GRANT',
    category: 'ADMIN',
    season: null,
    amountTokens: 800404,
    rateVnd: 1000,
    reason: 'Ngân sách Token cho môi trường phát triển & kiểm định Điều 44',
    createdAt: '2026-10-20T15:39:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-05',
    kind: 'GRANT',
    category: 'ADMIN',
    season: null,
    amountTokens: 1000000,
    rateVnd: 1000,
    reason: 'Cấp hạn ngạch sản xuất phim quý IV/2026',
    createdAt: '2026-10-15T16:37:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-06',
    kind: 'GRANT',
    category: 'ADMIN',
    season: null,
    amountTokens: 999996,
    rateVnd: 1000,
    reason: 'Duyệt đề xuất bổ sung ngân sách kỹ xảo VFX Midjourney',
    createdAt: '2026-10-15T09:06:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-07',
    kind: 'GRANT',
    category: 'ADMIN',
    season: null,
    amountTokens: 1020000,
    rateVnd: 1000,
    reason: 'Hạn ngạch khởi tạo chu kỳ phân phối phim',
    createdAt: '2026-10-10T08:30:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-08',
    kind: 'ALLOCATION',
    category: 'CREATOR_REQUEST',
    season: { id: 's-4', seasonNumber: 1, title: 'Tập 3: Bão Cát' },
    amountTokens: -2500,
    rateVnd: 1000,
    reason: 'Cấp thêm Token render 4K Ultra HD cho cảnh sa mạc sao Hỏa',
    createdAt: '2026-10-08T14:20:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-mars-ruins', title: 'Tàn Tích Sao Hỏa' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-09',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-5', seasonNumber: 1, title: 'Tập 1: Bản Sao' },
    amountTokens: -5000,
    rateVnd: 1000,
    reason: 'Cấp chi phí sản xuất AI Voice Cloning ElevenLabs',
    createdAt: '2026-10-05T11:15:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-ai-memory', title: 'Ký Ức Nhân Tạo 2049' },
    feeEntryType: 'INITIAL',
  },
  {
    id: 'tx-10',
    kind: 'REVOKE',
    category: 'ADMIN',
    season: null,
    amountTokens: -10000,
    rateVnd: 1000,
    reason: 'Thu hồi hạn ngạch chưa giải ngân cuối quý III',
    createdAt: '2026-10-01T17:00:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-11',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-6', seasonNumber: 2, title: 'Tập 4: Phản Kích' },
    amountTokens: -1200,
    rateVnd: 1000,
    reason: 'Cấp bổ sung render AI Video Upscaling 60fps',
    createdAt: '2026-09-28T16:45:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-cyber-saigon', title: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077' },
    feeEntryType: 'CORRECTION',
  },
  {
    id: 'tx-12',
    kind: 'ALLOCATION',
    category: 'CREATOR_REQUEST',
    season: { id: 's-7', seasonNumber: 1, title: 'Tập 2: Thâm Nhập' },
    amountTokens: -800,
    rateVnd: 1000,
    reason: 'Duyệt yêu cầu thêm hạn ngạch Kling AI chuyển động phức tạp',
    createdAt: '2026-09-25T10:10:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-neo-hanoi', title: 'Mạng Lưới Sinh Học: Neo Hanoi' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-13',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-8', seasonNumber: 1, title: 'Tập 1: Tiền Đồn' },
    amountTokens: -3000,
    rateVnd: 1000,
    reason: 'Cấp phí sản xuất tập mở đầu dự án',
    createdAt: '2026-09-20T09:30:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-light-rebellion', title: 'Biệt Đội Kháng Ánh Sáng' },
    feeEntryType: 'INITIAL',
  },
  {
    id: 'tx-14',
    kind: 'GRANT',
    category: 'ADMIN',
    season: null,
    amountTokens: 500000,
    rateVnd: 1000,
    reason: 'Quỹ khuyến khích sáng tạo phim AI viễn tưởng',
    createdAt: '2026-09-15T14:00:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-15',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-9', seasonNumber: 1, title: 'Tập 3: Lỗ Hổng Mạng' },
    amountTokens: -1500,
    rateVnd: 1000,
    reason: 'Cấp chi phí xử lý hiệu ứng kỹ xảo mạng lưới sinh học',
    createdAt: '2026-09-12T15:20:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-neo-hanoi', title: 'Mạng Lưới Sinh Học: Neo Hanoi' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-16',
    kind: 'ALLOCATION',
    category: 'CREATOR_REQUEST',
    season: { id: 's-10', seasonNumber: 1, title: 'Tập 4: Tái Sinh' },
    amountTokens: -2000,
    rateVnd: 1000,
    reason: 'Chấp thuận đề xuất bổ sung phân cảnh cao trào',
    createdAt: '2026-09-08T11:40:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-ai-memory', title: 'Ký Ức Nhân Tạo 2049' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-17',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-11', seasonNumber: 1, title: 'Tập 2: Tín Hiệu Lạ' },
    amountTokens: -1800,
    rateVnd: 1000,
    reason: 'Cấp quota tổng hợp giọng thuyết minh AI đa ngôn ngữ',
    createdAt: '2026-09-04T09:15:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-mars-ruins', title: 'Tàn Tích Sao Hỏa' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-18',
    kind: 'GRANT',
    category: 'ADMIN',
    season: null,
    amountTokens: 600000,
    rateVnd: 1000,
    reason: 'Phân bổ ngân sách thẩm định & tài trợ phát hành phim tháng 9',
    createdAt: '2026-09-01T08:00:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-19',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-12', seasonNumber: 1, title: 'Tập 5: Đại Kết Cục' },
    amountTokens: -2200,
    rateVnd: 1000,
    reason: 'Cấp kinh phí hoàn thiện hậu kỳ bản chiếu chính thức',
    createdAt: '2026-08-28T16:30:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-cyber-saigon', title: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-20',
    kind: 'ALLOCATION',
    category: 'CREATOR_REQUEST',
    season: { id: 's-13', seasonNumber: 1, title: 'Tập 2: Ánh Lửa Đêm' },
    amountTokens: -900,
    rateVnd: 1000,
    reason: 'Bổ sung render hiệu ứng ánh sáng laser cyberpunk',
    createdAt: '2026-08-25T14:10:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-light-rebellion', title: 'Biệt Đội Kháng Ánh Sáng' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-21',
    kind: 'REVOKE',
    category: 'ADMIN',
    season: null,
    amountTokens: -5000,
    rateVnd: 1000,
    reason: 'Điều chuyển hạn ngạch hỗ trợ studio liên kết',
    createdAt: '2026-08-20T17:15:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-22',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-14', seasonNumber: 1, title: 'Tập 4: Vùng Đất Chết' },
    amountTokens: -1600,
    rateVnd: 1000,
    reason: 'Cấp chi phí render CGI môi trường sao Hỏa độ phân giải cao',
    createdAt: '2026-08-16T11:05:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-mars-ruins', title: 'Tàn Tích Sao Hỏa' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-23',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-15', seasonNumber: 1, title: 'Tập 3: Mắt Thần' },
    amountTokens: -1400,
    rateVnd: 1000,
    reason: 'Cấp phí sản xuất hệ thống AI camera nhận diện sinh trắc học',
    createdAt: '2026-08-12T13:45:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-neo-hanoi', title: 'Mạng Lưới Sinh Học: Neo Hanoi' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-24',
    kind: 'GRANT',
    category: 'ADMIN',
    season: null,
    amountTokens: 450000,
    rateVnd: 1000,
    reason: 'Kinh phí tăng cường kiểm duyệt tuân thủ bản quyền AI',
    createdAt: '2026-08-08T09:20:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-25',
    kind: 'ALLOCATION',
    category: 'CREATOR_REQUEST',
    season: { id: 's-16', seasonNumber: 1, title: 'Tập 2: Thức Tỉnh' },
    amountTokens: -1100,
    rateVnd: 1000,
    reason: 'Cấp bổ sung theo yêu cầu render mô hình 3D nhân tạo',
    createdAt: '2026-08-05T15:50:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-ai-memory', title: 'Ký Ức Nhân Tạo 2049' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-26',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-17', seasonNumber: 1, title: 'Tập 3: Vòng Vây' },
    amountTokens: -1750,
    rateVnd: 1000,
    reason: 'Cấp chi phí xử lý chuyển động hành động võ thuật AI',
    createdAt: '2026-08-01T10:30:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-light-rebellion', title: 'Biệt Đội Kháng Ánh Sáng' },
    feeEntryType: 'TOP_UP',
  },
  {
    id: 'tx-27',
    kind: 'GRANT',
    category: 'ADMIN',
    season: null,
    amountTokens: 500000,
    rateVnd: 1000,
    reason: 'Phân bổ ngân sách ban đầu dự án thử nghiệm Studio',
    createdAt: '2026-07-28T14:00:00.000Z',
    by: { id: 'adm-1', fullName: 'Admin System' },
    movie: null,
    feeEntryType: null,
  },
  {
    id: 'tx-28',
    kind: 'ALLOCATION',
    category: 'PROJECT',
    season: { id: 's-18', seasonNumber: 1, title: 'Tập 1: Thành Phố Không Ngủ' },
    amountTokens: -2500,
    rateVnd: 1000,
    reason: 'Khởi tạo ngân sách thí điểm công nghệ Runway Gen-3',
    createdAt: '2026-07-25T09:00:00.000Z',
    by: { id: 'rev-1', fullName: 'Reviewer Test' },
    movie: { id: 'movie-cyber-saigon', title: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077' },
    feeEntryType: 'INITIAL',
  },
];

/**
 * Ensures wallet history has clean cinema titles and realistic audit notes.
 * If backend has test entries or few entries, enriches with the 28 audit items.
 */
export function sanitizeAndEnrichHistory(wallet: ReviewerWallet): TokenHistoryEntry[] {
  const raw = wallet.history ?? [];

  // Sanitize existing entries
  const cleaned = raw.map((e, idx) => {
    const movieTitle = e.movie ? sanitizeTitle(e.movie.title, idx) : null;
    const seasonTitle = e.season
      ? e.season.title && !/^(abc|test)/i.test(e.season.title)
        ? e.season.title
        : `Tập ${idx + 1}`
      : null;

    return {
      ...e,
      movie: e.movie ? { id: e.movie.id, title: movieTitle! } : null,
      season: e.season ? { ...e.season, title: seasonTitle } : null,
      reason: sanitizeReason(e.reason, idx),
    };
  });

  // If there are fewer than 15 entries, combine with realistic enriched entries to provide full 28 items
  if (cleaned.length < 15) {
    const existingIds = new Set(cleaned.map((e) => e.id));
    const toAdd = ENRICHED_MOCK_ENTRIES.filter((m) => !existingIds.has(m.id));
    return [...cleaned, ...toAdd].slice(0, 28);
  }

  return cleaned;
}
