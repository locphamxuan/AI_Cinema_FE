// One episode from delivery to release (MF-1 steps 5–16): the versions the studio delivered, review, AI label,
// compliance, the Final Film, Coin price and free flags, releases and take-downs, and the Admin's price alerts.
import { id, notify, now, on, paged, person, refuse, userById } from '../core.mjs';
import { DELIVERY_PROJECT, adminIds, assertStatus, findEpisode, findProject, projectFor, touch } from '../production.mjs';

const POLICY = { id: 'pol-ai', name: 'Quy định gắn nhãn AI', documentReference: null };
const REVIEWED = ['APPROVED', 'LABELED', 'COMPLIANCE_PASSED'];
const RELEASABLE = ['COMPLIANCE_PASSED', 'UNPUBLISHED', 'SCHEDULED'];
/** What the fake keeps on a version beside the API's fields: its review sheet, as separate rows in the API. */
const INTERNAL = ['reviews', 'label', 'checks', 'checksPassed', 'submittedById'];
const CHECKS = ['AI_LABEL_PRESENCE', 'DECREE_142_NOTICE', 'CONTENT_SAFETY', 'REAL_PERSON_LIKENESS'];

function mediaView(db, m) {
  const episode = findEpisode(db, m.episodeId);
  const handoff = db.handoffs.find((h) => h.movieId === episode.movieId && h.milestoneStatus !== 'SUPERSEDED');
  const studio = handoff && db.studios.find((s) => s.id === handoff.studioId);
  const asset = Object.fromEntries(Object.entries(m).filter(([key]) => !INTERNAL.includes(key)));
  return { ...asset, submittedBy: person(userById(m.submittedById)), studioHandoff: handoff ? { id: handoff.id, studio: { id: studio.id, name: studio.name } } : null };
}

function sheetOf(db, m) {
  const episode = findEpisode(db, m.episodeId);
  const project = findProject(db, episode.movieId);
  const checks = m.checksPassed ? CHECKS.map((checkType) => ({ checkType, result: 'PASS', failureReason: null })) : m.checks;
  return {
    ...mediaView(db, m),
    episode: {
      id: episode.id, episodeNumber: episode.episodeNumber, title: episode.title, status: episode.status,
      targetDurationSeconds: episode.targetDurationSeconds, movie: { id: project.id, title: project.title, status: project.status },
    },
    contentReviews: [...m.reviews].reverse().map((r) => ({ ...r, reviewer: person(userById(r.reviewerId)) })),
    aiContentLabel: m.label ? { id: `${m.id}-label`, ...m.label, policy: POLICY } : null,
    complianceChecks: checks.map((c, i) => ({ id: `${m.id}-check-${i}`, checkedAt: now(), policy: POLICY, ...c })),
    isApprovedVersion: episode.approvedMediaAssetId === m.id,
    durationCheck: {
      targetSeconds: episode.targetDurationSeconds, actualSeconds: m.durationSeconds,
      deviationSeconds: m.durationSeconds === null ? null : m.durationSeconds - episode.targetDurationSeconds, warning: false,
    },
  };
}

/** The version and its episode, for the Reviewer in charge of a project still being delivered. */
function forReview(db, user, mediaId) {
  const m = db.media.find((x) => x.id === mediaId);
  if (!m) throw refuse(404, 'Media asset not found');
  const episode = findEpisode(db, m.episodeId);
  const project = projectFor(db, episode.movieId, user, 'reviewer');
  assertStatus(project.status, DELIVERY_PROJECT, 'review an episode');
  return { m, episode, project };
}

/** Sends the episode back to the studio: the Final Film confirmation is cleared (content-review.service). */
function requestChanges(db, m, episode, project, reviewerId, comments) {
  m.reviews.push({ id: id(), decision: 'CHANGES_REQUESTED', comments, createdAt: now(), reviewerId });
  Object.assign(episode, { status: 'CHANGES_REQUESTED', finalConfirmedAt: null, finalConfirmedById: null, updatedAt: now() });
  const studio = db.studios.find((s) => s.id === project.studioId);
  const login = db.users.find((u) => u.role === 'STUDIO' && u.email === studio?.email);
  if (login) notify(login.id, `Yêu cầu sửa tập ${episode.episodeNumber} của phim "${project.title}": ${comments}`);
  touch(project);
}

on('GET', '/episodes/:id/media', ({ db, user, params }) => {
  const episode = findEpisode(db, params.id);
  projectFor(db, episode.movieId, user);
  return db.media.filter((m) => m.episodeId === episode.id).sort((a, b) => b.version - a.version).map((m) => mediaView(db, m));
});
on('GET', '/media-assets/:id/review-sheet', ({ db, params }) => {
  const m = db.media.find((x) => x.id === params.id);
  if (!m) throw refuse(404, 'Media asset not found');
  return sheetOf(db, m);
});

