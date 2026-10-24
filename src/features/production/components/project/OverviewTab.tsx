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
  Gift,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { productionService } from '@/services/productionService';
import { useAction } from '../../hooks/useAction';
import { EDITABLE_PROJECT, OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { formatDateTime } from '../../lib/format';
import { TextPromptModal } from '../shared/ui';
import { IdeaFilesPanel } from './IdeaFilesPanel';
import { PosterPanel } from './PosterPanel';
import { AssignCreatorModal, EditProjectModal } from './ProjectModals';
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
      value: project.genres.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {project.genres.map((g) => (
            <span key={g.id} className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold border border-purple-100 dark:border-purple-500/20">
              {g.name}
            </span>
          ))}
        </div>
      ) : <span className="text-slate-400">—</span>,
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
      value: project.ageRating ? (
        <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] border border-rose-100 dark:border-rose-500/20">
          {project.ageRating}
        </span>
      ) : <span className="text-slate-400">—</span>,
      accent: 'text-rose-600 dark:text-rose-400',
    },
    {
      icon: Calendar,
      label: 'Năm phát hành',
      value: project.releaseYear ?? <span className="text-slate-400">—</span>,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Gift,
      label: 'Tập xem miễn phí',
      value: project.freeEpisodeCount ?? <span className="text-slate-500">Mặc định nền tảng</span>,
      accent: 'text-amber-500',
    },
    {
      icon: Building2,
      label: 'Studio',
      value: project.studio?.name ?? <span className="text-slate-400">—</span>,
      accent: 'text-blue-500',
    },
    {
      icon: Clock,
      label: 'Tạo lúc',
      value: formatDateTime(project.createdAt),
      accent: 'text-slate-500',
    },
    {
      icon: Clapperboard,
      label: 'Bàn giao Studio',
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
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
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

        <IdeaFilesPanel canManage={caps.manage && open} purpose="IDEA" />
        <IdeaFilesPanel canManage={caps.manage && open} purpose="SYNOPSIS" />
      </div>

      {/* ── Right: sidebar ── */}
      <div className="space-y-5">
        <PosterPanel canManage={canEdit} />

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Phân công</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/[0.05] border border-emerald-100 dark:border-emerald-500/10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold shrink-0">
                {project.reviewer.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Reviewer phụ trách</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{project.reviewer.fullName}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              project.creator
                ? 'bg-blue-50/50 dark:bg-blue-500/[0.05] border-blue-100 dark:border-blue-500/10'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 border-dashed'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                project.creator ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-white/10 text-slate-400'
              }`}>
                {project.creator ? project.creator.fullName.charAt(0) : '?'}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">Creator phụ trách</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{project.creator?.fullName ?? 'Chưa giao Creator'}</p>
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
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" /> {project.creator ? 'Đổi Creator' : 'Giao Content Creator'}
                </Button>
                {project.productionFeeTokens <= 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
                    Cấp phí cho từng mùa (tab Phí sản xuất) trước khi giao Creator.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

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
