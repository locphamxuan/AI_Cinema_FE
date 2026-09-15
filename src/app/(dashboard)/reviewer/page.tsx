'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import RoleNavHeader from '@/components/dashboard/RoleNavHeader';
import {
  ShieldCheck,
  Plus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  Eye,
  Sliders,
  Send,
  Film,
  Award,
} from 'lucide-react';

export default function ReviewerDashboardPage() {
  const router = useRouter();
  const {
    project,
    activePackageId,
    setActivePackage,
    createProject,
    allocateQuota,
    requestPlanChanges,
  } = useWorkflowStore();

  const currentPackage = project.episodes.find((e) => e.id === activePackageId) || project.episodes[0];
  const brief = currentPackage?.brief;

  // New Project Modal State
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Cyberpunk');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newEpisodesCount, setNewEpisodesCount] = useState(5);
  const [newBudgetTokens, setNewBudgetTokens] = useState(3000);
  const [newDeadline, setNewDeadline] = useState('2026-11-30');
  const [newReleaseDate, setNewReleaseDate] = useState('2026-12-15');

  // Plan Review Actions State
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaToAllocate, setQuotaToAllocate] = useState(brief?.estimated_tokens || 450);
  const [quotaNotes, setQuotaNotes] = useState('Hạn ngạch token chính thức được cấp để sản xuất clip 4K.');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('Kịch bản phân cảnh 2 còn sơ sài, cần bổ sung mô tả chi tiết góc máy và giảm dự toán token xuống dưới 450.');

  React.useEffect(() => {
    if (brief?.estimated_tokens) {
      setQuotaToAllocate(brief.estimated_tokens);
    }
  }, [brief]);

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) {
      alert('Vui lòng nhập tên dự án!');
      return;
    }

    createProject({
      title: newProjectTitle,
      genre: [newGenre, 'Khoa học viễn tưởng', 'AI'],
      synopsis: newSynopsis || 'Dự án phim AI sản xuất theo quy trình Maker - Checker.',
      total_episodes: newEpisodesCount,
      total_budget_tokens: newBudgetTokens,
      deadline: newDeadline,
      planned_release_date: newReleaseDate,
    });

    setIsCreateProjectModalOpen(false);
    alert('Đã khởi tạo dự án sản xuất phim AI mới thành công!');
  };

  const handleAllocateQuotaConfirm = () => {
    if (!currentPackage) return;
    allocateQuota(currentPackage.id, quotaToAllocate, quotaNotes);
    setIsQuotaModalOpen(false);
    alert(`Đã phê duyệt kế hoạch và cấp ${quotaToAllocate} AI Tokens cho Creator (Maker)!`);
  };

  const handleRequestChangesConfirm = () => {
    if (!currentPackage || !rejectFeedback.trim()) return;
    requestPlanChanges(currentPackage.id, rejectFeedback);
    setIsRejectModalOpen(false);
    alert('Đã gửi yêu cầu hiệu chỉnh kế hoạch về cho Creator!');
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-100 pb-20 font-sans">
      {/* Role Navigation Top Header */}
      <RoleNavHeader />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Reviewer Overview Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-neon/20 text-neon-light border border-neon/40">
                CHECKER & AUDITOR CONTROL CENTER
              </span>
              <span className="text-xs text-slate-400 font-mono">Thẩm định viên: {project.reviewer_name}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Trung Tâm Quản Lý Dự Án & Thẩm Định Kế Hoạch
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-dark to-neon text-white text-xs font-bold shadow-lg shadow-neon/30 hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Production Project</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 1. PROJECT METRICS SUMMARY CARDS                     */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Ngân Sách Token</span>
            <p className="text-2xl font-black text-amber-300 mt-2 font-mono">{project.total_budget_tokens} Tokens</p>
            <p className="text-xs text-slate-400 mt-1.5">Hạn mức tối đa cấp phép cho cả mùa</p>
          </div>

          <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quota Đã Phê Duyệt</span>
            <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">{project.allocated_tokens} Tokens</p>
            <p className="text-xs text-slate-400 mt-1.5">Đã gán cho {project.episodes.filter((e) => e.quota_allocated > 0).length} tập phim</p>
          </div>

          <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kế Hoạch Chờ Duyệt</span>
            <p className="text-2xl font-black text-neon-light mt-2 font-mono">
              {project.episodes.filter((e) => e.status === 'PLAN_PENDING').length} Kế hoạch
            </p>
            <p className="text-xs text-slate-400 mt-1.5">Cần Reviewer kiểm tra & cấp Quota</p>
          </div>

          <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tập Chờ Kiểm Định Pháp Lý</span>
            <p className="text-2xl font-black text-ruby-light mt-2 font-mono">
              {project.episodes.filter((e) => e.status === 'EPISODE_SUBMITTED').length} Tập
            </p>
            <p className="text-xs text-slate-400 mt-1.5">Đã render xong, chờ audit Điều 44</p>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 2. PLAN REVIEW & QUOTA ALLOCATION PANEL              */}
        {/* ==================================================== */}
        <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-neon" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Thẩm Định Kế Hoạch Sản Xuất (Review Production Plan)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tập đang chọn: <b className="text-white">{currentPackage?.title}</b> (Trạng thái: <span className="text-amber-300 font-mono">{currentPackage?.status}</span>)
              </p>
            </div>

            {/* Checker Decision Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Request Plan Changes</span>
              </button>

              <button
                onClick={() => setIsQuotaModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Allocate AI Quota</span>
              </button>
            </div>
          </div>

          {/* Brief Overview Viewer */}
          {brief ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-[#0E1017] p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tóm Tắt Cốt Truyện (Synopsis)
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed">{brief.synopsis}</p>
                </div>

                <div className="bg-[#0E1017] p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Kịch Bản Chi Tiết (Overview Script)
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">{brief.overview_script}</p>
                </div>

                {/* Storyboard summary */}
                <div className="bg-[#0E1017] p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold text-neon-light uppercase tracking-wider block">
                    Ghi Chú Storyboard & Phong Cách Thị Giác
                  </span>
                  <p className="text-xs text-slate-300 font-mono">{brief.storyboard_summary}</p>
                </div>
              </div>

              {/* Side Specs Box */}
              <div className="bg-[#0E1017] p-4 rounded-xl border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                  Dự Toán Ngân Sách Kế Hoạch
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Thời lượng dự kiến:</span>
                    <span className="font-mono font-bold text-white">{brief.target_duration_minutes} Phút</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Số lượng phân cảnh:</span>
                    <span className="font-mono font-bold text-white">{brief.scene_count} Cảnh</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Dự toán Token (Creator):</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">{brief.estimated_tokens} Tokens</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Quota chính thức:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {currentPackage.quota_allocated > 0 ? `${currentPackage.quota_allocated} Tokens` : 'Chưa cấp'}
                    </span>
                  </div>
                </div>

                {currentPackage.status === 'QUOTA_ALLOCATED' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Đã cấp hạn mức cho Creator vào Studio AI sản xuất.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Chưa có kế hoạch sản xuất nào được gửi.</p>
          )}

          {/* Scene Breakdown Table */}
          {brief?.scene_breakdown && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Danh Sách Phân Cảnh Kịch Bản ({brief.scene_breakdown.length} Cảnh)
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {brief.scene_breakdown.map((scene, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0E1017] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-ruby/20 border border-ruby/40 text-ruby-light font-bold font-mono">
                        CẢNH {scene.scene_number}
                      </span>
                      <div>
                        <h5 className="font-bold text-white">{scene.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">{scene.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 font-mono">
                      <span>Thời lượng: <b className="text-white">{scene.target_duration_sec}s</b></span>
                      <span>Dự toán: <b className="text-amber-300">{scene.estimated_tokens} Tokens</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* 3. EPISODES AUDIT & COMPLIANCE TABLE                 */}
        {/* ==================================================== */}
        <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Danh Sách Tập Phim Chờ Thẩm Định Nội Dung & Pháp Lý</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem bản dựng video hoàn chỉnh, kiểm tra tuân thủ Điều 44 Luật AI & lên lịch công chiếu
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {project.episodes.map((ep) => {
              const hasVideo = ep.status === 'EPISODE_SUBMITTED' || ep.status === 'COMPLIANCE_PASSED' || ep.status === 'PUBLISHED';

              return (
                <div
                  key={ep.id}
                  className="p-4 rounded-xl bg-[#0E1017] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={ep.thumbnail_url}
                      alt={ep.title}
                      className="w-16 h-10 rounded-lg object-cover bg-slate-800 border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-ruby-light">Tập {ep.episode_number}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <h4 className="text-sm font-bold text-white">{ep.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                        <span>Tokens thực tế: <b className="text-emerald-400">{ep.actual_tokens_used}</b> / {ep.quota_allocated}</span>
                        <span>•</span>
                        <span>Trạng thái: <b className="text-white uppercase">{ep.status}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Action Button */}
                  <div>
                    {hasVideo ? (
                      <Link
                        href={`/(dashboard)/reviewer/audit/${ep.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-dark to-neon text-white text-xs font-bold shadow-md shadow-neon/20 hover:scale-105 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Mở Trạm Thẩm Định & Xuất Bản</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Chưa nộp bản dựng</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ALLOCATE QUOTA MODAL                                 */}
      {/* ==================================================== */}
      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Phê Duyệt & Cấp AI Token Quota</h3>
              </div>
              <button onClick={() => setIsQuotaModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Xác nhận cấp hạn ngạch AI Tokens chính thức cho <b>{currentPackage?.title}</b>. Creator sẽ được mở khóa AI Studio để bắt đầu sinh video clip.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Số Lượng Tokens Cấp Phép</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quotaToAllocate}
                    onChange={(e) => setQuotaToAllocate(Number(e.target.value))}
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold font-mono focus:border-emerald-400 outline-none"
                  />
                  <span className="font-mono text-slate-400">Tokens</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Ghi Chú Phê Duyệt</label>
                <textarea
                  value={quotaNotes}
                  onChange={(e) => setQuotaNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0E1017] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsQuotaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAllocateQuotaConfirm}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                Xác Nhận Cấp Quota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* REQUEST PLAN CHANGES MODAL                           */}
      {/* ==================================================== */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold">Yêu Cầu Chỉnh Sửa Kế Hoạch</h3>
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Nhập chi tiết các điểm Creator cần sửa đổi trước khi kế hoạch được phê duyệt và cấp quota.
            </p>

            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Nội Dung Phản Hồi (Feedback Notes)</label>
              <textarea
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                rows={4}
                className="w-full bg-[#0E1017] border border-red-500/30 rounded-xl p-3 text-xs text-white focus:border-red-500 outline-none"
                placeholder="Ghi rõ lý do và khuyến nghị chỉnh sửa..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleRequestChangesConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-900/30 transition-all cursor-pointer"
              >
                Gửi Yêu Cầu Sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* CREATE PROJECT MODAL                                 */}
      {/* ==================================================== */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-white/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-neon" />
                <h3 className="text-base font-bold">Khởi Tạo Dự Án Sản Xuất Mới</h3>
              </div>
              <button onClick={() => setIsCreateProjectModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Tên Dự Án Phim</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Ví dụ: Kỷ Nguyên Vô Tận: Cyber Saigon 2077..."
                  className="w-full bg-[#0E1017] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-neon outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Số Lượng Tập</label>
                  <input
                    type="number"
                    value={newEpisodesCount}
                    onChange={(e) => setNewEpisodesCount(Number(e.target.value))}
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-neon outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Tổng Budget Tokens</label>
                  <input
                    type="number"
                    value={newBudgetTokens}
                    onChange={(e) => setNewBudgetTokens(Number(e.target.value))}
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold font-mono focus:border-neon outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Hạn Chót Kế Hoạch (Deadline)</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-neon outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Dự Kiến Công Chiếu</label>
                  <input
                    type="date"
                    value={newReleaseDate}
                    onChange={(e) => setNewReleaseDate(e.target.value)}
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-neon outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCreateProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateProject}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-neon-dark to-neon text-white text-xs font-bold shadow-lg shadow-neon/30 transition-all cursor-pointer"
              >
                Tạo Dự Án Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
