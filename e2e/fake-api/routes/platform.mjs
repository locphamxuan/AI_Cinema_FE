// Cài đặt nền tảng (platform settings): one row of numbers the Admin edits; the apps read it.
import { now, on, refuse } from '../core.mjs';

on('GET', '/platform-settings', ({ db }) => db.settings);
on('PATCH', '/platform-settings', ({ db, body }) => {
  const numeric = [
    'freeStarterEpisodeCount',
    'coinRateVnd',
    'episodeCoinPriceMin',
    'episodeCoinPriceMax',
    'playbackHeartbeatTimeoutSeconds',
    'subscriptionCancelWindowHours',
    'planRenewalGraceHours',
    'newMemberBonusCoins',
    'coinTopUpMinVnd',
    'coinTopUpMaxVnd',
  ];
  for (const key of numeric) {
    if (body[key] !== undefined) {
      const n = Number(body[key]);
      if (!Number.isInteger(n) || n < 0) throw refuse(400, `${key} must be a non-negative integer`);
      db.settings[key] = n;
    }
  }
  if (body.refundOnRemoval !== undefined) db.settings.refundOnRemoval = Boolean(body.refundOnRemoval);
  for (const key of ['contractCompanyName', 'contractAddress', 'contractTaxCode', 'contractPhone', 'contractEmail']) {
    if (body[key] !== undefined) db.settings[key] = body[key] ?? null;
  }
  db.settings.updatedAt = now();
  return db.settings;
}, ['ADMIN']);