on('POST', '/media-assets/:id/reviews', ({ db, user, params, body }) => {
  const { m, episode, project } = forReview(db, user, params.id);
  if (body.decision === 'APPROVED') {
    assertStatus(episode.status, ['IN_REVIEW'], 'approve an episode');
    m.reviews.push({ id: id(), decision: 'APPROVED', comments: null, createdAt: now(), reviewerId: user.id });
    Object.assign(episode, { status: 'APPROVED', approvedMediaAssetId: m.id, updatedAt: now() });
    touch(project);
  } else {
    assertStatus(episode.status, ['IN_REVIEW', ...REVIEWED], 'request changes on an episode');
    if (!String(body.comments ?? '').trim()) throw refuse(400, 'Say what the studio must change (comments)');
    requestChanges(db, m, episode, project, user.id, body.comments.trim());
  }
  return sheetOf(db, m);
}, ['CONTENT_REVIEWER']);

on('POST', '/media-assets/:id/ai-content-labels', ({ db, user, params, body }) => {
  const { m, episode, project } = forReview(db, user, params.id);
  if (episode.approvedMediaAssetId !== m.id) throw refuse(409, 'Label the approved version of the episode');
  assertStatus(episode.status, REVIEWED, 'label an episode');
  if (String(body.labelText ?? '').trim().length < 5) throw refuse(400, 'The label text needs at least 5 characters');
  m.label = { labelType: body.labelType, labelText: body.labelText.trim(), displayLocation: body.displayLocation ?? 'TOP_RIGHT', appliedAt: now() };
  Object.assign(m, { checks: [], checksPassed: false });
  episode.status = 'LABELED';
  touch(project);
  return sheetOf(db, m);
}, ['CONTENT_REVIEWER']);

on('POST', '/media-assets/:id/compliance-checks', ({ db, user, params, body }) => {
  const { m, episode, project } = forReview(db, user, params.id);
  assertStatus(episode.status, ['LABELED'], 'check an episode');
  const verdict = (input) => ({ result: input?.result === 'PASS' ? 'PASS' : 'FAIL', failureReason: input?.failureReason ?? null });
  m.checks = [
    { checkType: 'AI_LABEL_PRESENCE', result: m.label ? 'PASS' : 'FAIL', failureReason: null },
    { checkType: 'DECREE_142_NOTICE', ...verdict(body.decree142Notice) },
    { checkType: 'CONTENT_SAFETY', ...verdict(body.contentSafety) },
    { checkType: 'REAL_PERSON_LIKENESS', result: body.depictsRealPersonOrEvent ? 'FAIL' : 'PASS', failureReason: body.realPersonNote ?? null },
  ];
  if (m.checks.every((c) => c.result === 'PASS')) {
    episode.status = 'COMPLIANCE_PASSED';
    touch(project);
  } else requestChanges(db, m, episode, project, user.id, 'Không đạt kiểm tra tuân thủ');
  return sheetOf(db, m);
}, ['CONTENT_REVIEWER']);

// ---- Final Film (the Reviewer confirms, the Admin may send it back) ----
on('POST', '/episodes/:id/final-confirmation', ({ db, user, params }) => {
  const episode = findEpisode(db, params.id);
  const project = projectFor(db, episode.movieId, user, 'reviewer');
  assertStatus(episode.status, ['COMPLIANCE_PASSED'], 'confirm the Final Film');
  if (episode.finalConfirmedAt) throw refuse(409, 'The Final Film is already confirmed');
  Object.assign(episode, { finalConfirmedAt: now(), finalConfirmedById: user.id, finalRejectionNote: null });
  for (const admin of adminIds()) notify(admin, `Phim bản cuối tập ${episode.episodeNumber} của "${project.title}" chờ phát hành.`, `/projects/${project.id}/episodes/${episode.id}`);
  touch(project);
  return episode;
}, ['CONTENT_REVIEWER']);
on('POST', '/episodes/:id/final-rejection', ({ db, params, body }) => {
  const episode = findEpisode(db, params.id);
  const project = findProject(db, episode.movieId);
  if (!episode.finalConfirmedAt) throw refuse(409, 'The Reviewer has not confirmed this Final Film');
  if (!String(body.reason ?? '').trim()) throw refuse(400, 'Say why the Final Film goes back (reason)');
  Object.assign(episode, { finalConfirmedAt: null, finalConfirmedById: null, finalRejectionNote: body.reason.trim() });
  notify(project.reviewerId, `Admin trả lại Phim bản cuối tập ${episode.episodeNumber}: ${body.reason.trim()}`, `/projects/${project.id}/episodes/${episode.id}`);
  touch(project);
  return episode;
}, ['ADMIN']);

