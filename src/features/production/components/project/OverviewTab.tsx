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

  const infoItems: { icon: React.ElementType; label: string; value: React.ReactNode }[] = [
    {
      icon: Tag,
      label: 'Thể loại',
      value: project.genres.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {project.genres.map((g) => (
            <span key={g.id} className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-500 text-xs font-semibold border border-sky-100 dark:border-sky-500/20">
              {g.name}
            </span>
          ))}
        </div>
      ) : <span className="text-slate-400">—</span>,
    },
    {
      icon: Globe,
      label: 'Ngôn ngữ',
      value: project.defaultLanguage,
    },
    {
      icon: ShieldCheck,
      label: 'Độ tuổi',
      value: project.ageRating ? (
        <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-100 dark:border-rose-500/20">
          {project.ageRating}
        </span>
      ) : <span className="text-slate-400">—</span>,
    },
    {
      icon: Calendar,
      label: 'Năm phát hành',
      value: project.releaseYear ?? <span className="text-slate-400">—</span>,
    },
    {
      icon: Gift,
      label: 'Tập xem miễn phí',
      value: project.freeEpisodeCount ?? <span className="text-slate-500">Mặc định nền tảng</span>,
    },
    {
      icon: Building2,
      label: 'Studio',
      value: project.studio?.name ?? <span className="text-slate-400">—</span>,
    },
    {
      icon: Clock,
      label: 'Tạo lúc',
      value: formatDateTime(project.createdAt),
    },
    {
      icon: Clapperboard,
      label: 'Bàn giao Studio',
      value: formatDateTime(project.handedOffAt) ?? <span className="text-slate-400">—</span>,
    },
    {
      icon: CheckCircle2,
      label: 'Hoàn tất',
      value: formatDateTime(project.completedAt) ?? <span className="text-slate-400">—</span>,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── Left: main info ── */}
      <div className="lg:col-span-2 space-y-5">
        <div className="rounded-2xl border border-sky-100 dark:border-white/10 bg-white dark:bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                <Film className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Thông tin phim</h2>
            </div>
            {canEdit && (
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Sửa
              </Button>
            )}
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 shrink-0 text-sky-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
                  <div className="text-sm text-slate-900 dark:text-slate-100 font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5 space-y-4 text-sm">
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Ý tưởng gửi Studio</p>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">{project.ideaDescription}</p>
            </div>
            {project.synopsis && (
              <div className="rounded-xl bg-sky-50/50 dark:bg-sky-500/[0.05] border border-sky-100 dark:border-sky-500/10 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Tóm tắt cho người xem</p>
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

        <div className="rounded-2xl border border-sky-100 dark:border-white/10 bg-white dark:bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Phân công</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50/60 dark:bg-white/[0.03]">
              <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-sky-800 dark:text-sky-200 text-sm font-semibold shrink-0">
                {project.reviewer.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Reviewer phụ trách</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{project.reviewer.fullName}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              project.creator
                ? 'bg-sky-50/60 dark:bg-white/[0.03] border-transparent'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 border-dashed'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                project.creator ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-200' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
              }`}>
                {project.creator ? project.creator.fullName.charAt(0) : '?'}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Creator phụ trách</p>
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
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" /> {project.creator ? 'Đổi Creator' : 'Giao cho Creator'}
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
