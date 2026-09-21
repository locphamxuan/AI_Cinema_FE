'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, AlertCircle, AlertTriangle, Eye } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { DisplayLocation, LabelType, PublicationVisibility } from '@/types/workflow';
import { StatusBadge } from '../../shared/StatusBadge';
import { AuditPlayer } from './AuditPlayer';
import { AuditInfoTabs } from './AuditInfoTabs';
import { ComplianceStation } from './ComplianceStation';
import { PublishStation } from './PublishStation';
import { RequestChangesModal } from './RequestChangesModal';
import { toast } from '@/components/ui/Toast';

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
    compliance?.notes || 'Tất cả các cảnh 3D/VFX và nhân vật ảo đã được kiểm duyệt, nhãn dán xuất hiện 5 giây đầu & cuối video.'
  );
  const [isPassingCompliance, setIsPassingCompliance] = useState(false);

  const [scheduledDate, setScheduledDate] = useState('2026-09-20T20:00');
  const [visibility, setVisibility] = useState<PublicationVisibility>(publication?.visibility || 'public');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(publication?.platform_channels || ['WEB_OTT', 'MOBILE_APP', 'SMART_TV']);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0C10] text-slate-900 dark:text-white p-8 flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy gói tập phim</h2>
        <Link href="/reviewer" className="text-xs text-ruby hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Quay về Dashboard Thẩm định
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
          label_text: 'Nội dung tạo 100% bằng Trí tuệ Nhân tạo theo Điều 44 Luật AI và Nghị định 142/2024/NĐ-CP.',
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
    <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/reviewer"
            aria-label="Quay lại Dashboard Reviewer"
            className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Dự án: {project.title}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-purple-600 dark:text-purple-400 font-medium">Tập {pkg.episode_number}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {pkg.title}
              <StatusBadge status={pkg.status} />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            Yêu cầu sửa nội dung (Request Changes)
          </button>
          {isPublished && (
            <Link
              href={`/watch/${pkg.id}`}
              className="px-4 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-ruby/20"
            >
              <Eye className="w-4 h-4" />
              Xem trên OTT
            </Link>
          )}
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
