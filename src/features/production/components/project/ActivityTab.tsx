'use client';

import { productionService } from '@/services/productionService';
import type { ProjectEvent } from '@/types/production';
import { useResource } from '../../hooks/useResource';
import { EVENT_LABEL } from '../../lib/labels';
import { formatDateTime } from '../../lib/format';
import { Empty, ErrorNote, Loading } from '../shared/ui';
import { useProject } from './ProjectContext';
import {
  Film,
  UserPlus,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Coins,
  Building2,
  Clock,
  History,
  type LucideIcon,
} from 'lucide-react';

/** What happened in the project, newest first (audit log, §4.1.6). */
export function ActivityTab() {
  const { project } = useProject();
  const events = useResource(`events:${project.id}:${project.updatedAt}`, () => productionService.listEvents(project.id));

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
          <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lịch sử dự án</h2>
        {events.data && (
          <span className="ml-auto text-[11px] text-slate-400 font-medium">{events.data.length} sự kiện</span>
        )}
      </div>
      <div className="p-5">
        {events.error && <ErrorNote message={events.error} onRetry={events.reload} />}
        {events.loading && !events.data && <Loading />}
        {events.data?.length === 0 && <Empty>Chưa có sự kiện nào.</Empty>}
        {events.data && events.data.length > 0 && (
          <ol className="relative space-y-0">
            {events.data.map((ev, idx) => {
              const { icon: Icon, color, bg } = getEventStyle(ev.action);
              const isLast = idx === events.data!.length - 1;
              return (
                <li key={ev.id} className="relative flex gap-4 pb-5">
                  {!isLast && (
                    <div className="absolute left-4 top-9 bottom-0 w-px bg-slate-100 dark:bg-white/5" />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-full ${bg} border-2 border-white dark:border-[#141720] flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      {EVENT_LABEL[ev.action] ?? ev.action}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-500 dark:text-slate-400">{actorName(ev)}</span>
                      {' · '}{formatDateTime(ev.createdAt)}
                    </p>
                    {typeof ev.payload?.reason === 'string' && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.04] rounded-xl px-3 py-2 border border-slate-100 dark:border-white/5">
                        {ev.payload.reason}
                      </p>
                    )}
                    {typeof ev.payload?.comments === 'string' && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.04] rounded-xl px-3 py-2 border border-slate-100 dark:border-white/5">
                        {ev.payload.comments}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

function getEventStyle(action: string): { icon: LucideIcon; color: string; bg: string } {
  if (action.includes('CREATED')) return { icon: Film, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/20' };
  if (action.includes('ASSIGNED') || action.includes('CREATOR')) return { icon: UserPlus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/20' };
  if (action.includes('HANDOFF') || action.includes('STUDIO')) return { icon: Building2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/20' };
  if (action.includes('APPROVED') || action.includes('COMPLETED') || action.includes('PUBLISHED')) return { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/20' };
  if (action.includes('CANCEL') || action.includes('REJECTED') || action.includes('DECLINED')) return { icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/20' };
  if (action.includes('REVISION') || action.includes('CHANGE')) return { icon: RefreshCw, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/20' };
  if (action.includes('FEE') || action.includes('TOKEN')) return { icon: Coins, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/20' };
  if (action.includes('BRIEF') || action.includes('FILE')) return { icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/20' };
  if (action.includes('SUBMITTED') || action.includes('SENT')) return { icon: Send, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/20' };
  return { icon: Clock, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-white/10' };
}

/** A user, the outside studio (through its portal link) or the system itself. */
function actorName(ev: ProjectEvent): string {
  if (ev.actor) return ev.actor.fullName;
  if (ev.actorType === 'STUDIO') return typeof ev.payload?.studioName === 'string' ? `Studio ${ev.payload.studioName}` : 'Studio';
  return 'Hệ thống';
}