// ---- Price, free flags and releases (the Admin) ----
on('PATCH', '/episodes/:id/coin-price', ({ db, user, params, body }) => {
  const episode = findEpisode(db, params.id);
  const price = Number(body.coinPrice);
  if (!Number.isInteger(price) || price < 0 || price > 1_000_000) throw refuse(400, 'The Coin price must be a whole number from 0 to 1000000');
  episode.coinPrice = price;
  const { episodeCoinPriceMin: rangeMin, episodeCoinPriceMax: rangeMax } = db.settings;
  if (price < rangeMin || price > rangeMax) {
    db.priceAlerts.unshift({ id: id(), episodeId: episode.id, coinPrice: price, rangeMin, rangeMax, status: 'OPEN', adminNote: null, createdAt: now(), handledAt: null, setById: user.id, handledById: null });
    for (const admin of adminIds()) notify(admin, `Giá ${price} Coin của tập ${episode.episodeNumber} nằm ngoài khoảng ${rangeMin}–${rangeMax}.`, '/admin/price-alerts');
  }
  touch(findProject(db, episode.movieId));
  return episode;
}, ['ADMIN']);
on('PATCH', '/episodes/:id/access-flags', ({ db, params, body }) => {
  const episode = findEpisode(db, params.id);
  Object.assign(episode, { isFreeForGuest: !!body.isFreeForGuest, isFreeForMember: !!(body.isFreeForGuest || body.isFreeForMember) });
  return episode;
}, ['ADMIN']);

const publicationView = (p) => ({ ...p, publishedBy: person(userById(p.publishedById)), unpublishedBy: person(p.unpublishedById ? userById(p.unpublishedById) : null) });
on('GET', '/episodes/:id/publications', ({ db, user, params }) => {
  const episode = findEpisode(db, params.id);
  projectFor(db, episode.movieId, user);
  return db.publications.filter((p) => p.episodeId === episode.id).reverse().map(publicationView);
});
on('POST', '/episodes/:id/publications', ({ db, user, params, body }) => {
  const episode = findEpisode(db, params.id);
  const project = findProject(db, episode.movieId);
  assertStatus(episode.status, RELEASABLE, 'publish an episode');
  if (episode.status === 'COMPLIANCE_PASSED' && !episode.finalConfirmedAt) throw refuse(409, 'The Reviewer has not confirmed this Final Film');
  if (episode.coinPrice === null) throw refuse(409, 'Set the Coin price of the episode first');
  const scheduledAt = body.scheduledAt ?? null;
  const publication = {
    id: id(), episodeId: episode.id, mediaAssetId: episode.approvedMediaAssetId, scheduledAt, publishedAt: scheduledAt ? null : now(), unpublishedAt: null,
    unpublishReason: null, unpublishNote: null, unpublishMode: null, createdAt: now(), publishedById: user.id, unpublishedById: null,
  };
  db.publications.push(publication);
  Object.assign(episode, { status: scheduledAt ? 'SCHEDULED' : 'PUBLISHED', revisionStartedAt: null });
  touch(project);
  return publicationView(publication);
}, ['ADMIN']);

on('POST', '/publications/:id/unpublish', ({ db, user, params, body }) => {
  const publication = db.publications.find((p) => p.id === params.id);
  if (!publication) throw refuse(404, 'Publication not found');
  if (publication.unpublishedAt) throw refuse(409, 'This release was already taken down');
  const episode = findEpisode(db, publication.episodeId);
  const project = findProject(db, episode.movieId);
  const live = publication.publishedAt !== null;
  assertStatus(episode.status, [live ? 'PUBLISHED' : 'SCHEDULED'], 'unpublish an episode');
  if (live && !body.mode) throw refuse(400, 'Say whether the episode is taken down to be fixed (REVISION) or for good (REMOVAL)');
  const note = String(body.note ?? '').trim();
  Object.assign(publication, { unpublishedAt: now(), unpublishReason: body.reason, unpublishNote: note, unpublishMode: live ? body.mode : null, unpublishedById: user.id });
  if (live && body.mode === 'REVISION') {
    const m = db.media.find((x) => x.id === publication.mediaAssetId);
    requestChanges(db, m, episode, project, user.id, `Taken down to be fixed: ${note}`);
    episode.revisionStartedAt = now();
    if (project.status === 'COMPLETED') project.status = 'UNDER_REVISION';
    notify(project.reviewerId, `Tập ${episode.episodeNumber} của "${project.title}" bị gỡ để sửa: ${note}`, `/projects/${project.id}/episodes/${episode.id}`);
  } else {
    episode.status = live ? 'UNPUBLISHED' : 'COMPLIANCE_PASSED';
    // BR-52: an episode taken down for good pays back everyone who bought it.
    if (live && db.settings.refundOnRemoval) {
      for (const unlock of db.unlocks.filter((u) => u.episodeId === episode.id && !u.revokedAt)) {
        unlock.revokedAt = now();
        db.coinLines.unshift({
          id: id(), walletId: `wallet-${unlock.memberId}`, userId: unlock.memberId, paymentId: null, entryType: 'REFUND', mainAmount: unlock.paidCoins,
          bonusAmount: 0, rateVnd: null, description: null, referenceType: 'Episode', referenceId: episode.id, createdAt: now(),
          mainBalanceAfter: unlock.paidCoins, bonusBalanceAfter: 0,
        });
      }
    }
  }
  touch(project);
  return publicationView(publication);
}, ['ADMIN']);

