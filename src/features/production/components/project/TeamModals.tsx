'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { teamService } from '@/services/teamService';
import type { CreatorSeat } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { useProject } from './ProjectContext';

function CreatorSelect({ value, onChange, exclude }: { value: string; onChange: (id: string) => void; exclude: string[] }) {
  const directory = useResource('creator-directory', () => teamService.directory());
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required className={fieldInputClass} aria-label="Content Creator">
      <option value="" disabled>
        {directory.loading ? 'Đang tải…' : 'Chọn Creator'}
      </option>
      {directory.data
        ?.filter((c) => !exclude.includes(c.id))
        .map((c) => (
          <option key={c.id} value={c.id}>
            {c.fullName} ({c.email})
          </option>
        ))}
    </select>
  );
}

/** The Reviewer adds a Creator next to the lead. */
export function AddCreatorModal({ seats, onClose, onDone }: { seats: CreatorSeat[]; onClose: () => void; onDone: () => Promise<void> }) {
  const { project } = useProject();
  const [creatorId, setCreatorId] = useState('');
  const [note, setNote] = useState('');
  const { busy, run } = useAction();
  const taken = seats.filter((s) => s.isActive).map((s) => s.creatorId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => teamService.addCreator(project.id, creatorId, note.trim() || undefined), 'Đã thêm Creator')) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Thêm Content Creator" subtitle="Creator mới cùng làm dự án; giao tập riêng cho họ ở bảng Tập phim.">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Content Creator">
          <CreatorSelect value={creatorId} onChange={setCreatorId} exclude={taken} />
        </FormField>
        <FormField label="Ghi chú (không bắt buộc)">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className={fieldInputClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!creatorId || busy}>
            Thêm
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Creator 1 hands some of the episodes they hold to Creator 2 (BR-13). The lead can also hand over episodes nobody holds. */
export function DelegateModal({
  mine,
  onClose,
  onDone,
}: {
  mine: CreatorSeat;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const { project } = useProject();
  const lead = project.creatorId === mine.creatorId;
  const held = new Set(mine.episodes.map((e) => e.id));
  const choices = project.seasons
    .flatMap((s) => s.episodes)
    .filter((e) => held.has(e.id) || (lead && !e.assignedCreatorId));
  const [picked, setPicked] = useState<string[]>([]);
  const [toCreatorId, setToCreatorId] = useState('');
  const [note, setNote] = useState('');
  const { busy, run } = useAction();

  const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = { toCreatorId, episodeIds: picked, ...(note.trim() ? { note: note.trim() } : {}) };
    if (await run(() => teamService.delegate(project.id, input), 'Đã uỷ quyền các tập')) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Uỷ quyền tập cho Creator khác" subtitle="Creator nhận tập sẽ vào nhóm của dự án; lịch sử uỷ quyền được lưu lại.">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Creator nhận">
          <CreatorSelect value={toCreatorId} onChange={setToCreatorId} exclude={[mine.creatorId]} />
        </FormField>
        <fieldset>
          <legend className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Tập uỷ quyền</legend>
          {choices.length === 0 ? (
            <p className="text-xs text-slate-500">Bạn chưa phụ trách tập nào.</p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-y-auto text-xs">
              {choices.map((episode) => (
                <li key={episode.id}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={picked.includes(episode.id)} onChange={() => toggle(episode.id)} />
                    Tập {episode.episodeNumber} — {episode.title}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
        <FormField label="Lý do / ghi chú (không bắt buộc)">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className={fieldInputClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!toCreatorId || picked.length === 0 || busy}>
            Uỷ quyền
          </Button>
        </div>
      </form>
    </Modal>
  );
}
