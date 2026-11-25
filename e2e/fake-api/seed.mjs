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
const prize = (pid, name, type, amount, isActive) => ({
  id: pid,
  code: pid,
  name,
  type,
  bonusCoins: type === 'BONUS_COIN' ? amount : null,
  planDays: type === 'PLAN_DAYS' ? amount : null,
  weight: 1,
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
      prize('pz-a', 'Giải A', 'BONUS_COIN', 100, true),
      prize('pz-b', 'Giải B', 'PLAN_DAYS', 7, true),
    ],
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