import { useEffect, useState } from 'react';
import { Calendar, Film, Coins, UserCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import type { ProjectMilestone } from '@/types/workflow';
import type { ApiGenre, ApiUser } from '@/types/workflow-api';
import { workflowService } from '@/services/workflowService';
import { toast } from '@/components/ui/Toast';
import { GenrePicker } from './GenrePicker';
import { SeasonEpisodesEditor } from './SeasonEpisodesEditor';
import { SubtitleLanguagePicker } from './SubtitleLanguagePicker';
import { MilestonesEditor } from './MilestonesEditor';

export interface CreateProjectFormState {
  title: string;
  /** User id of the assigned Content Creator. */
  assignedCreator: string;
  /** Genre ids. */
  genre: string[];
  synopsis: string;
  /** One list per season, holding each episode's target duration in minutes; seasons may differ in size. */
  seasons: number[][];
  /** BCP-47 codes of the subtitle languages; the first is the source language. */
  subtitleLanguages: string[];
  budgetTokens: number;
  productionStartDate: string;
  deadline: string;
  releaseDate: string;
  milestones: ProjectMilestone[];
}

export interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: CreateProjectFormState;
  /** Longest episode the Admin allows; null means no limit. */
  maxEpisodeMinutes: number | null;
  onChange: <K extends keyof CreateProjectFormState>(field: K, value: CreateProjectFormState[K]) => void;
}

const QUICK_TOKEN_OPTIONS = [1500, 3000, 5000, 8000];
const LABEL = 'mb-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5';
const DATE_FIELDS = [
  { field: 'productionStartDate', label: 'Bắt đầu sản xuất', accent: 'text-purple-600 dark:text-purple-400' },
  { field: 'deadline', label: 'Kết thúc sản xuất', accent: 'text-purple-600 dark:text-purple-400' },
  { field: 'releaseDate', label: 'Công chiếu dự kiến', accent: 'text-emerald-500' },
] as const;

