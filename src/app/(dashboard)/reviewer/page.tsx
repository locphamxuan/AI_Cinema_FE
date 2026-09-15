'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useAppStore } from '@/store/useAppStore';
import { RoleNavHeader } from '@/components/dashboard/RoleNavHeader';
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
  LayoutDashboard,
  CheckSquare,
  BadgeCheck,
  Tv,
  ExternalLink,
  ChevronRight,
  AlertCircle
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
  const { user, isAuthenticated, logout } = useAppStore();

  const currentPackage = project.episodes.find((e) => e.id === activePackageId) || project.episodes[0];
  const brief = currentPackage?.brief;

  // Active Tab: 'overview' | 'plans' | 'audits' | 'projects' | 'tokens'
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'audits' | 'projects' | 'tokens'>('overview');

  // New Project Modal State
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Khoa học viễn tưởng, AI Action');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newEpisodes, setNewEpisodes] = useState(5);
  const [newBudgetTokens, setNewBudgetTokens] = useState(3000);
  const [newDeadline, setNewDeadline] = useState('2026-12-31');
  const [newReleaseDate, setNewReleaseDate] = useState('2027-01-15');

  // Review & Quota Modal States
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [quotaToAllocate, setQuotaToAllocate] = useState(brief?.estimated_tokens || 450);
  const [quotaNotes, setQuotaNotes] = useState('Kế hoạch phân cảnh đạt chuẩn. Đã cấp đủ hạn mức AI Tokens.');
  const [rejectFeedback, setRejectFeedback] = useState('');

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createProject({
      title: newTitle,
      genre: newGenre.split(',').map((g) => g.trim()),
      synopsis: newSynopsis,
      total_episodes: Number(newEpisodes),
      total_budget_tokens: Number(newBudgetTokens),
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

  const pendingPlanEpisodes = project.episodes.filter((e) => e.status === 'PLAN_PENDING');
  const submittedEpisodes = project.episodes.filter((e) => e.status === 'EPISODE_SUBMITTED' || e.status === 'COMPLIANCE_PASSED');

  // Access Control: Block Creator from accessing Reviewer Portal directly
  if (isAuthenticated && user?.role === 'creator') {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#161922] border border-amber-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Không đúng quyền truy cập</h2>
            <p className="text-sm text-slate-400">
              Tài khoản hiện tại của bạn là <strong className="text-ruby-light">Creator (Maker)</strong>. Trang này chỉ dành riêng cho vai trò <strong className="text-purple-400">Reviewer (Checker)</strong> để thẩm định và cấp hạn mức Token.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/creator')}
              className="w-full py-3 px-4 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-ruby/30"
            >
              <span>Về Studio Sáng tạo (Creator)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-semibold transition cursor-pointer"
            >
              Đăng xuất & Đăng nhập tài khoản Reviewer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <RoleNavHeader />

      {/* Main Layout Body: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR NAVIGATION                                                   */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-72 bg-[#12151E] border-r border-white/10 flex flex-col shrink-0">
          {/* Episode Quick Switcher */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" /> Tập Phim Cần Duyệt
              </span>
              <span className="text-[10px] font-mono text-neon-light">{project.episodes.length} Tập</span>
            </div>

            <div className="space-y-1.5">
              {project.episodes.map((ep) => {
                const isSelected = ep.id === currentPackage?.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => setActivePackage(ep.id)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/50 text-white shadow-md shadow-[#8B5CF6]/10'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <Film className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#8B5CF6]' : 'text-slate-500'}`} />
                        <span className="truncate">{ep.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {ep.status}
                      </div>
                    </div>

                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        ep.status === 'PUBLISHED'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                          : ep.status === 'EPISODE_SUBMITTED'
                          ? 'bg-purple-400 animate-pulse'
                          : ep.status === 'PLAN_PENDING'
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4 space-y-1.5 flex-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Chức Năng Checker
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-700 to-[#8B5CF6] text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng Quan Thẩm Định</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-gradient-to-r from-purple-700 to-[#8B5CF6] text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Duyệt Kế Hoạch & Quota</span>
              </div>
              {pendingPlanEpisodes.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {pendingPlanEpisodes.length} chờ
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audits')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'audits'
                  ? 'bg-gradient-to-r from-purple-700 to-[#8B5CF6] text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>Kiểm Định Video & Pháp Lý</span>
              </div>
              {submittedEpisodes.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {submittedEpisodes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-gradient-to-r from-purple-700 to-[#8B5CF6] text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Film className="w-4 h-4 text-blue-400" />
                <span>Quản Lý Dự Án</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'tokens'
                  ? 'bg-gradient-to-r from-purple-700 to-[#8B5CF6] text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Ngân Sách AI Tokens</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">
                {project.allocated_tokens}/{project.total_budget_tokens}
              </span>
            </button>
          </nav>

          {/* Bottom Sidebar Action */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-neon" /> Khởi Tạo Dự Án Mới
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT DYNAMIC CONTENT AREA                                                */}
        {/* ========================================================================= */}
        <main className="flex-1 bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Trung Tâm Thẩm Định</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#8B5CF6] font-semibold">{project.title}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-200 capitalize">{activeTab}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {activeTab === 'overview'
                  ? 'Bảng Điều Khiển Thẩm Định Tổng Thể'
                  : activeTab === 'plans'
                  ? 'Thẩm Định Kịch Bản & Cấp AI Token Quota'
                  : activeTab === 'audits'
                  ? 'Kiểm Định Tuân Thủ Pháp Lý AI & Phát Hành'
                  : activeTab === 'projects'
                  ? 'Thông Tin & Cấu Hình Dự Án Sản Xuất'
                  : 'Phân Bổ Ngân Sách AI Tokens'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4bf0] text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-900/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tạo Dự Án Mới
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kế Hoạch Chờ Duyệt</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-300 mt-2">
                    {pendingPlanEpisodes.length} Tập
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Cần xem xét Content Brief</p>
                </div>

                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Video Chờ Kiểm Toán</span>
                    <BadgeCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-black text-purple-300 mt-2">
                    {submittedEpisodes.length} Tập
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Đã render xong trong Studio</p>
                </div>

                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quota Đã Phân Bổ</span>
                    <Zap className="w-4 h-4 text-neon" />
                  </div>
                  <p className="text-2xl font-black text-white mt-2">
                    {project.allocated_tokens} <span className="text-xs font-normal text-slate-400">/ {project.total_budget_tokens} T</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Maker đã dùng: <strong className="text-amber-300">{project.consumed_tokens} T</strong>
                  </p>
                </div>

                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã Lên Sóng OTT</span>
                    <Tv className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-emerald-400 mt-2">
                    {project.episodes.filter((e) => e.status === 'PUBLISHED').length} Tập
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Đạt chuẩn Điều 44 & NĐ 142</p>
                </div>
              </div>

              {/* Episode Review Cards Grid */}
              <div className="bg-[#161922] rounded-2xl border border-white/10 p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" /> Danh Sách Gói Phim Cần Thẩm Định
                  </h3>
                  <span className="text-xs text-slate-400">Hàng đợi kiểm toán realtime</span>
                </div>

                <div className="space-y-3">
                  {project.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/15 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center font-bold text-white shrink-0">
                          #{ep.episode_number}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{ep.title}</h4>
                          <p className="text-xs text-slate-400">
                            Thời lượng: {ep.total_duration} · Tiêu thụ: {ep.actual_tokens_used}/{ep.quota_allocated} Tokens
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          ep.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : ep.status === 'EPISODE_SUBMITTED'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : ep.status === 'PLAN_PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {ep.status}
                        </span>

                        {ep.status === 'PLAN_PENDING' && (
                          <button
                            onClick={() => {
                              setActivePackage(ep.id);
                              setActiveTab('plans');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition"
                          >
                            Duyệt Kế Hoạch ➔
                          </button>
                        )}

                        {(ep.status === 'EPISODE_SUBMITTED' || ep.status === 'COMPLIANCE_PASSED') && (
                          <Link
                            href={`/reviewer/audit/${ep.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7c4bf0] text-white font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <BadgeCheck className="w-3.5 h-3.5" /> Kiểm Định & Phát Hành ➔
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLAN REVIEWS & QUOTA ALLOCATION */}
          {activeTab === 'plans' && (
            <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    Thẩm Định Kịch Bản & Cấp AI Token Quota
                  </h2>
                  <p className="text-xs text-slate-400">Đang thẩm định: <strong className="text-white">{currentPackage?.title}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-red-400 text-xs font-bold transition"
                  >
                    Yêu Cầu Chỉnh Sửa Kế Hoạch
                  </button>
                  <button
                    onClick={() => setIsQuotaModalOpen(true)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Phê Duyệt & Cấp Quota AI
                  </button>
                </div>
              </div>

              {brief ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tóm Tắt Cốt Truyện (Synopsis)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{brief.synopsis}</p>
                    </div>

                    <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Kịch Bản Chi Tiết (Overview Script)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{brief.overview_script}</p>
                    </div>

                    {/* Scene Breakdown Table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Phân Tích Từng Phân Cảnh ({brief.scene_breakdown.length} Cảnh):
                      </h4>
                      {brief.scene_breakdown.map((sc) => (
                        <div key={sc.scene_number} className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs space-y-1.5">
                          <div className="flex justify-between items-center font-bold text-white">
                            <span className="text-neon-light">Cảnh {sc.scene_number}: {sc.title}</span>
                            <span className="text-amber-400 font-mono">{sc.estimated_tokens} Tokens · {sc.target_duration_sec}s</span>
                          </div>
                          <p className="text-slate-300">{sc.description}</p>
                          <div className="text-[11px] text-slate-400 font-mono bg-black/40 p-2 rounded">
                            Visual: {sc.visual_prompt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                      Dự Toán Ngân Sách
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thời lượng dự kiến:</span>
                        <span className="font-bold text-white">{brief.target_duration_minutes} Phút</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tokens đề xuất:</span>
                        <span className="font-bold text-amber-400 font-mono">{brief.estimated_tokens} Tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Trạng thái duyệt:</span>
                        <span className="font-bold text-white">{currentPackage?.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tập phim này chưa được nộp bản kế hoạch Content Brief.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VIDEO AUDITS & COMPLIANCE */}
          {activeTab === 'audits' && (
            <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Trạm Kiểm Định Tuân Thủ & Phát Hành</h2>
                  <p className="text-xs text-slate-400">Kiểm tra Điều 44 Luật AI, Nghị định 142 và phát hành OTT</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.episodes.map((ep) => (
                  <div key={ep.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Tập {ep.episode_number}: {ep.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : ep.status === 'EPISODE_SUBMITTED'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ep.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Thời lượng: {ep.total_duration} · Token đã dùng: {ep.actual_tokens_used} Tokens
                    </p>

                    <Link
                      href={`/reviewer/audit/${ep.id}`}
                      className="w-full py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4bf0] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <BadgeCheck className="w-3.5 h-3.5" /> Mở Trạm Kiểm Định Chi Tiết ➔
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS MANAGEMENT */}
          {activeTab === 'projects' && (
            <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-black text-white">Dự Án: {project.title}</h2>
                  <p className="text-xs text-slate-400">Quản lý ngân sách, thể loại và đạo diễn sản xuất</p>
                </div>
                <button
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Tạo Dự Án Mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-slate-400 font-bold block">Tóm tắt dự án:</span>
                  <p className="text-slate-200 leading-relaxed">{project.synopsis}</p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-slate-400 font-bold block">Thông tin phân quyền:</span>
                  <p className="text-slate-300">Creator (Maker): <strong className="text-white">{project.creator_name}</strong></p>
                  <p className="text-slate-300">Reviewer (Checker): <strong className="text-white">{project.reviewer_name}</strong></p>
                  <p className="text-slate-300">Hạn chót sản xuất: <strong className="text-amber-400">{project.deadline}</strong></p>
                  <p className="text-slate-300">Kế hoạch công chiếu: <strong className="text-emerald-400">{project.planned_release_date}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TOKEN BUDGET */}
          {activeTab === 'tokens' && (
            <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-black text-white">Ngân Sách AI Tokens Toàn Dự Án</h2>
                  <p className="text-xs text-slate-400">Kiểm soát dòng tiêu thụ tài nguyên AI trong quá trình sản xuất</p>
                </div>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {project.allocated_tokens} / {project.total_budget_tokens} Tokens
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Hạn mức đã cấp phát:</span>
                  <span className="font-bold">{((project.allocated_tokens / project.total_budget_tokens) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-dark to-neon"
                    style={{ width: `${(project.allocated_tokens / project.total_budget_tokens) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Allocate Quota Modal */}
      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#161922] border border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cấp Phép Token Quota</h3>
                <p className="text-xs text-slate-400">{currentPackage?.title}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Số Token cấp phát:</label>
              <input
                type="number"
                value={quotaToAllocate}
                onChange={(e) => setQuotaToAllocate(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi chú thẩm định:</label>
              <textarea
                rows={3}
                value={quotaNotes}
                onChange={(e) => setQuotaNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleAllocateQuotaConfirm}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-900/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Xác Nhận Cấp Quota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject & Request Changes Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#161922] border border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yêu Cầu Hiệu Chỉnh Kế Hoạch</h3>
                <p className="text-xs text-slate-400">Trả về cho Maker bổ sung kịch bản</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lý do & hướng dẫn:</label>
              <textarea
                rows={4}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Ví dụ: Kịch bản phân cảnh 2 chưa có prompt âm thanh rõ ràng, vui lòng bổ sung..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRequestChangesConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" /> Gửi Yêu Cầu Sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#161922] border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Khởi Tạo Dự Án Phim AI Mới</h3>
            <form onSubmit={handleCreateProjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tên Dự Án:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Cyber Saigon 2077..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Số Tập:</label>
                  <input
                    type="number"
                    value={newEpisodes}
                    onChange={(e) => setNewEpisodes(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Ngân Sách AI Tokens:</label>
                  <input
                    type="number"
                    value={newBudgetTokens}
                    onChange={(e) => setNewBudgetTokens(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white text-xs font-bold"
                >
                  Tạo Dự Án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