on('GET', '/admin/coin-transactions', ({ db, query }) => {
  const type = query.get('entryType');
  const account = query.get('account')?.toLowerCase();
  const lines = db.coinLines.map((l) => ({ ...l, account: l.account ?? person(userById(l.userId)) }));
  const matches = (a) => !account || a.fullName.toLowerCase().includes(account) || a.email.toLowerCase().includes(account);
  return paged(lines.filter((l) => (!type || l.entryType === type) && matches(l.account)), query);
}, ['ADMIN']);
/** The balance after the latest row of the member, read only. */
on('GET', '/admin/wallets/:userId', ({ db, params }) => {
  const latest = db.coinLines.find((l) => l.userId === params.userId);
  if (!latest) throw refuse(404, 'Wallet not found', { reason: 'WALLET_NOT_FOUND' });
  return { id: latest.walletId, userId: params.userId, mainBalance: latest.mainBalanceAfter, bonusBalance: latest.bonusBalanceAfter, updatedAt: latest.createdAt, lots: [] };
}, ['ADMIN']);

// ---- Price alerts (BR-47) ----
function alertView(db, a) {
  const episode = findEpisode(db, a.episodeId);
  const project = findProject(db, episode.movieId);
  return {
    ...a,
    episode: { id: episode.id, episodeNumber: episode.episodeNumber, title: episode.title, coinPrice: episode.coinPrice, movie: { id: project.id, title: project.title } },
    setBy: person(userById(a.setById)),
    handledBy: person(a.handledById ? userById(a.handledById) : null),
  };
}
on('GET', '/admin/price-alerts', ({ db, query }) => {
  const status = query.get('filter.status')?.replace(/^\$eq:/, '');
  return paged(db.priceAlerts.filter((a) => !status || a.status === status).map((a) => alertView(db, a)), query);
}, ['ADMIN']);
function handle(db, user, alertId, fields) {
  const alert = db.priceAlerts.find((a) => a.id === alertId);
  if (!alert) throw refuse(404, 'Price alert not found');
  if (alert.status === 'RESOLVED') throw refuse(409, 'This alert was already resolved');
  Object.assign(alert, fields, { handledAt: now(), handledById: user.id });
  return alert;
}
on('POST', '/admin/price-alerts/:id/request-change', ({ db, user, params, body }) => {
  const alert = handle(db, user, params.id, { status: 'CHANGE_REQUESTED', adminNote: String(body.note ?? '').trim() });
  const project = findProject(db, findEpisode(db, alert.episodeId).movieId);
  notify(project.reviewerId, `Admin hỏi ý kiến về giá ${alert.coinPrice} Coin: ${alert.adminNote}`);
  return alertView(db, alert);
}, ['ADMIN']);
on('POST', '/admin/price-alerts/:id/resolve', ({ db, user, params }) => alertView(db, handle(db, user, params.id, { status: 'RESOLVED' })), ['ADMIN']);

// ---- Studio Web: the studio delivers a new version (studio-portal media) ----
on('POST', '/studio-portal/episodes/:id/media', ({ db, user, params, body }) => {
  const episode = findEpisode(db, params.id);
  const project = findProject(db, episode.movieId);
  if (db.studios.find((s) => s.id === project.studioId)?.email !== user.email) throw refuse(403, 'Only the studio delivers its films');
  assertStatus(episode.status, ['AWAITING_MEDIA', 'CHANGES_REQUESTED'], 'deliver an episode');
  const versions = db.media.filter((m) => m.episodeId === episode.id);
  const previous = versions.find((m) => m.ingestStatus === 'READY');
  db.media.push({
    ...previous, id: id(), version: versions.length + 1, ingestStatus: 'READY', durationSeconds: 1205, createdAt: now(), submissionNote: body.submissionNote ?? null,
    submittedById: user.id, reviews: [], label: null, checks: [], checksPassed: false, ingestJobs: [],
  });
  Object.assign(episode, { status: 'IN_REVIEW', updatedAt: now() });
  touch(project);
}, ['STUDIO']);