export function CreateProjectModal({ open, onClose, onSubmit, form, maxEpisodeMinutes, onChange }: CreateProjectModalProps) {
  const [creators, setCreators] = useState<ApiUser[]>([]);
  const [genres, setGenres] = useState<ApiGenre[]>([]);

  useEffect(() => {
    if (!open) return;
    workflowService.listUsers('CONTENT_CREATOR').then((res) => {
      if (res.success) setCreators(res.data.data);
    });
    workflowService.listGenres().then((res) => {
      if (res.success) setGenres(res.data.data);
    });
  }, [open]);

  // Default to the first creator once the roster arrives.
  useEffect(() => {
    if (!form.assignedCreator && creators.length > 0) onChange('assignedCreator', creators[0].id);
  }, [creators, form.assignedCreator, onChange]);

  const handleCreateGenre = async (name: string) => {
    const res = await workflowService.createGenre(name);
    if (!res.success) {
      toast.error('Không thêm được thể loại', res.message ?? 'Không kết nối được máy chủ.');
      return null;
    }
    setGenres((prev) => (prev.some((g) => g.id === res.data.id) ? prev : [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name, 'vi'))));
    return res.data;
  };

  const totalEpisodes = form.seasons.reduce((total, s) => total + s.length, 0);
  const totalMinutes = form.seasons.flat().reduce((total, m) => total + m, 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo dự án phim"
      subtitle="Thông tin phim, cấu trúc mùa – tập, người phụ trách và lịch sản xuất"
      icon={<Film className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={onSubmit} className="space-y-6 text-xs">
        <Section step={1} title="Thông tin phim">
          <div>
            <label htmlFor="project-title" className={LABEL}>
              Tên dự án phim <span className="text-purple-600 dark:text-purple-400">*</span>
            </label>
            <input
              id="project-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Ví dụ: Kỷ Nguyên Siêu Trí Tuệ 2088…"
              className={fieldInputClass}
            />
          </div>
          <div>
            <label htmlFor="project-synopsis" className={LABEL}>
              Tóm tắt cốt truyện & ý tưởng
            </label>
            <textarea
              id="project-synopsis"
              rows={3}
              value={form.synopsis}
              onChange={(e) => onChange('synopsis', e.target.value)}
              placeholder="Mâu thuẫn trung tâm, nhân vật chính và phong cách hình ảnh mong muốn…"
              className={fieldTextareaClass}
            />
          </div>
          <GenrePicker genres={genres} selected={form.genre} onChange={(ids) => onChange('genre', ids)} onCreate={handleCreateGenre} />
        </Section>

        <Section step={2} title="Mùa & tập">
          <SeasonEpisodesEditor seasons={form.seasons} maxMinutes={maxEpisodeMinutes} onChange={(seasons) => onChange('seasons', seasons)} />
        </Section>

        <Section step={3} title="Phân công & ngân sách">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="project-creator" className={LABEL}>
                <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Creator phụ trách
                <span className="text-purple-600 dark:text-purple-400">*</span>
              </label>
              <select
                id="project-creator"
                value={form.assignedCreator}
                onChange={(e) => onChange('assignedCreator', e.target.value)}
                className={`${fieldInputClass} cursor-pointer font-medium text-slate-800 dark:text-zinc-200 bg-white dark:bg-[#0E1118]`}
              >
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id} className="bg-white dark:bg-[#0E1118] text-slate-900 dark:text-white">
                    {creator.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="project-budget" className={LABEL}>
                <Coins className="w-3.5 h-3.5 text-amber-500" /> Ngân sách token
              </label>
              <div className="relative">
                <input
                  id="project-budget"
                  type="number"
                  min={100}
                  step={100}
                  value={form.budgetTokens}
                  onChange={(e) => onChange('budgetTokens', Math.max(100, Number(e.target.value)))}
                  className={`${fieldInputClass} font-mono font-bold text-amber-600 dark:text-amber-400 pr-16`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 dark:text-zinc-500 pointer-events-none">
                  tokens
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                {QUICK_TOKEN_OPTIONS.map((tok) => (
                  <button
                    key={tok}
                    type="button"
                    onClick={() => onChange('budgetTokens', tok)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer ${
                      form.budgetTokens === tok
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/15'
                    }`}
                  >
                    {tok.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <SubtitleLanguagePicker
            selected={form.subtitleLanguages}
            onChange={(languages) => onChange('subtitleLanguages', languages)}
          />
        </Section>

        <Section step={4} title="Lịch sản xuất">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DATE_FIELDS.map(({ field, label, accent }) => (
              <div key={field}>
                <label htmlFor={`project-${field}`} className={LABEL}>
                  <Calendar className={`w-3.5 h-3.5 ${accent}`} /> {label}
                </label>
                <input
                  id={`project-${field}`}
                  type="date"
                  value={form[field]}
                  onChange={(e) => onChange(field, e.target.value)}
                  className={fieldInputClass}
                />
              </div>
            ))}
          </div>
          <MilestonesEditor
            milestones={form.milestones}
            defaultDeadline={form.deadline}
            onChange={(milestones) => onChange('milestones', milestones)}
          />
        </Section>

        <div className="sticky -bottom-6 -mx-6 -mb-6 px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#13161F]/95 backdrop-blur-md">
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            {form.seasons.length} mùa · {totalEpisodes} tập · {totalMinutes} phút · {form.budgetTokens.toLocaleString()} tokens
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-bold">
              Hủy
            </Button>
            <Button type="submit" className="px-5 py-2.5 rounded-xl text-xs">
              Tạo dự án
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

interface SectionProps {
  step: number;
  title: string;
  children: React.ReactNode;
}

function Section({ step, title, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">{step}</span>
        {title}
      </h4>
      <div className="space-y-3 sm:pl-7">{children}</div>
    </section>
  );
}
