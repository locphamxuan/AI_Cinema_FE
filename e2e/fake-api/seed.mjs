// Seed of the fake AI Cinema API: a fresh copy of every account and record; each test starts from it.
import { people, U, DEFAULT_PERMISSIONS } from './seed/people.mjs';
import { LUMEN, PROJECT, production } from './seed/production.mjs';
import { support } from './seed/support.mjs';

const AT = '2026-10-01T03:00:00.000Z';

const studio = (sid, name, email) => ({ id: sid, name, email, contactName: null, phone: '0900000000', note: null, isActive: true, createdAt: AT });
const policy = (pid, name, type) => ({
  id: pid,
  name,
  type,
  version: '1.0',
  documentReference: null,
  content: `Nội dung ${name}.`,
  effectiveFrom: null,
  effectiveTo: null,
  isActive: true,
  createdAt: AT,
  updatedAt: AT,
});
const riskFlag = (fid, ruleCode, reason, entryType, mainAmount) => ({
  id: fid,
  ruleCode,
  reason,
  status: 'OPEN',
  reviewNote: null,
  reviewedAt: null,
  reviewedById: null,
  createdAt: AT,
  userId: U.member.id,
  coinTransaction: { id: `tx-${fid}`, entryType, mainAmount, bonusAmount: 0, rateVnd: 1000, createdAt: AT },
});
const prize = (pid, name, type, amount, isActive, weight) => ({
  id: pid,
  code: pid,
  name,
  type,
  bonusCoins: type === 'BONUS_COIN' ? amount : null,
  planDays: type === 'PLAN_DAYS' ? amount : null,
  weight,
  isActive,
  createdAt: AT,
});

function project(id, title, status, fields) {
  return {
    id,
    title,
    status,
    posterUrl: null,
    studioId: null,
    reviewerId: U.reviewer.id,
    creatorId: null,
    createdAt: AT,
    updatedAt: AT,
    lastActivityAt: AT,
    ...fields,
  };
}

export function seed() {
  const projects = [
    project(PROJECT.light, 'Ánh sáng cuối', 'IN_PRODUCTION', { studioId: LUMEN, creatorId: U.creator.id }),
    project(PROJECT.winter, 'Mùa đông ấm', 'DRAFT'),
    project('11111111-1111-4111-8111-000000000003', 'Bến cảng', 'COMPLETED', {
      studioId: LUMEN,
      reviewerId: U.reviewer2.id,
      creatorId: U.creator2.id,
    }),
    project(PROJECT.monsoon, 'Gió mùa', 'IN_PRODUCTION', { studioId: LUMEN, creatorId: U.creator.id }),
    project(PROJECT.alley, 'Hẻm nhỏ', 'ASSIGNED', { studioId: LUMEN, creatorId: U.creator.id }),
  ];
  return {
    users: people(),
    tokens: { access: {}, refresh: {} },
    notifications: [],
    projects,
    studios: [studio(LUMEN, U.studio.fullName, U.studio.email), studio('studio-nova', 'Nova Studio', 'nova@studio.vn')],
    ...production(),
    ...support(),
    roles: Object.fromEntries(Object.entries(DEFAULT_PERMISSIONS).map(([r, p]) => [r, [...p]])),
    genres: [
      { id: 'g1', name: 'Hành động', description: null },
      { id: 'g2', name: 'Tâm lý', description: null },
    ],
    policies: [
      policy('pol-ai', 'Quy định gắn nhãn AI', 'AI_LABELING'),
      policy('pol-content', 'Quy định nội dung', 'CONTENT_POLICY'),
      policy('pol-legal', 'Quy định pháp lý', 'LEGAL'),
    ],
    settings: {
      freeStarterEpisodeCount: 1,
      coinRateVnd: 1000,
      episodeCoinPriceMin: 1,
      episodeCoinPriceMax: 100,
      playbackHeartbeatTimeoutSeconds: 30,
      subscriptionCancelWindowHours: 24,
      planRenewalGraceHours: 0,
      newMemberBonusCoins: 0,
      coinTopUpMinVnd: 10000,
      coinTopUpMaxVnd: 1000000,
      refundOnRemoval: true,
      contractCompanyName: null,
      contractAddress: null,
      contractTaxCode: null,
      contractPhone: null,
      contractEmail: null,
      updatedAt: AT,
    },
    prizes: [
      prize('pz-a', 'Giải A', 'BONUS_COIN', 100, true, 6000),
      prize('pz-b', 'Giải B', 'PLAN_DAYS', 7, true, 4000),
      prize('pz-c', 'Giải C', 'BONUS_COIN', 20, false, 1000),
    ],
    /** One open large top-up of the seeded member; the unlock burst shows up on the first scan. */
    riskFlags: [
      riskFlag('rf-1', 'LARGE_TOP_UP', 'Nạp 6000000 VND trong một lần', 'TOP_UP', 6000),
      { ...riskFlag('rf-2', 'RAPID_UNLOCKS', '15 lượt mở khóa trong 10 phút', 'EPISODE_PURCHASE', -10), pendingScan: true },
    ],
    ads: [{ id: 'ad-1', title: 'Nước cam', mediaUrl: 'https://cdn.example/ads/cam.mp4', durationSeconds: 30, status: 'ACTIVE' }],
    knowledge: [
      {
        id: 'kb-1',
        slug: 'bai-mau',
        title: 'Bài mẫu',
        category: 'Gói Tháng',
        contentMarkdown: '## Hỏi\nĐáp.',
        status: 'PUBLISHED',
        indexStatus: 'READY',
        audience: 'MEMBER',
        source: 'MANUAL',
        createdAt: AT,
        updatedAt: AT,
      },
    ],
  };
}