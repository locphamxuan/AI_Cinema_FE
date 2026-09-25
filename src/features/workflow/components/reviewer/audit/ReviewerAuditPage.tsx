'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { DisplayLocation, PublicationVisibility } from '@/types/workflow';
import { StatusBadge } from '../../shared/StatusBadge';
import { AuditPlayer } from './AuditPlayer';
import { AuditInfoTabs } from './AuditInfoTabs';
import { ComplianceStation, MANUAL_COMPLIANCE_CHECKS, type ManualComplianceCheck } from './ComplianceStation';
import { PublishStation } from './PublishStation';
import { RequestChangesModal } from './RequestChangesModal';
import { toast } from '@/components/ui/Toast';
import { episodeLabel, episodeName, spansSeasons } from '@/features/workflow/lib/episodeLabel';
import { isAwaitingAudit } from '@/features/workflow/lib/workflowState';

export interface ReviewerAuditPageProps {
  packageId: string;
}

export function ReviewerAuditPage({ packageId }: ReviewerAuditPageProps) {
  const { project, loadProjects, requestContentChanges, passCompliance, publishEpisode } = useWorkflowStore();

  const pkg = project.episodes.find((ep) => ep.id === packageId);

  // Opened by URL (e.g. after a refresh): the project is not in memory yet.
  useEffect(() => {
    if (!pkg) loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opened episode
  }, [packageId]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const [checks, setChecks] = useState<Record<ManualComplianceCheck, boolean>>(
    () => Object.fromEntries(MANUAL_COMPLIANCE_CHECKS.map((c) => [c.type, true])) as Record<ManualComplianceCheck, boolean>
  );
  const [displayLocation] = useState<DisplayLocation>('INTRO_OUTRO');
  const [isPassingCompliance, setIsPassingCompliance] = useState(false);

  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [visibility, setVisibility] = useState<PublicationVisibility>('public');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['WEB_OTT', 'MOBILE_APP', 'SMART_TV']);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!pkg) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-center px-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Không tìm thấy tập phim</h2>
        <Link href="/reviewer" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const label = episodeLabel(pkg, spansSeasons(project.episodes));
  const isCompliancePassed = pkg.status === 'COMPLIANCE_PASSED' || pkg.status === 'PUBLISHED';
  const isPublished = pkg.status === 'PUBLISHED';
  // A cut is decided only while it waits for the Reviewer; a returned one waits for the Creator.
  const canAudit = isAwaitingAudit(pkg.status);

  const handleToggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleConfirmCompliance = async () => {
    setIsPassingCompliance(true);
    const ok = await passCompliance(pkg.id, checks, displayLocation);
    setIsPassingCompliance(false);
    if (ok) toast.success('Đã xác nhận đạt chuẩn', `${label} đã qua kiểm định pháp lý và được gắn nhãn AI.`);
  };

  const handlePublishNow = async () => {
    setIsPublishing(true);
    const ok = await publishEpisode(pkg.id, new Date(scheduledDate).toISOString());
    setIsPublishing(false);
    if (ok) {
      toast.success(
        'Đã phát hành',
        `${label} đã lên nền tảng, kèm nhãn nội dung AI.`
      );
    }
  };

  const handleRequestChanges = async () => {
    if (!rejectFeedback.trim()) {
      toast.warning('Thiếu thông tin', 'Nhập nội dung cần sửa rồi gửi lại.');
      return;
    }
    const ok = await requestContentChanges(pkg.id, rejectFeedback.trim());
    if (!ok) return;
    setShowRejectModal(false);
    setRejectFeedback('');
    toast.info(
      'Đã gửi yêu cầu chỉnh sửa',
      'Creator sẽ thấy phản hồi của bạn.'
    );
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="space-y-3">
        <Link href="/reviewer" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Quay lại danh sách tập
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {project.title} · {label}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{episodeName(pkg.title)}</h1>
              <StatusBadge status={pkg.status} />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canAudit && (
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
              >
                Yêu cầu sửa
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <AuditPlayer pkg={pkg} />
          <AuditInfoTabs pkg={pkg} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ComplianceStation
            isCompliancePassed={isCompliancePassed}
            isPassingCompliance={isPassingCompliance}
            canConfirm={canAudit}
            checks={checks}
            onCheckChange={(type, value) => setChecks((prev) => ({ ...prev, [type]: value }))}
            displayLocation={displayLocation}
            onConfirm={handleConfirmCompliance}
          />

          <PublishStation
            packageId={pkg.id}
            isCompliancePassed={isCompliancePassed}
            isPublished={isPublished}
            isPublishing={isPublishing}
            scheduledDate={scheduledDate}
            onScheduledDateChange={setScheduledDate}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            selectedChannels={selectedChannels}
            onToggleChannel={handleToggleChannel}
            onPublish={handlePublishNow}
          />
        </div>
      </div>

      <RequestChangesModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRequestChanges}
        feedback={rejectFeedback}
        onFeedbackChange={setRejectFeedback}
      />
    </main>
  );
}
