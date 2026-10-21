'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { studioService } from '@/services/studioService';
import type { StudioHandoff } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { MILESTONE_STATUS } from '../../lib/labels';
import { nextMilestones, submissionsOf, type CreatorMilestone } from '../../lib/milestones';
import { useProject } from './ProjectContext';

/** The Creator moves the studio's milestone; DELIVERED needs the Submission uploaded from the studio's delivery (BR-58). */
export function MilestoneModal({ handoff, onClose }: { handoff: StudioHandoff; onClose: () => void }) {
  const { project, reload } = useProject();
  const options = nextMilestones(handoff.milestoneStatus);
  const [status, setStatus] = useState<CreatorMilestone>(options[0]);
  const [note, setNote] = useState('');
  const [mediaAssetId, setMediaAssetId] = useState('');
  const { busy, run } = useAction();
  const submissions = submissionsOf(handoff, project.seasons);
  const needsSubmission = status === 'DELIVERED';
  const needsNote = status === 'STUDIO_DECLINED';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        studioService.updateMilestone(project.id, handoff.id, {
          status,
          ...(note.trim() ? { note: note.trim() } : {}),
          ...(needsSubmission ? { mediaAssetId } : {}),
        }),
      'Đã cập nhật mốc Studio',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Cập nhật mốc Studio" subtitle={`${handoff.studio.name} · hiện ở “${MILESTONE_STATUS[handoff.milestoneStatus].label}”`}>
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Chuyển sang mốc">
          <select value={status} onChange={(e) => setStatus(e.target.value as CreatorMilestone)} className={fieldInputClass} aria-label="Mốc mới">
            {options.map((option) => (
              <option key={option} value={option}>
                {MILESTONE_STATUS[option].label}
              </option>
            ))}
          </select>
        </FormField>
        {needsSubmission && (
          <FormField label="Submission Studio vừa giao">
            <select value={mediaAssetId} onChange={(e) => setMediaAssetId(e.target.value)} required className={fieldInputClass} aria-label="Submission">
              <option value="" disabled>
                {submissions.length ? 'Chọn bản đã tải lên' : 'Chưa có bản nào'}
              </option>
              {submissions.map(({ episode, media }) => (
                <option key={media.id} value={media.id}>
                  Tập {episode.episodeNumber} - {episode.title} · v{media.version}
                </option>
              ))}
            </select>
          </FormField>
        )}
        {needsSubmission && submissions.length === 0 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">Tải bản Studio giao lên ở trang từng tập (mục “Giao bản dựng”): mốc tự chuyển sang “Studio đã giao” khi bản giao xử lý xong.</p>
        )}
        <FormField label={needsNote ? 'Lý do Studio từ chối' : 'Ghi chú (không bắt buộc)'}>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} required={needsNote} className={fieldTextareaClass} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || (needsSubmission && !mediaAssetId) || (needsNote && !note.trim())}>
            Cập nhật
          </Button>
        </div>
      </form>
    </Modal>
  );
}
