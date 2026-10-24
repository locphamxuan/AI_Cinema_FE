'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import { teamService } from '@/services/teamService';
import type { AgeRating, Person } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { GenrePicker } from '../shared/GenrePicker';
import { useProject } from './ProjectContext';

/** The Reviewer edits what viewers and the studio read about the film. */
export function EditProjectModal({ onClose }: { onClose: () => void }) {
  const { project, reload } = useProject();
  const [title, setTitle] = useState(project.title);
  const [idea, setIdea] = useState(project.ideaDescription);
  const [synopsis, setSynopsis] = useState(project.synopsis ?? '');
  const [genreIds, setGenreIds] = useState(project.genres.map((g) => g.id));
  const [ageRating, setAgeRating] = useState<AgeRating | ''>(project.ageRating ?? '');
  const [releaseYear, setReleaseYear] = useState(project.releaseYear ? String(project.releaseYear) : '');
  const [freeEpisodes, setFreeEpisodes] = useState<string>(
    project.freeEpisodeCount === null || project.freeEpisodeCount === undefined ? '' : String(project.freeEpisodeCount),
  );
  const { busy, run } = useAction();
  const freeValid = freeEpisodes === '' || (Number.isInteger(Number(freeEpisodes)) && Number(freeEpisodes) >= 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () =>
        productionService.updateProject(project.id, {
          title: title.trim(),
          ideaDescription: idea.trim(),
          genreIds,
          ...(synopsis.trim() ? { synopsis: synopsis.trim() } : {}),
          ...(ageRating ? { ageRating } : {}),
          ...(releaseYear ? { releaseYear: Number(releaseYear) } : {}),
          freeEpisodeCount: freeEpisodes === '' ? null : Number(freeEpisodes),
        }),
      'Đã lưu thông tin phim',
    );
    if (done) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Sửa thông tin phim" maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Tên phim">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label="Ý tưởng gửi studio (tối thiểu 20 ký tự)">
          <textarea rows={5} value={idea} onChange={(e) => setIdea(e.target.value)} minLength={20} maxLength={20000} className={fieldTextareaClass} />
        </FormField>
        <FormField label="Tóm tắt cho người xem">
          <textarea rows={3} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} maxLength={5000} className={fieldTextareaClass} />
        </FormField>
        <div>
          <span className="block text-slate-600 dark:text-slate-300 mb-1 text-xs font-medium">Thể loại</span>
          <GenrePicker value={genreIds} onChange={setGenreIds} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Độ tuổi">
            <select value={ageRating} onChange={(e) => setAgeRating(e.target.value as AgeRating | '')} className={fieldInputClass}>
              <option value="">Chưa đặt</option>
              <option value="T16">T16</option>
              <option value="T18">T18</option>
            </select>
          </FormField>
          <FormField label="Năm phát hành">
            <input type="number" min={2000} max={2100} value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} className={fieldInputClass} />
          </FormField>
        </div>
        <FormField label="Số tập xem miễn phí">
          <input
            type="number"
            min={0}
            max={1000}
            value={freeEpisodes}
            onChange={(e) => setFreeEpisodes(e.target.value)}
            placeholder="Để trống = theo mặc định nền tảng"
            aria-label="Số tập xem miễn phí"
            className={fieldInputClass}
          />
          <span className="block mt-1 text-[11px] text-slate-500">
            Tính theo số thứ tự tập trong cả phim. Phim 1 tập trọn bộ: nhập 0 để thu Coin, 1 để cho xem miễn phí.
          </span>
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={busy || !freeValid || !title.trim() || idea.trim().length < 20 || genreIds.length === 0}>
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** The Reviewer gives the project to its main Content Creator, or changes them. */
export function AssignCreatorModal({ current, onClose }: { current: Person | null; onClose: () => void }) {
  const { project, reload } = useProject();
  const creators = useResource('creator-directory', () => teamService.directory());
  const [creatorId, setCreatorId] = useState(current?.id ?? '');
  const { busy, run } = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => productionService.assignCreator(project.id, creatorId), 'Đã giao Content Creator')) {
      await reload();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title="Giao Content Creator" subtitle="Creator sẽ bàn giao dự án cho studio và giao các tập.">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Content Creator">
          <select value={creatorId} onChange={(e) => setCreatorId(e.target.value)} required className={fieldInputClass}>
            <option value="" disabled>
              {creators.loading ? 'Đang tải…' : 'Chọn Creator'}
            </option>
            {creators.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.email})
              </option>
            ))}
          </select>
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={!creatorId || creatorId === current?.id || busy}>Giao</Button>
        </div>
      </form>
    </Modal>
  );
}
