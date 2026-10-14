import { describe, expect, it } from 'vitest';
import { notificationHref, productionBaseFor, productionPaths } from '@/features/production/lib/routes';
import { projectCapabilities } from '@/features/production/lib/capabilities';
import { addDays, formatDay, formatDuration } from '@/features/production/lib/format';
import {
  deadlineValid,
  releaseDateValid,
  spreadDeadlines,
  toEpisodeInput,
  windowValid,
} from '@/features/production/components/shared/EpisodeRowsEditor';
import { deadlineUsable } from '@/features/production/components/project/DueDateRows';
import { getTodayDateString } from '@/lib/dateUtils';
import { PERMISSION, type PermissionKey } from '@/lib/permissions';

const grant = (...keys: PermissionKey[]) => (p: PermissionKey) => keys.includes(p);

describe('production routes', () => {
  it('sends Creators to /creator and everyone else to /reviewer', () => {
    expect(productionBaseFor('creator')).toBe('/creator');
    expect(productionBaseFor('reviewer')).toBe('/reviewer');
    expect(productionBaseFor('admin')).toBe('/admin');
    expect(productionPaths.project('/creator', 'm1', 'studio')).toBe('/creator/projects/m1?tab=studio');
  });

  it.each([
    ['/projects/m1/episodes/e1', 'creator', '/creator/projects/m1/episodes/e1'],
    ['/projects/m1/episodes/e1', 'reviewer', '/reviewer/projects/m1/episodes/e1'],
    ['/projects/m1/change-requests', 'reviewer', '/reviewer/projects/m1?tab=changes'],
    ['/projects/m1/studio', 'creator', '/creator/projects/m1?tab=studio'],
    ['/projects/m1', 'admin', '/admin/projects/m1'],
    ['/admin/price-alerts', 'admin', '/admin/price-alerts'],
  ] as const)('opens the notification link %s for a %s at %s', (link, role, href) => {
    expect(notificationHref(link, role)).toBe(href);
  });

  it('ignores a missing or external link', () => {
    expect(notificationHref(null, 'reviewer')).toBeNull();
    expect(notificationHref('https://studio.example/playlist.m3u8', 'reviewer')).toBeNull();
  });
});

describe('projectCapabilities', () => {
  const project = { status: 'IN_PRODUCTION' as const, reviewerId: 'rev', creatorId: 'cre' };
  const reviewerKeys = grant(PERMISSION.PROJECT_MANAGE, PERMISSION.PROJECT_FEE_ALLOCATE, PERMISSION.CONTENT_REVIEW, PERMISSION.EPISODE_PUBLISH);

  it('lets only the Reviewer in charge manage, review and publish', () => {
    expect(projectCapabilities(project, 'rev', reviewerKeys)).toMatchObject({ manage: true, review: true, publish: true, handoff: false });
    // Another Reviewer holds the same permissions but does not own the project.
    expect(projectCapabilities(project, 'other', reviewerKeys)).toMatchObject({ manage: false, review: false, publish: false });
  });

  it('lets the lead Creator and the Creators of the team hand off and deliver', () => {
    const creatorKeys = grant(PERMISSION.STUDIO_HANDOFF, PERMISSION.MEDIA_INGEST, PERMISSION.PROJECT_SUGGEST);
    const team = { ...project, creatorAssignments: [{ creatorId: 'cre' }, { creatorId: 'second' }] };
    expect(projectCapabilities(team, 'cre', creatorKeys)).toMatchObject({ creator: true, lead: true, handoff: true, ingest: true, manage: false });
    expect(projectCapabilities(team, 'second', creatorKeys)).toMatchObject({ creator: true, lead: false, handoff: true, delegate: true });
    expect(projectCapabilities(team, 'someone', creatorKeys)).toMatchObject({ creator: false, handoff: false, ingest: false, suggest: false });
  });

  it('lets the Reviewer in charge and the Creators of the team ask the Admin (BR-55)', () => {
    const suggestKeys = grant(PERMISSION.PROJECT_SUGGEST);
    expect(projectCapabilities(project, 'rev', suggestKeys).suggest).toBe(true);
    expect(projectCapabilities(project, 'cre', suggestKeys).suggest).toBe(true);
    expect(projectCapabilities(project, 'other', suggestKeys).suggest).toBe(false);
  });

  it('gives the Admin no edit and no request of their own: they only decide', () => {
    const adminKeys = grant(PERMISSION.PROJECT_READ_ALL, PERMISSION.PROJECT_CHANGE_REVIEW);
    expect(projectCapabilities(project, 'admin', adminKeys)).toMatchObject({ suggest: false, manage: false, publish: false });
  });
});

describe('formatting', () => {
  it('formats durations as m:ss or h:mm:ss', () => {
    expect(formatDuration(750)).toBe('12:30');
    expect(formatDuration(3909)).toBe('1:05:09');
    expect(formatDuration(-90)).toBe('-1:30');
    expect(formatDuration(null)).toBe('—');
  });

  it('reads a due date as a calendar day whatever the time zone', () => {
    expect(formatDay('2026-10-15T00:00:00.000Z')).toBe(new Date(2026, 9, 15).toLocaleDateString('vi-VN'));
  });
});

describe('episode schedule', () => {
  const today = getTodayDateString();

  it('adds calendar days across month and year ends', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('spreads delivery deadlines a fixed number of days apart', () => {
    expect(spreadDeadlines('2026-11-01', 7, 3)).toEqual(['2026-11-01', '2026-11-08', '2026-11-15']);
  });

  it('needs a delivery deadline from today on and sends it with the episode', () => {
    expect(deadlineValid('')).toBe(false);
    expect(deadlineValid(addDays(today, -1))).toBe(false);
    expect(deadlineValid(today)).toBe(true);
    expect(toEpisodeInput({ title: ' Tập 1 ', minutes: 15, deadline: '2026-11-01', releaseDate: '' })).toEqual({
      title: 'Tập 1',
      targetDurationSeconds: 900,
      deliveryDeadline: '2026-11-01',
    });
    expect(toEpisodeInput({ title: 'Tập 2', minutes: 10, deadline: '2026-11-01', releaseDate: '2026-11-20' })).toMatchObject({
      expectedReleaseDate: '2026-11-20',
    });
  });

  it('keeps the expected release date in the season window and after the deadline (BR-60)', () => {
    const window = { start: '2026-11-10', end: '2026-11-30' };
    expect(releaseDateValid('', '2026-11-01', window)).toBe(true);
    expect(releaseDateValid('2026-11-20', '2026-11-01', window)).toBe(true);
    expect(releaseDateValid('2026-11-05', '2026-11-01', window)).toBe(false);
    expect(releaseDateValid('2026-12-01', '2026-11-01', window)).toBe(false);
    expect(releaseDateValid('2026-11-15', '2026-11-18', window)).toBe(false);
    expect(windowValid(window)).toBe(true);
    expect(windowValid({ start: '2026-12-01', end: '2026-11-01' })).toBe(false);
  });

  it('hands a studio only deadlines that are set and not past', () => {
    expect(deadlineUsable({ deliveryDeadline: `${today}T00:00:00.000Z` })).toBe(true);
    expect(deadlineUsable({ deliveryDeadline: `${addDays(today, -1)}T00:00:00.000Z` })).toBe(false);
    expect(deadlineUsable({ deliveryDeadline: null })).toBe(false);
  });
});
