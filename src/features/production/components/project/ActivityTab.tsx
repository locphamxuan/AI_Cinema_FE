'use client';

import { productionService } from '@/services/productionService';
import type { ProjectEvent } from '@/types/production';
import { useResource } from '../../hooks/useResource';
import { EVENT_LABEL } from '../../lib/labels';
import { formatDateTime } from '../../lib/format';
import { Empty, ErrorNote, Loading, Panel } from '../shared/ui';
import { useProject } from './ProjectContext';

/** What happened in the project, newest first (audit log, §4.1.6). */
export function ActivityTab() {
  const { project } = useProject();
  const events = useResource(`events:${project.id}:${project.updatedAt}`, () => productionService.listEvents(project.id));

  return (
    <Panel title="Lịch sử dự án">
      {events.error && <ErrorNote message={events.error} onRetry={events.reload} />}
      {events.loading && !events.data && <Loading />}
      {events.data?.length === 0 && <Empty>Chưa có sự kiện nào.</Empty>}
      <ol className="relative border-l border-slate-200 dark:border-white/10 ml-2 space-y-4">
        {events.data?.map((ev) => (
          <li key={ev.id} className="ml-4 text-xs">
            <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white dark:border-[#151822]" />
            <p className="font-semibold text-slate-800 dark:text-slate-100">{EVENT_LABEL[ev.action] ?? ev.action}</p>
            <p className="text-slate-500 dark:text-slate-400">
              {actorName(ev)} · {formatDateTime(ev.createdAt)}
            </p>
            {typeof ev.payload?.reason === 'string' && <p className="text-slate-600 dark:text-slate-300 mt-0.5">{ev.payload.reason}</p>}
            {typeof ev.payload?.comments === 'string' && <p className="text-slate-600 dark:text-slate-300 mt-0.5">{ev.payload.comments}</p>}
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/** A user, the outside studio (through its portal link) or the system itself. */
function actorName(ev: ProjectEvent): string {
  if (ev.actor) return ev.actor.fullName;
  if (ev.actorType === 'STUDIO') return typeof ev.payload?.studioName === 'string' ? `Studio ${ev.payload.studioName}` : 'Studio';
  return 'Hệ thống';
}
