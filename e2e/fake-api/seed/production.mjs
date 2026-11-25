// MF-1 records of the seeded projects: seasons and episodes, the team, the contract and hand-off, the delivered
// versions, releases, the cost ledger, price alerts and change requests, each in the state a scenario starts from.
import { U } from './people.mjs';

const AT = '2026-10-01T03:00:00.000Z';
const uid = (group, n) => `${group}-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const LUMEN = `studio-${U.studio.id}`;
export const PROJECT = {
  light: '11111111-1111-4111-8111-000000000001',
  winter: '11111111-1111-4111-8111-000000000002',
  monsoon: '11111111-1111-4111-8111-000000000004',
  alley: '11111111-1111-4111-8111-000000000005',
};

function season(movieId, n, seasonNumber) {
  return { id: uid('33333333', n), movieId, seasonNumber, title: `Mùa ${seasonNumber}`, releaseStartDate: '2026-10-01', releaseEndDate: '2027-12-31' };
}

function episode(movieId, seasonId, n, episodeNumber, title, status, fields = {}) {
  return {
    id: uid('44444444', n),
    movieId,
    seasonId,
    assignedCreatorId: null,
    episodeNumber,
    title,
    synopsis: null,
    thumbnailUrl: null,
    status,
    targetDurationSeconds: 1200,
    deliveryDeadline: '2027-01-15',
    dueDate: null,
    expectedReleaseDate: null,
    approvedMediaAssetId: null,
    coinPrice: null,
    isFreeForGuest: false,
    isFreeForMember: false,
    finalConfirmedAt: null,
    finalConfirmedById: null,
    finalRejectionNote: null,
    revisionStartedAt: null,
    createdAt: AT,
    updatedAt: AT,
    ...fields,
  };
}

function media(episodeId, n, version, ingestStatus, fields = {}) {
  return {
    id: uid('55555555', n),
    episodeId,
    version,
    sourceMethod: 'UPLOAD',
    sourceUrl: null,
    streamUrl: null,
    isSelfHosted: true,
    qualities: ingestStatus === 'READY' ? ['720p'] : [],
    durationSeconds: ingestStatus === 'READY' ? 1210 : null,
    fileSizeBytes: 50_000_000,
    ingestStatus,
    failureReason: null,
    aiDisclosure: { aiGeneratedParts: ['image', 'video'], noRealPersonLikeness: true, noCopyrightedMaterial: true },
    proposedLabelType: 'AI_GENERATED',
    submissionNote: null,
    lastCheckedAt: null,
    createdAt: AT,
    submittedById: U.studio.id,
    ingestJobs: [],
    reviews: [],
    label: null,
    checks: [],
    ...fields,
  };
}

const lead = (movieId, n, creatorId) => ({
  id: uid('66666666', n),
  movieId,
  creatorId,
  isActive: true,
  isLead: true,
  note: null,
  assignedAt: AT,
  unassignedAt: null,
  delegatedFromId: null,
  assignedById: U.admin.id,
});

/** A contract signed by both sides, with the hand-off it opened (MF-1 §4). */
function signedDeal(movieId, n, costVnd) {
  const handoffId = uid('77777777', n);
  return {
    contract: {
      id: uid('88888888', n),
      projectId: movieId,
      studioId: LUMEN,
      handoffId,
      round: 1,
      previousId: null,
      costVnd,
      ceilingVnd: costVnd,
      proposedBy: 'STUDIO',
      status: 'SIGNED',
      terms: 'Studio sản xuất đúng Kịch bản Final.',
      adminSignedAt: AT,
      adminSignedById: U.admin.id,
      studioSignedAt: AT,
      createdAt: AT,
      createdById: U.admin.id,
      documents: ['STUDIO', 'ADMIN', 'FINAL'].map((side) => ({
        id: `${uid('88888888', n)}-${side}`,
        side,
        fileName: `hop-dong-${side.toLowerCase()}.pdf`,
        sizeBytes: 20480,
        checksum: 'x',
        uploadedAt: AT,
      })),
    },
    handoff: {
      id: handoffId,
      movieId,
      studioId: LUMEN,
      seasonId: null,
      offeredFeeVnd: costVnd,
      forfeitedVnd: 0,
      changeReason: null,
      briefFileKey: `briefs/${handoffId}.pdf`,
      milestoneStatus: 'IN_PROGRESS',
      statusNote: null,
      respondedAt: null,
      declineReason: null,
      createdAt: AT,
      createdById: U.admin.id,
      emailMessage: { status: 'SENT', sentAt: AT, errorMessage: null },
      materials: [{ id: uid('99999999', n), kind: 'SCRIPT', fileName: 'kich-ban-final.pdf', mimeType: 'application/pdf', sizeBytes: 1024, createdAt: AT }],
      milestoneEvents: [],
    },
  };
}

const budget = (projectId, n, amountVnd) => ({
  id: uid('aaaaaaaa', n),
  projectId,
  entryType: 'BUDGET',
  amountVnd,
  reason: null,
  createdAt: AT,
  createdById: U.admin.id,
  request: null,
});

const released = (n, episodeId, mediaAssetId) => ({
  id: uid('bbbbbbbb', n),
  episodeId,
  mediaAssetId,
  scheduledAt: null,
  publishedAt: AT,
  unpublishedAt: null,
  unpublishReason: null,
  unpublishNote: null,
  unpublishMode: null,
  createdAt: AT,
  publishedById: U.admin.id,
  unpublishedById: null,
});

function changeRequest(n, requestedById, content) {
  return {
    id: uid('cccccccc', n),
    projectId: PROJECT.light,
    requestType: 'DEADLINE_EXTENSION',
    content,
    reason: 'Studio cần thêm thời gian dựng hậu kỳ.',
    attachmentName: null,
    status: 'OPEN',
    adminResponse: null,
    createdAt: AT,
    resolvedAt: null,
    requestedById,
    resolvedById: null,
    seasonId: null,
    episodeId: null,
  };
}

export function production() {
  const s1 = season(PROJECT.light, 1, 1);
  const s2 = season(PROJECT.winter, 2, 1);
  const s4 = season(PROJECT.monsoon, 4, 1);
  const s5 = season(PROJECT.alley, 5, 1);
  const done = { finalConfirmedAt: AT, finalConfirmedById: U.reviewer.id };
  const episodes = [
    episode(PROJECT.light, s1.id, 1, 1, 'Khởi đầu', 'PUBLISHED', { approvedMediaAssetId: uid('55555555', 1), coinPrice: 150, ...done }),
    episode(PROJECT.light, s1.id, 2, 2, 'Bóng tối', 'PUBLISHED', { approvedMediaAssetId: uid('55555555', 2), coinPrice: 10, ...done }),
    episode(PROJECT.light, s1.id, 3, 3, 'Ánh sáng', 'IN_REVIEW'),
    episode(PROJECT.light, s1.id, 4, 4, 'Lối về', 'PROCESSING'),
    episode(PROJECT.winter, s2.id, 5, 1, 'Tuyết đầu mùa', 'DRAFT'),
    episode(PROJECT.winter, s2.id, 6, 2, 'Bếp lửa', 'DRAFT'),
    episode(PROJECT.monsoon, s4.id, 7, 1, 'Mây đen', 'COMPLIANCE_PASSED', { approvedMediaAssetId: uid('55555555', 7), coinPrice: 10 }),
    episode(PROJECT.monsoon, s4.id, 8, 2, 'Mưa rào', 'COMPLIANCE_PASSED', { approvedMediaAssetId: uid('55555555', 8), ...done }),
    episode(PROJECT.monsoon, s4.id, 9, 3, 'Nắng lên', 'COMPLIANCE_PASSED', { approvedMediaAssetId: uid('55555555', 9), coinPrice: 10, ...done }),
    episode(PROJECT.alley, s5.id, 10, 1, 'Ngõ vắng', 'DRAFT'),
    episode(PROJECT.alley, s5.id, 11, 2, 'Đèn khuya', 'DRAFT'),
  ];
  const passed = (n, episodeId) => media(episodeId, n, 1, 'READY', { label: { labelType: 'AI_GENERATED', labelText: 'Nội dung do AI tạo', displayLocation: 'TOP_RIGHT', appliedAt: AT }, checksPassed: true });
  const light = signedDeal(PROJECT.light, 1, 100_000_000);
  const monsoon = signedDeal(PROJECT.monsoon, 2, 80_000_000);
  return {
    seasons: [s1, s2, s4, s5],
    episodes,
    media: [
      passed(1, episodes[0].id),
      passed(2, episodes[1].id),
      media(episodes[2].id, 3, 1, 'READY'),
      media(episodes[3].id, 4, 1, 'FAILED', { failureReason: 'Video không đọc được' }),
      media(episodes[3].id, 5, 2, 'TRANSCODING', {
        ingestJobs: [{ id: uid('55555555', 50), jobType: 'TRANSCODE', status: 'RUNNING', attempts: 1, progressPercent: 40, errorMessage: null, createdAt: AT }],
      }),
      passed(7, episodes[6].id),
      passed(8, episodes[7].id),
      passed(9, episodes[8].id),
    ],
    publications: [released(1, episodes[0].id, uid('55555555', 1)), released(2, episodes[1].id, uid('55555555', 2))],
    seats: [lead(PROJECT.light, 1, U.creator.id), lead(PROJECT.monsoon, 4, U.creator.id), lead(PROJECT.alley, 5, U.creator.id)],
    contracts: [light.contract, monsoon.contract],
    handoffs: [light.handoff, monsoon.handoff],
    costEntries: [budget(PROJECT.light, 1, 200_000_000), budget(PROJECT.winter, 2, 150_000_000), budget(PROJECT.monsoon, 4, 120_000_000)],
    costRequests: [],
    ideaFiles: [],
    notes: [],
    scripts: [],
    priceAlerts: [
      {
        id: uid('dddddddd', 1),
        episodeId: episodes[0].id,
        coinPrice: 150,
        rangeMin: 1,
        rangeMax: 100,
        status: 'OPEN',
        adminNote: null,
        createdAt: AT,
        handledAt: null,
        setById: U.admin.id,
        handledById: null,
      },
    ],
    changeRequests: [
      changeRequest(1, U.reviewer.id, 'Lùi hạn giao tập 3 thêm một tuần.'),
      changeRequest(2, U.creator.id, 'Đổi tên tập 4 thành "Đường về".'),
    ],
    /** A member who bought episode 2 of "Ánh sáng cuối": removing it for good refunds those Coins. */
    unlocks: [{ episodeId: episodes[1].id, memberId: U.member.id, paidCoins: 10 }],
    coinLines: [],
  };
}
