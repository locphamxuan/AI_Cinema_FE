import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { ProjectProvider } from '@/features/production/components/project/ProjectContext';
import { projectCapabilities } from '@/features/production/lib/capabilities';
import { useAppStore } from '@/store/useAppStore';
import type { ProjectDetail } from '@/types/production';

const person = (id: string, fullName: string) => ({ id, fullName, email: `${id}@x.vn` });

export const STUDIO = {
  id: 'st1',
  name: 'Lumen Studio',
  email: 'lumen@x.vn',
  contactName: null,
  phone: null,
  note: null,
  isActive: true,
  createdAt: '2026-11-01T00:00:00.000Z',
};

/** An ASSIGNED project with one episode that has its delivery deadline, which a tab reads from its context. */
export function assignedProject(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    id: 'm1',
    title: 'Mưa Sài Gòn',
    status: 'ASSIGNED',
    reviewerId: 'reviewer-id',
    creatorId: 'creator-id',
    reviewer: person('reviewer-id', 'Reviewer Một'),
    creator: person('creator-id', 'Creator Một'),
    studio: STUDIO,
    updatedAt: '2026-11-01T00:00:00.000Z',
    cost: { budgetVnd: 200_000_000, committedVnd: 0, remainingVnd: 200_000_000 },
    seasons: [{ id: 's1', episodes: [{ id: 'e1', episodeNumber: 1, title: 'Tập đầu', deliveryDeadline: '2027-01-01T00:00:00.000Z' }] }],
    ...overrides,
  } as ProjectDetail;
}

/** Renders a project tab the way ProjectDetailPage does, with the capabilities of the signed-in account. */
export function withProject(project: ProjectDetail, children: ReactNode, reload = vi.fn(async () => undefined)) {
  const user = useAppStore.getState().user;
  const caps = projectCapabilities(project, user?.id, (key) => !!user?.permissions?.includes(key));
  return <ProjectProvider value={{ project, caps, base: '/admin', reload }}>{children}</ProjectProvider>;
}
