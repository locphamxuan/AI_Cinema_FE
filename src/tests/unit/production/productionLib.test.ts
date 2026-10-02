import { describe, expect, it } from 'vitest';
import { notificationHref, productionBaseFor, productionPaths } from '@/features/production/lib/routes';
import { projectCapabilities } from '@/features/production/lib/capabilities';
import { addDays, formatDay, formatDuration } from '@/features/production/lib/format';
import { milestoneValid, spreadMilestones, toEpisodeInput } from '@/features/production/components/shared/EpisodeRowsEditor';
import { dueDateFits } from '@/features/production/components/project/DueDateRows';
import { getTodayDateString } from '@/lib/dateUtils';
import { PERMISSION, type PermissionKey } from '@/lib/permissions';

const grant = (...keys: PermissionKey[]) => (p: PermissionKey) => keys.includes(p);

describe('production routes', () => {
  it('sends Creators to /creator and everyone else to /reviewer', () => {
    expect(productionBaseFor('creator')).toBe('/creator');
    expect(productionBaseFor('reviewer')).toBe('/reviewer');
    expect(productionBaseFor('admin')).toBe('/reviewer');
    expect(productionPaths.project('/creator', 'm1', 'studio')).toBe('/creator/projects/m1?tab=studio');
  });

  it.each([
    ['/projects/m1/episodes/e1', 'creator', '/creator/projects/m1/episodes/e1'],
    ['/projects/m1/episodes/e1', 'reviewer', '/reviewer/projects/m1/episodes/e1'],
    ['/projects/m1/change-requests', 'reviewer', '/reviewer/projects/m1?tab=changes'],
    ['/projects/m1/studio', 'creator', '/creator/projects/m1?tab=studio'],
    ['/projects/m1', 'admin', '/reviewer/projects/m1'],
    ['/admin/price-alerts', 'admin', '/admin?tab=price-alerts'],
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

  it('lets only the assigned Creator hand off and deliver', () => {
    const creatorKeys = grant(PERMISSION.STUDIO_HANDOFF, PERMISSION.MEDIA_INGEST);
    expect(projectCapabilities(project, 'cre', creatorKeys)).toMatchObject({ creator: true, handoff: true, ingest: true, manage: false });
    expect(projectCapabilities(project, 'someone', creatorKeys)).toMatchObject({ handoff: false, ingest: false });
  });

  it('gives the Admin proposals but no edits (BR-55)', () => {
    const adminKeys = grant(PERMISSION.PROJECT_READ_ALL, PERMISSION.PROJECT_SUGGEST);
    expect(projectCapabilities(project, 'admin', adminKeys)).toMatchObject({ suggest: true, manage: false, publish: false });
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

describe('episode milestones', () => {
  const today = getTodayDateString();

  it('adds calendar days across month and year ends', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('spreads milestones a fixed number of days apart', () => {
    expect(spreadMilestones('2026-11-01', 7, 3)).toEqual(['2026-11-01', '2026-11-08', '2026-11-15']);
  });

  it('needs a milestone from today on and sends it with the episode', () => {
    expect(milestoneValid('')).toBe(false);
    expect(milestoneValid(addDays(today, -1))).toBe(false);
    expect(milestoneValid(today)).toBe(true);
    expect(toEpisodeInput({ title: ' Tập 1 ', minutes: 15, milestone: '2026-11-01' })).toEqual({
      title: 'Tập 1',
      targetDurationSeconds: 900,
      milestoneDate: '2026-11-01',
    });
  });

  it('keeps a studio due date between today and the milestone', () => {
    const milestoneDate = `${addDays(today, 10)}T00:00:00.000Z`;
    expect(dueDateFits(addDays(today, 10), { milestoneDate })).toBe(true);
    expect(dueDateFits(addDays(today, 11), { milestoneDate })).toBe(false);
    expect(dueDateFits(addDays(today, -1), { milestoneDate })).toBe(false);
    expect(dueDateFits(addDays(today, 400), { milestoneDate: null })).toBe(true);
  });
});
