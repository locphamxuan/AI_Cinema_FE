'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { DisplayLocation, LabelType, PublicationVisibility } from '@/types/workflow';
import { StatusBadge } from '../../shared/StatusBadge';
import { AuditPlayer } from './AuditPlayer';
import { AuditInfoTabs } from './AuditInfoTabs';
import { ComplianceStation } from './ComplianceStation';
import { PublishStation } from './PublishStation';
import { RequestChangesModal } from './RequestChangesModal';
import { toast } from '@/components/ui/Toast';
import { workflowService } from '@/services/workflowService';

export interface ReviewerAuditPageProps {
  packageId: string;
}

export function ReviewerAuditPage({ packageId }: ReviewerAuditPageProps) {
  const { project, complianceChecks, labels, publications, requestContentChanges, saveComplianceCheck, scheduleAndPublish } = useWorkflowStore();

  const pkg = project.episodes.find((ep) => ep.id === packageId) || project.episodes[1] || project.episodes[0];
  const compliance = complianceChecks[pkg?.id || ''];
  const label = labels[pkg?.id || ''];
  const publication = publications[pkg?.id || ''];

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const [article44Passed, setArticle44Passed] = useState(compliance?.article_44_passed ?? true);
  const [decree142Passed, setDecree142Passed] = useState(compliance?.decree142_passed ?? true);
  const [watermarkVerified, setWatermarkVerified] = useState(compliance?.watermark_verified ?? true);
  const [labelType] = useState<LabelType>(label?.label_type || 'AI_GENERATED_FULL');
  const [displayLocation] = useState<DisplayLocation>(label?.display_location || 'INTRO_OUTRO');
  const [complianceNotes] = useState(
    compliance?.notes || 'Các cảnh 3D/VFX và nhân vật ảo đã được kiểm duyệt; nhãn AI hiển thị 5 giây đầu và cuối video.'
  );
  const [isPassingCompliance, setIsPassingCompliance] = useState(false);

  const [scheduledDate, setScheduledDate] = useState('2026-09-20T20:00');
  const [visibility, setVisibility] = useState<PublicationVisibility>(publication?.visibility || 'public');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(publication?.platform_channels || ['WEB_OTT', 'MOBILE_APP', 'SMART_TV']);
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

  const isCompliancePassed = pkg.status === 'COMPLIANCE_PASSED' || pkg.status === 'PUBLISHED';
  const isPublished = pkg.status === 'PUBLISHED';

  const handleToggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleConfirmCompliance = () => {
    setIsPassingCompliance(true);
    // Call backend API in background to save compliance check and AI label
    workflowService.createAiContentLabel(pkg.id, {
      labelType: 'AI_GENERATED',
      labelText: 'Nội dung được tạo hoàn toàn bằng trí tuệ nhân tạo theo Điều 44 Luật AI và Nghị định 142/2024/NĐ-CP.',
      displayLocation,
      appliedById: '1deebe95-e8ca-49aa-bd4d-c44489f9964f',
      policyId: 'pol-d44-2025',
    }).then(() => {
      workflowService.createComplianceCheck(pkg.id, {
        checkType: 'AI_LABEL_PRESENCE',
        policyId: 'pol-d44-2025',
        result: 'PASS',
        checkedBySystem: 'FE-Reviewer-Audit',
      }).catch((e) => console.warn('Compliance check API call:', e));
    }).catch((e) => console.warn('AI label API call:', e));

    setTimeout(() => {
      saveComplianceCheck(
        pkg.id,
        {
          article_44_passed: article44Passed,
          decree142_passed: decree142Passed,
          watermark_verified: watermarkVerified,
          moderation_score: 99.4,
          ai_content_percentage: 100,
          notes: complianceNotes,
        },
        {
          label_type: labelType,
          label_text: 'Nội dung được tạo hoàn toàn bằng trí tuệ nhân tạo theo Điều 44 Luật AI và Nghị định 142/2024/NĐ-CP.',
          display_location: displayLocation,
          ruleset_version: 'DECREE_142_2024_V1',
        }
      );
      setIsPassingCompliance(false);
    }, 600);
  };

  const handlePublishNow = () => {
    setIsPublishing(true);
    setTimeout(() => {
      scheduleAndPublish(pkg.id, { scheduled_at: scheduledDate, visibility, channels: selectedChannels });
      setIsPublishing(false);
      toast.success(
        'Đã phát hành tập phim!',
        `Tập ${pkg.episode_number} đã được phát sóng công khai lên nền tảng OTT với đầy đủ nhãn tuân thủ AI.`
      );
    }, 700);
  };

  const handleRequestChanges = () => {
    if (!rejectFeedback.trim()) {
      toast.warning('Thiếu thông tin', 'Vui lòng nhập lý do yêu cầu chỉnh sửa!');
      return;
    }
    requestContentChanges(pkg.id, rejectFeedback.trim());
    setShowRejectModal(false);
    setRejectFeedback('');
    toast.info(
      'Đã gửi yêu cầu chỉnh sửa',
      'Phản hồi yêu cầu chỉnh sửa nội dung đã được chuyển về cho Creator.'
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
              {project.title} · Tập {pkg.episode_number}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{pkg.title.replace(/^Tập\s*\d+\s*[:\-]\s*/i, '')}</h1>
              <StatusBadge status={pkg.status} />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
            >
              Yêu cầu sửa
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <AuditPlayer pkg={pkg} certificationId={label?.certification_id} />
          <AuditInfoTabs pkg={pkg} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ComplianceStation
            isCompliancePassed={isCompliancePassed}
            isPassingCompliance={isPassingCompliance}
            article44Passed={article44Passed}
            onArticle44Change={setArticle44Passed}
            decree142Passed={decree142Passed}
            onDecree142Change={setDecree142Passed}
            watermarkVerified={watermarkVerified}
            onWatermarkChange={setWatermarkVerified}
            certificationId={label?.certification_id}
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
