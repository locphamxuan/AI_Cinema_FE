import { describe, expect, it } from 'vitest';
import { activeNavHref, NAVIGATION } from '@/components/shell/navigation';

describe('activeNavHref', () => {
  it('lights the area overview only on its own path', () => {
    expect(activeNavHref(NAVIGATION.admin, '/admin')).toBe('/admin');
    expect(activeNavHref(NAVIGATION.admin, '/admin/unknown')).toBeNull();
  });

  it('prefers the most specific entry, and the one whose query matches', () => {
    expect(activeNavHref(NAVIGATION.admin, '/admin/support/ai/articles')).toBe('/admin/support/ai');
    expect(activeNavHref(NAVIGATION.admin, '/admin/projects/p1')).toBe('/admin/projects');
    expect(activeNavHref(NAVIGATION.reviewer, '/reviewer/projects', 'filter=approved')).toBe('/reviewer/projects?filter=approved');
    expect(activeNavHref(NAVIGATION.reviewer, '/reviewer/projects')).toBe('/reviewer/projects');
  });

  it('gives Staff its support desk and the read-only lookup as two pages', () => {
    expect(activeNavHref(NAVIGATION.staff, '/staff/lookup')).toBe('/staff/lookup');
    expect(activeNavHref(NAVIGATION.staff, '/staff')).toBe('/staff');
  });
});
