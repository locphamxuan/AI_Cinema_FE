'use client';

import { useState } from 'react';
import {
  Pencil,
  UserPlus,
  XCircle,
  Globe,
  Calendar,
  Clock,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Clapperboard,
  Film,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { productionService } from '@/services/productionService';
import type { AgeRating, Person } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';
import { EDITABLE_PROJECT, OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { formatDateTime } from '../../lib/format';
import { GenrePicker } from '../shared/GenrePicker';
import { TextPromptModal } from '../shared/ui';
import { IdeaFilesPanel } from './IdeaFilesPanel';
import { useProject } from './ProjectContext';

export function OverviewTab() {
  const { project, caps, reload } = useProject();
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { busy, run } = useAction();
  const canEdit = caps.manage && isIn(project.status, EDITABLE_PROJECT);
  const open = isIn(project.status, OPEN_PROJECT);

  const cancel = async (reason: string) => {
    if (await run(() => productionService.cancelProject(project.id, reason), 'Đã huỷ dự án')) {
      setCancelling(false);
      await reload();
    }
  };

  const infoItems: { icon: React.ElementType; label: string; value: React.ReactNode; accent?: string }[] = [
    {
      icon: Tag,
      label: 'Thể loại',
      value: project.genres.length > 0
        ? (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {project.genres.map((g) => (
              <span key={g.id} className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold border border-purple-100 dark:border-purple-500/20">
                {g.name}
              </span>
            ))}
          </div>
        )
        : <span className="text-slate-400">—</span>,
      accent: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: Globe,
      label: 'Ngôn ngữ',
      value: project.defaultLanguage,
      accent: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: ShieldCheck,
      label: 'Độ tuổi',
      value: project.ageRating
        ? <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] border border-rose-100 dark:border-rose-500/20">{project.ageRating}</span>
        : <span className="text-slate-400">—</span>,
      accent: 'text-rose-600 dark:text-rose-400',
    },
    {
      icon: Calendar,
      label: 'Năm phát hành',
      value: project.releaseYear ?? <span className="text-slate-400">—</span>,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Clock,
      label: 'Tạo lúc',
      value: formatDateTime(project.createdAt),
      accent: 'text-slate-500',
    },
    {
      icon: Clapperboard,
      label: 'Bàn giao studio',
      value: formatDateTime(project.handedOffAt) ?? <span className="text-slate-400">—</span>,
      accent: 'text-amber-600 dark:text-amber-400',
    },
    {
      icon: CheckCircle2,
      label: 'Hoàn tất',
      value: formatDateTime(project.completedAt) ?? <span className="text-slate-400">—</span>,
      accent: 'text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* ── Left: main info ── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Film info card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                <Film className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Thông tin phim</h2>
            </div>
            {canEdit && (
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Sửa
              </Button>
            )}
          </div>

          {/* Info grid */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoItems.map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${accent ?? 'text-slate-400'}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">{label}</p>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description sections */}
          <div className="px-5 pb-5 space-y-4 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Ý tưởng gửi studio</p>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">{project.ideaDescription}</p>
            </div>
            {project.synopsis && (
              <div className="rounded-xl bg-purple-50/50 dark:bg-purple-500/[0.05] border border-purple-100 dark:border-purple-500/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 dark:text-purple-500 mb-2">Tóm tắt cho người xem</p>
                <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">{project.synopsis}</p>
              </div>
            )}
          </div>
        </div>

        <IdeaFilesPanel canManage={caps.manage && open} />
      </div>

      {/* ── Right: sidebar ── */}
      <div className="space-y-5">

        {/* Phân công card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Phân công</h2>
          </div>
          <div className="p-5 space-y-3">
            {/* Reviewer */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/[0.05] border border-emerald-100 dark:border-emerald-500/10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold shrink-0">
                {project.reviewer.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Reviewer</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{project.reviewer.fullName}</p>
              </div>
            </div>
            {/* Creator */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              project.creator
                ? 'bg-blue-50/50 dark:bg-blue-500/[0.05] border-blue-100 dark:border-blue-500/10'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 border-dashed'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                project.creator
                  ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-400'
              }`}>
                {project.creator ? project.creator.fullName.charAt(0) : '?'}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">Creator</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{project.creator?.fullName ?? 'Chưa giao'}</p>
              </div>
            </div>

            {caps.manage && open && (
              <>
                <Button
                  size="sm"
                  className="w-full mt-1"
                  variant="secondary"
                  disabled={project.productionFeeTokens <= 0}
                  onClick={() => setAssigning(true)}
                >
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  {project.creator ? 'Đổi Creator' : 'Giao Content Creator'}
                </Button>
                {project.productionFeeTokens <= 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
                    Cấp phí sản xuất (tab Phí sản xuất) trước khi giao Creator.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Huỷ dự án */}
        {caps.manage && open && (
          <div className="rounded-2xl border border-rose-200/60 dark:border-rose-500/20 bg-rose-50/40 dark:bg-rose-500/[0.04] overflow-hidden">
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-1.5">
                <XCircle className="w-4 h-4 text-rose-500" />
                <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Huỷ dự án</p>
              </div>
              <p className="text-[11px] text-rose-500/80 dark:text-rose-400/70 mb-3">Rút cả các lịch phát hành đang chờ. Không hoàn tác được.</p>
              <Button size="sm" variant="danger" className="w-full" onClick={() => setCancelling(true)}>
                <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> Huỷ dự án
              </Button>
            </div>
          </div>
        )}
      </div>

      {editing && <EditProjectModal onClose={() => setEditing(false)} />}
      {assigning && <AssignCreatorModal current={project.creator} onClose={() => setAssigning(false)} />}
      <TextPromptModal
        open={cancelling}
        title="Huỷ dự án"
        subtitle={project.title}
        label="Lý do huỷ"
        confirmLabel="Huỷ dự án"
        danger
        busy={busy}
        onClose={() => setCancelling(false)}
        onConfirm={cancel}
      />
    </div>
  );
}

function EditProjectModal({ onClose }: { onClose: () => void }) {
  const { project, reload } = useProject();
  const [title, setTitle] = useState(project.title);
  const [idea, setIdea] = useState(project.ideaDescription);
  const [synopsis, setSynopsis] = useState(project.synopsis ?? '');
  const [genreIds, setGenreIds] = useState(project.genres.map((g) => g.id));
  const [ageRating, setAgeRating] = useState<AgeRating | ''>(project.ageRating ?? '');
  const [releaseYear, setReleaseYear] = useState(project.releaseYear ? String(project.releaseYear) : '');
  const { busy, run } = useAction();

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
          <FormField label="Độ tuổi (BR-54)">
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
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={busy || !title.trim() || idea.trim().length < 20 || genreIds.length === 0}>Lưu</Button>
        </div>
      </form>
    </Modal>
  );
}

function AssignCreatorModal({ current, onClose }: { current: Person | null; onClose: () => void }) {
  const { project, reload } = useProject();
  const creators = useResource('creators', () => productionService.listCreators());
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
