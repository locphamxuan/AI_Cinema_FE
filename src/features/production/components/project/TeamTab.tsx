'use client';

import { useState } from 'react';
import { ArrowRightLeft, UserMinus, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { teamService } from '@/services/teamService';
import type { CreatorSeat } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { TEAM_EDITABLE_PROJECT, isIn } from '../../lib/capabilities';
import { formatDateTime } from '../../lib/format';
import { Empty, ErrorNote, Loading, Panel } from '../shared/ui';
import { AddCreatorModal, DelegateModal } from './TeamModals';
import { useProject } from './ProjectContext';

/** Creators of the project: who holds a seat, who put them there, who delegated to whom and which episodes they hold (BR-13). */
export function TeamTab() {
  const { project, caps, reload } = useProject();
  const userId = useAppStore((s) => s.user?.id);
  const [adding, setAdding] = useState(false);
  const [delegating, setDelegating] = useState(false);
  const team = useResource(`team:${project.id}:${project.updatedAt}`, () => teamService.listCreators(project.id));
  const { busy, run } = useAction();
  const editable = isIn(project.status, TEAM_EDITABLE_PROJECT);

  const remove = async (seat: CreatorSeat) => {
    if (await run(() => teamService.removeCreator(project.id, seat.creatorId), `Đã gỡ ${seat.creator.fullName}`)) {
      await Promise.all([team.reload(), reload()]);
    }
  };

  const mySeat = team.data?.find((seat) => seat.creatorId === userId && seat.isActive);
  const seats = team.data ?? [];

  return (
    <Panel
      title="Phân công Content Creator"
      description="Một dự án có thể có nhiều Creator. Reviewer thêm Creator và giao từng tập; Creator có thể uỷ quyền các tập của mình cho Creator khác."
      actions={
        <>
          {caps.manage && editable && project.creator && (
            <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm Creator
            </Button>
          )}
          {caps.delegate && editable && mySeat && (
            <Button size="sm" variant="secondary" onClick={() => setDelegating(true)}>
              <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" /> Uỷ quyền tập
            </Button>
          )}
        </>
      }
    >
      {team.error && <ErrorNote message={team.error} onRetry={team.reload} />}
      {team.loading && !team.data && <Loading />}
      {!team.loading && seats.length === 0 && <Empty>Chưa giao Content Creator cho dự án.</Empty>}
      {seats.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Creator</th>
                <th className="px-3 py-2 font-medium">Người giao</th>
                <th className="px-3 py-2 font-medium">Giao từ ai</th>
                <th className="px-3 py-2 font-medium">Tập đang phụ trách</th>
                <th className="px-3 py-2 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {seats.map((seat) => (
                <tr key={seat.id} className={seat.isActive ? '' : 'opacity-60'}>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {seat.creator.fullName}{' '}
                      {seat.isLead && <Badge tone="purple">Creator chính</Badge>}
                      {!seat.isActive && <Badge tone="neutral">Đã gỡ</Badge>}
                    </p>
                    <p className="text-slate-500">{seat.creator.email}</p>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                    {seat.assignedBy.fullName}
                    <p className="text-slate-400">{formatDateTime(seat.assignedAt)}</p>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{seat.delegatedFrom?.fullName ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                    {seat.episodes.length ? seat.episodes.map((e) => `Tập ${e.episodeNumber}`).join(', ') : seat.isActive ? 'Cả nhóm (chưa giao riêng)' : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {caps.manage && editable && seat.isActive && !seat.isLead && (
                      <Button size="sm" variant="ghost" disabled={busy} onClick={() => remove(seat)} aria-label={`Gỡ ${seat.creator.fullName}`}>
                        <UserMinus className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {adding && (
        <AddCreatorModal
          seats={seats}
          onClose={() => setAdding(false)}
          onDone={async () => {
            await Promise.all([team.reload(), reload()]);
          }}
        />
      )}
      {delegating && mySeat && (
        <DelegateModal
          mine={mySeat}
          onClose={() => setDelegating(false)}
          onDone={async () => {
            await Promise.all([team.reload(), reload()]);
          }}
        />
      )}
    </Panel>
  );
}
