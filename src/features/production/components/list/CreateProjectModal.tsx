'use client';

import { useState } from 'react';
import { Clapperboard, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import { useAction } from '../../hooks/useAction';
import { EpisodeRowsEditor, emptyEpisode, episodesValid, toEpisodeInput, type EpisodeDraft } from '../shared/EpisodeRowsEditor';
import { GenrePicker } from '../shared/GenrePicker';

const MIN_IDEA_LENGTH = 20;

interface SeasonDraft {
  title: string;
  episodes: EpisodeDraft[];
}

/** Step 1: the Reviewer opens a project with its idea, genres and season/episode structure (BR-12, BR-37). */
export function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (movieId: string) => void }) {
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [language, setLanguage] = useState('vi');
  const [seasons, setSeasons] = useState<SeasonDraft[]>([{ title: 'Mùa 1', episodes: [emptyEpisode(1), emptyEpisode(2)] }]);
  const { busy, run } = useAction();

  // Episodes are numbered across the whole movie (BR-03).
  const firstNumbers = seasons.map((_, i) => 1 + seasons.slice(0, i).reduce((n, s) => n + s.episodes.length, 0));
  const valid =
    title.trim() &&
    idea.trim().length >= MIN_IDEA_LENGTH &&
    genreIds.length > 0 &&
    seasons.every((s) => episodesValid(s.episodes));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const created = await run(
      () =>
        productionService.createProject({
          title: title.trim(),
          ideaDescription: idea.trim(),
          genreIds,
          defaultLanguage: language,
          seasons: seasons.map((s) => ({ title: s.title.trim() || undefined, episodes: s.episodes.map(toEpisodeInput) })),
        }),
      'Đã tạo dự án',
    );
    if (created) onCreated(created.id);
  };

  return (
    <Modal open onClose={onClose} title="Tạo dự án phim" subtitle="Bước 1 — ý tưởng và cấu trúc mùa/tập" icon={<Clapperboard className="w-4 h-4" />} maxWidth="max-w-2xl">
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
        <FormField label="Ngôn ngữ chính" className="max-w-40">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={fieldInputClass}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </FormField>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Mùa và tập (thời lượng do bạn đặt, không giới hạn)</legend>
          {seasons.map((season, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-white/10 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={season.title}
                  onChange={(e) => setSeasons(seasons.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)))}
                  aria-label={`Tên mùa ${i + 1}`}
                  placeholder={`Mùa ${i + 1}`}
                  className={`${fieldInputClass} py-1.5 font-semibold`}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={seasons.length <= 1}
                  onClick={() => setSeasons(seasons.filter((_, j) => j !== i))}
                  aria-label={`Bỏ mùa ${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <EpisodeRowsEditor
                episodes={season.episodes}
                firstNumber={firstNumbers[i]}
                onChange={(episodes) => setSeasons(seasons.map((s, j) => (j === i ? { ...s, episodes } : s)))}
              />
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setSeasons([...seasons, { title: `Mùa ${seasons.length + 1}`, episodes: [emptyEpisode(1)] }])}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm mùa
          </Button>
        </fieldset>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            Tạo dự án
          </Button>
        </div>
      </form>
    </Modal>
  );
}
