'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { RoleNavHeader } from '@/components/dashboard/RoleNavHeader';
import {
  ShieldCheck,
  Film,
  FileText,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  ArrowLeft,
  Tv,
  Smartphone,
  Globe,
  Info,
  ChevronRight,
  BadgeCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { LabelType, DisplayLocation, PublicationVisibility } from '@/types/workflow';

export default function ReviewerAuditPage() {
  const params = useParams();
  const packageId = (params?.packageId as string) || 'pkg-ep-02';

  const {
    project,
    complianceChecks,
    labels,
    publications,
    requestContentChanges,
    saveComplianceCheck,
    scheduleAndPublish,
  } = useWorkflowStore();

  const pkg = project.episodes.find((ep) => ep.id === packageId) || project.episodes[1] || project.episodes[0];
  const compliance = complianceChecks[pkg?.id || ''];
  const label = labels[pkg?.id || ''];
  const publication = publications[pkg?.id || ''];

  const [activeTab, setActiveTab] = useState<'brief' | 'assets' | 'tokens' | 'compliance'>('brief');

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // Compliance Form State
  const [article44Passed, setArticle44Passed] = useState(compliance?.article_44_passed ?? true);
  const [decree142Passed, setDecree142Passed] = useState(compliance?.decree142_passed ?? true);
  const [watermarkVerified, setWatermarkVerified] = useState(compliance?.watermark_verified ?? true);
  const [labelType] = useState<LabelType>(label?.label_type || 'AI_GENERATED_FULL');
  const [displayLocation] = useState<DisplayLocation>(label?.display_location || 'INTRO_OUTRO');
  const [complianceNotes] = useState(compliance?.notes || 'Tất cả các cảnh 3D/VFX và nhân vật ảo đã được kiểm duyệt, nhãn dán xuất hiện 5 giây đầu & cuối video.');
  const [isPassingCompliance, setIsPassingCompliance] = useState(false);

  // Publish Form State
  const [scheduledDate, setScheduledDate] = useState('2026-09-20T20:00');
  const [visibility, setVisibility] = useState<PublicationVisibility>(publication?.visibility || 'public');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    publication?.platform_channels || ['WEB_OTT', 'MOBILE_APP', 'SMART_TV']
  );
  const [isPublishing, setIsPublishing] = useState(false);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-gray-200 p-8 flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-[#F59E0B] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy gói tập phim</h2>
        <Link href="/reviewer" className="text-xs text-[#E50914] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Quay về Dashboard Thẩm định
        </Link>
      </div>
    );
  }

  const isCompliancePassed = pkg.status === 'COMPLIANCE_PASSED' || pkg.status === 'PUBLISHED';
  const isPublished = pkg.status === 'PUBLISHED';
  const tokenPercentage = pkg.quota_allocated > 0 ? Math.min(100, Math.round((pkg.actual_tokens_used / pkg.quota_allocated) * 100)) : 0;
  const isTokenWarning = tokenPercentage >= 90;

  const handleToggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
      }
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
      scheduleAndPublish(pkg.id, {
        scheduled_at: scheduledDate,
        visibility: visibility,
        channels: selectedChannels,
      });
      setIsPublishing(false);
    }, 700);
  };

  const handleRequestChanges = () => {
    if (!rejectFeedback.trim()) {
      alert('Vui lòng nhập lý do yêu cầu chỉnh sửa!');
      return;
    }
    requestContentChanges(pkg.id, rejectFeedback.trim());
    setShowRejectModal(false);
    alert('Đã gửi phản hồi yêu cầu chỉnh sửa nội dung về cho Creator!');
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-200">
      <RoleNavHeader />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161922] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Link
              href="/reviewer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Dự án: {project.title}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#8B5CF6] font-medium">Tập {pkg.episode_number}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                {pkg.title}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    pkg.status === 'PUBLISHED'
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                      : pkg.status === 'COMPLIANCE_PASSED'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : pkg.status === 'EPISODE_SUBMITTED'
                      ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30'
                      : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                  }`}
                >
                  {pkg.status === 'PUBLISHED'
                    ? 'ĐÃ PHÁT HÀNH OTT'
                    : pkg.status === 'COMPLIANCE_PASSED'
                    ? 'ĐÃ DUYỆT PHÁP LÝ AI'
                    : pkg.status === 'EPISODE_SUBMITTED'
                    ? 'CHỜ DUYỆT KIỂM TOÁN'
                    : pkg.status}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-semibold flex items-center gap-2 transition"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              Yêu cầu sửa nội dung (Request Changes)
            </button>
            {pkg.status === 'PUBLISHED' && (
              <Link
                href={`/watch/${pkg.id}`}
                className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-[#E50914]/20"
              >
                <Eye className="w-4 h-4" />
                Xem trên OTT
              </Link>
            )}
          </div>
        </div>

        {/* Grid 2 Columns: Left Video Player & Tabs, Right Compliance & Publish Station */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Video Player & Tabs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Video Player Box */}
            <div className="bg-[#161922] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative aspect-video bg-black flex items-center justify-center group">
                <img
                  src={pkg.thumbnail_url}
                  alt={pkg.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* AI Compliance Watermark Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white">
                  <BadgeCheck className="w-4 h-4 text-[#10B981]" />
                  <span>AI Watermark ID: {label?.certification_id || 'AI-VN-2026-CINEMA-1042'}</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-[#E50914] text-white text-[11px] font-bold">4K HDR</span>
                    <span>60 FPS</span>
                    <span>H.265 / HEVC</span>
                  </div>
                  <div>Thời lượng: {pkg.total_duration}</div>
                </div>

                {/* Central Play Button */}
                <div className="absolute w-16 h-16 rounded-full bg-[#E50914]/90 flex items-center justify-center text-white shadow-lg cursor-pointer transform group-hover:scale-110 transition">
                  <Film className="w-7 h-7 ml-0.5" />
                </div>
              </div>

              {/* Video Player Meta */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Video Draft Render hoàn tất ({pkg.assets.length} Phân cảnh)</span>
                </div>
                <span>Tỷ lệ khung hình: 16:9 Cinema DCI</span>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="bg-[#161922] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <button
                  onClick={() => setActiveTab('brief')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'brief'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Kịch bản gốc (Content Brief)
                </button>
                <button
                  onClick={() => setActiveTab('assets')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'assets'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-4 h-4" /> Asset AI ({pkg.assets.length})
                </button>
                <button
                  onClick={() => setActiveTab('tokens')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'tokens'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Zap className="w-4 h-4" /> Tiêu hao Token ({pkg.actual_tokens_used}/{pkg.quota_allocated})
                </button>
              </div>

              {/* Tab 1: Brief */}
              {activeTab === 'brief' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="text-gray-400 font-medium mb-1">Tóm tắt kịch bản:</h4>
                    <p className="text-white bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                      {pkg.brief.synopsis}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 font-medium mb-1">Kịch bản chi tiết theo phân đoạn:</h4>
                    <div className="space-y-2">
                      {pkg.brief.scene_breakdown.map((sc) => (
                        <div key={sc.scene_number} className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-[#8B5CF6]">
                              Cảnh {sc.scene_number}: {sc.title}
                            </span>
                            <span className="text-gray-400">{sc.target_duration_sec}s · {sc.estimated_tokens} Tokens</span>
                          </div>
                          <p className="text-gray-300 mb-1.5">{sc.description}</p>
                          <div className="text-[11px] text-gray-400 bg-black/30 p-2 rounded border border-white/5 font-mono">
                            Prompt: {sc.visual_prompt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Assets Breakdown */}
              {activeTab === 'assets' && (
                <div className="space-y-3">
                  {pkg.assets.map((asset, idx) => (
                    <div
                      key={asset.id}
                      className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
                    >
                      <img
                        src={asset.thumbnail_url}
                        alt="Asset thumbnail"
                        className="w-20 h-12 object-cover rounded-lg border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-white">Clip Phân cảnh #{idx + 1}</h5>
                          <span className="text-[11px] text-[#10B981] font-mono">{asset.resolution}</span>
                        </div>
                        <p className="text-gray-400 truncate text-[11px] font-mono mt-0.5">
                          Model: {asset.metadata.model} · Seed: {asset.metadata.seed} · FPS: {asset.metadata.fps}
                        </p>
                        <p className="text-gray-300 text-[11px] line-clamp-1 italic mt-1">
                          &quot;{asset.metadata.prompt}&quot;
                        </p>
                      </div>
                      <div className="text-right text-gray-400 text-[11px]">
                        <div>{asset.duration_seconds}s</div>
                        <div>{asset.file_size_mb} MB</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Tokens Breakdown */}
              {activeTab === 'tokens' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mức tiêu hao thực tế:</span>
                      <span className="font-bold text-white text-sm">{pkg.actual_tokens_used} / {pkg.quota_allocated} Tokens</span>
                    </div>

                    <div className="w-full bg-black/50 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTokenWarning ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${tokenPercentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Tỷ lệ sử dụng: {tokenPercentage}%</span>
                      <span>Còn lại: {Math.max(0, pkg.quota_allocated - pkg.actual_tokens_used)} Tokens</span>
                    </div>

                    {isTokenWarning && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Cảnh báo: Đã sử dụng vượt quá 90% hạn mức token được cấp!</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-300">Chi tiết tác vụ sinh tài nguyên:</h5>
                    {pkg.jobs.map((job) => (
                      <div key={job.id} className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                        <div>
                          <div className="font-medium text-white">{job.title}</div>
                          <div className="text-[11px] text-gray-400">{job.ai_model}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-[#8B5CF6]">{job.token_cost} Tokens</span>
                          <div className="text-[10px] text-[#10B981]">Đã hoàn tất 100%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Compliance Station & Publishing Box (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Station 1: Compliance Check (Điều 44 & NĐ 142) */}
            <div className="bg-[#161922] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Kiểm định Pháp lý AI</h3>
                    <p className="text-[11px] text-gray-400">Điều 44 Luật AI & Nghị định 142/2024</p>
                  </div>
                </div>
                {isCompliancePassed ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ĐẠT CHUẨN
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 text-[11px] font-bold">
                    CHỜ DUYỆT
                  </span>
                )}
              </div>

              {/* Checkbox Toggles */}
              <div className="space-y-2.5 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">Điều 44: Nhãn dán định danh AI</span>
                    <p className="text-[11px] text-gray-400">Hiển thị thông báo nội dung do AI tạo ở 5s đầu</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={article44Passed}
                    onChange={(e) => setArticle44Passed(e.target.checked)}
                    className="w-4 h-4 accent-[#10B981] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">Nghị định 142: Dấu mờ bản quyền AI</span>
                    <p className="text-[11px] text-gray-400">Đã nhúng mã xác thực watermark ẩn trong luồng video</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={decree142Passed}
                    onChange={(e) => setDecree142Passed(e.target.checked)}
                    className="w-4 h-4 accent-[#10B981] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">An toàn nội dung (Content Moderation)</span>
                    <p className="text-[11px] text-[#10B981] font-mono">Điểm an toàn: 99.4% (Không vi phạm bản quyền/NSFW)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={watermarkVerified}
                    onChange={(e) => setWatermarkVerified(e.target.checked)}
                    className="w-4 h-4 accent-[#10B981] rounded"
                  />
                </label>
              </div>

              {/* Label Preview Card */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-2">
                <div className="text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Mô phỏng nhãn định danh phát hành:</span>
                  <span className="text-[#8B5CF6] font-mono text-[10px]">DECREE_142_2024_V1</span>
                </div>
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-[#8B5CF6]/30 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-[#10B981]" />
                    AI CONTENT CERTIFIED
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Mã chứng chỉ: <span className="font-mono text-[#8B5CF6]">{label?.certification_id || 'AI-VN-2026-CINEMA-1042-EP2'}</span>
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Vị trí hiển thị: {displayLocation === 'INTRO_OUTRO' ? 'Đầu & Cuối phim (5s)' : 'Watermark toàn thời lượng'}
                  </p>
                </div>
              </div>

              {/* Confirm Compliance Button */}
              <button
                onClick={handleConfirmCompliance}
                disabled={isPassingCompliance || isCompliancePassed}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  isCompliancePassed
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 cursor-default'
                    : 'bg-[#10B981] hover:bg-[#0ea372] text-white shadow-lg shadow-[#10B981]/20'
                }`}
              >
                {isPassingCompliance ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu chứng nhận...
                  </>
                ) : isCompliancePassed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Đã xác nhận Đạt chuẩn Pháp lý AI
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Xác nhận Đạt chuẩn Pháp lý AI (Pass Compliance)
                  </>
                )}
              </button>
            </div>

            {/* Station 2: Schedule & Publish to OTT */}
            <div className={`bg-[#161922] border rounded-2xl p-5 space-y-4 transition ${
              isCompliancePassed ? 'border-white/10 opacity-100' : 'border-white/5 opacity-50 pointer-events-none'
            }`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Lên lịch & Phát hành</h3>
                    <p className="text-[11px] text-gray-400">Phân phối tới OTT Cinema Catalog</p>
                  </div>
                </div>
                {isPublished && (
                  <span className="px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-[11px] font-bold">
                    LIVE TRÊN OTT
                  </span>
                )}
              </div>

              {!isCompliancePassed && (
                <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl text-xs text-[#F59E0B] flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Cần hoàn tất xác nhận Pháp lý AI phía trên trước khi phát hành.</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                {/* Datetime Picker */}
                <div>
                  <label className="block text-gray-400 mb-1">Thời gian công chiếu:</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      disabled={isPublished}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>

                {/* Platform Channels */}
                <div>
                  <label className="block text-gray-400 mb-1.5">Kênh phân phối áp dụng:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={isPublished}
                      onClick={() => handleToggleChannel('WEB_OTT')}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                        selectedChannels.includes('WEB_OTT')
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                          : 'bg-white/5 border-white/5 text-gray-400'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="text-[11px] font-semibold">Web OTT</span>
                    </button>

                    <button
                      type="button"
                      disabled={isPublished}
                      onClick={() => handleToggleChannel('MOBILE_APP')}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                        selectedChannels.includes('MOBILE_APP')
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                          : 'bg-white/5 border-white/5 text-gray-400'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="text-[11px] font-semibold">Mobile App</span>
                    </button>

                    <button
                      type="button"
                      disabled={isPublished}
                      onClick={() => handleToggleChannel('SMART_TV')}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                        selectedChannels.includes('SMART_TV')
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                          : 'bg-white/5 border-white/5 text-gray-400'
                      }`}
                    >
                      <Tv className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="text-[11px] font-semibold">Smart TV</span>
                    </button>
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-gray-400 mb-1">Chế độ hiển thị:</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as PublicationVisibility)}
                    disabled={isPublished}
                    className="w-full bg-[#1e222d] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="public">Công khai toàn bộ khán giả (Public)</option>
                    <option value="vip_only">Chỉ dành cho tài khoản VIP (VIP Early Access)</option>
                    <option value="unlisted">Không công khai (Chỉ xem qua liên kết)</option>
                  </select>
                </div>
              </div>

              {/* Publish Action Button */}
              {isPublished ? (
                <div className="space-y-2">
                  <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-center text-xs text-[#10B981] font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Tập phim đã phát hành công khai trên nền tảng OTT!
                  </div>
                  <Link
                    href={`/watch/${pkg.id}`}
                    className="w-full py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#E50914]/20"
                  >
                    <Eye className="w-4 h-4" /> Mở trang xem phim (Watch OTT)
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handlePublishNow}
                  disabled={!isCompliancePassed || isPublishing}
                  className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-[#c70811] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#E50914]/25"
                >
                  {isPublishing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang đồng bộ và phát hành OTT...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Phát hành lên nền tảng OTT (Publish Content to Platform)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Reject & Request Changes Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161922] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yêu cầu Chỉnh sửa Nội dung</h3>
                <p className="text-xs text-gray-400">Gửi phản hồi trả về cho Maker (Creator)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Lý do & hướng dẫn chỉnh sửa:
              </label>
              <textarea
                rows={4}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Ví dụ: Phân cảnh 2 ánh sáng hơi chói và thoại AI Aura bị trễ nhịp so với khẩu hình. Vui lòng re-render lại cảnh 2..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRequestChanges}
                className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-semibold flex items-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" /> Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
