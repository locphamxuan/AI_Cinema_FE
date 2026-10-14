'use client';

import { useState } from 'react';
import { Clapperboard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { productionService } from '@/services/productionService';
import { studioService } from '@/services/studioService';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { emptyEpisode } from '../shared/EpisodeRowsEditor';
import { GenrePicker } from '../shared/GenrePicker';
import { emptySeason, seasonValid, toSeasonInput, SeasonDraftEditor, type SeasonDraft } from '../shared/SeasonDraftEditor';

const MIN_IDEA_LENGTH = 20;

/** Step 1: the Reviewer opens a project with its idea, genres, studio and season/episode structure (BR-12, BR-37, BR-59). */
export function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (movieId: string) => void }) {
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [language, setLanguage] = useState('vi');
  const [studioId, setStudioId] = useState('');
  const [seasons, setSeasons] = useState<SeasonDraft[]>([{ ...emptySeason(1), episodes: [emptyEpisode(1), emptyEpisode(2)] }]);
  const studios = useResource('studios:active', () => studioService.list(true));
  const { busy, run } = useAction();

  // Episodes are numbered across the whole movie (BR-03).
  const firstNumbers = seasons.map((_, i) => 1 + seasons.slice(0, i).reduce((n, s) => n + s.episodes.length, 0));
  const validationIssues = [
    !title.trim() ? 'nhập tên phim' : null,
    idea.trim().length < MIN_IDEA_LENGTH ? `mô tả ý tưởng có ít nhất ${MIN_IDEA_LENGTH} ký tự` : null,
    genreIds.length === 0 ? 'chọn ít nhất một thể loại' : null,
    seasons.some((s) => !seasonValid(s))
      ? 'mỗi mùa cần đơn giá tập (Token), khoảng phát hành hợp lệ và mọi tập có tiêu đề, thời lượng 1–720 phút, hạn giao không ở quá khứ'
      : null,
  ].filter((issue): issue is string => issue !== null);
  const valid = validationIssues.length === 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      const created = await run(
        () =>
          productionService.createProject({
            title: title.trim(),
            ideaDescription: idea.trim(),
            genreIds,
            defaultLanguage: language,
            ...(studioId ? { studioId } : {}),
            seasons: seasons.map(toSeasonInput),
          }),
        'Đã tạo dự án',
      );
      if (created) onCreated(created.id);
    } catch {
      toast.error('Không tạo được dự án', 'Không kết nối được tới máy chủ. Vui lòng kiểm tra kết nối rồi thử lại.');
    }
  };

  return (
    <Modal open onClose={onClose} title="Tạo dự án phim" subtitle="Bước 1 — ý tưởng, Studio và cấu trúc mùa/tập" icon={<Clapperboard className="w-4 h-4" />} maxWidth="max-w-3xl">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Tên phim">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label={`Ý tưởng / mô tả cho studio (tối thiểu ${MIN_IDEA_LENGTH} ký tự)`}>
          <textarea rows={5} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={20000} required className={fieldTextareaClass} />
        </FormField>
        <div>
          <span className="block text-slate-600 dark:text-slate-300 mb-1 text-xs font-medium">Thể loại (1–5)</span>
          <GenrePicker value={genreIds} onChange={setGenreIds} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Ngôn ngữ chính">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={fieldInputClass}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </FormField>
          <FormField label="Studio đối tác (đặt hàng sản xuất)">
            <select value={studioId} onChange={(e) => setStudioId(e.target.value)} className={fieldInputClass} aria-label="Studio đối tác">
              <option value="">{studios.loading ? 'Đang tải…' : 'Chọn sau'}</option>
              {studios.data?.map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Mùa và tập — đơn giá, khoảng phát hành, thời lượng, hạn giao và ngày dự kiến phát hành</legend>
          <p className="text-[11px] text-slate-500">
            Hạn giao là ngày Studio phải giao tập; ngày dự kiến phát hành nằm trong khoảng phát hành của mùa và không trước hạn giao.
          </p>
          {seasons.map((season, i) => (
            <SeasonDraftEditor
              key={i}
              season={season}
              number={i + 1}
              firstNumber={firstNumbers[i]}
              onChange={(next) => setSeasons(seasons.map((s, j) => (j === i ? next : s)))}
              onRemove={seasons.length > 1 ? () => setSeasons(seasons.filter((_, j) => j !== i)) : undefined}
            />
          ))}
          <Button type="button" size="sm" variant="secondary" onClick={() => setSeasons([...seasons, emptySeason(seasons.length + 1, firstNumbers[seasons.length - 1] + seasons[seasons.length - 1].episodes.length)])}>
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm mùa
          </Button>
        </fieldset>

        <div className="space-y-2 pt-2">
          {validationIssues.length > 0 && (
            <p role="status" className="text-xs text-amber-600 dark:text-amber-400">
              Cần hoàn tất: {validationIssues.join('; ')}.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" disabled={!valid || busy}>
              Tạo dự án
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
