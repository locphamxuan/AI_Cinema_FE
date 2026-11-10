'use client';

import { useState } from 'react';
import { Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { productionService } from '@/services/productionService';
import { studioService } from '@/services/studioService';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { GenrePicker } from '../shared/GenrePicker';
import { emptyProjectInfo, ProjectInfoFields, releaseYearValid, type ProjectInfoDraft } from '../shared/ProjectInfoFields';

const MIN_IDEA_LENGTH = 20;

/** Who works on the project: the Reviewer in charge (required), the lead Creator and the studio (optional). */
interface PeopleDraft {
  reviewerId: string;
  creatorId: string;
  studioId: string;
}

function PeopleFields({ value, onChange }: { value: PeopleDraft; onChange: (next: PeopleDraft) => void }) {
  const reviewers = useResource('people:reviewers', () => productionService.listReviewers());
  const creators = useResource('people:creators', () => productionService.listCreators());
  const studios = useResource('studios:active', () => studioService.list(true));
  const patch = (changes: Partial<PeopleDraft>) => onChange({ ...value, ...changes });
  const loading = (list: { loading: boolean; data: unknown[] | null }) => list.loading && !list.data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <FormField label="Reviewer phụ trách">
        <select value={value.reviewerId} onChange={(e) => patch({ reviewerId: e.target.value })} required className={fieldInputClass}>
          <option value="">{loading(reviewers) ? 'Đang tải…' : 'Chọn Reviewer'}</option>
          {reviewers.data?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fullName}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Creator chính">
        <select value={value.creatorId} onChange={(e) => patch({ creatorId: e.target.value })} className={fieldInputClass}>
          <option value="">{loading(creators) ? 'Đang tải…' : 'Giao sau'}</option>
          {creators.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Studio (tuỳ chọn)">
        <select value={value.studioId} onChange={(e) => patch({ studioId: e.target.value })} className={fieldInputClass}>
          <option value="">{loading(studios) ? 'Đang tải…' : 'Chọn khi duyệt Kịch bản Final'}</option>
          {studios.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </FormField>
    </div>
  );
}

/**
 * MF-1 step 1 (07/11/2026): the Admin opens a project with its idea and genres, puts a Reviewer in charge and
 * assigns the lead Creator (optionally the studio). The Reviewer adds seasons and episodes afterwards.
 */
export function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (movieId: string) => void }) {
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [language, setLanguage] = useState('vi');
  const [info, setInfo] = useState<ProjectInfoDraft>(emptyProjectInfo);
  const [people, setPeople] = useState<PeopleDraft>({ reviewerId: '', creatorId: '', studioId: '' });
  const { busy, run } = useAction();

  const validationIssues = [
    !title.trim() ? 'nhập tên phim' : null,
    idea.trim().length < MIN_IDEA_LENGTH ? `mô tả ý tưởng có ít nhất ${MIN_IDEA_LENGTH} ký tự` : null,
    genreIds.length === 0 ? 'chọn ít nhất một thể loại' : null,
    !people.reviewerId ? 'chọn Reviewer phụ trách' : null,
    !releaseYearValid(info.releaseYear) ? 'năm phát hành từ 2000 đến 2100' : null,
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
            reviewerId: people.reviewerId,
            ...(people.creatorId ? { creatorId: people.creatorId } : {}),
            ...(people.studioId ? { studioId: people.studioId } : {}),
            ...(info.synopsis.trim() ? { synopsis: info.synopsis.trim() } : {}),
            ...(info.ageRating ? { ageRating: info.ageRating } : {}),
            ...(info.releaseYear ? { releaseYear: Number(info.releaseYear) } : {}),
          }),
        people.creatorId ? 'Đã tạo dự án và giao cho Creator' : 'Đã tạo dự án',
      );
      if (created) onCreated(created.id);
    } catch {
      toast.error('Không tạo được dự án', 'Không kết nối được tới máy chủ. Vui lòng kiểm tra kết nối rồi thử lại.');
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Tạo dự án phim"
      subtitle="Bước 1 - ý tưởng, thể loại, Reviewer phụ trách và Creator chính; Reviewer lên mùa/tập sau"
      icon={<Clapperboard className="w-4 h-4" />}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Tên phim">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label={`Ý tưởng phim (tối thiểu ${MIN_IDEA_LENGTH} ký tự)`}>
          <textarea rows={5} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={20000} required className={fieldTextareaClass} />
        </FormField>
        <div>
          <span className="block text-slate-600 dark:text-slate-300 mb-1 text-xs font-medium">Thể loại (1–5)</span>
          <GenrePicker value={genreIds} onChange={setGenreIds} />
        </div>
        <PeopleFields value={people} onChange={setPeople} />
        <ProjectInfoFields value={info} onChange={setInfo} />
        <FormField label="Ngôn ngữ chính" className="sm:w-1/2">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={fieldInputClass}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </FormField>
        <p className="text-[11px] text-slate-500">
          Creator chính trao đổi ý tưởng với Admin ở mục “Trao đổi ý tưởng” rồi viết kịch bản; Reviewer lên mùa, tập và hạn giao trước khi
          Admin duyệt Kịch bản Final.
        </p>

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
