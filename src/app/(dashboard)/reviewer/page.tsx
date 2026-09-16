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
  FileText,
  Clock,
  LayoutDashboard,
  CheckSquare,
  BadgeCheck,
  Tv,
  ChevronRight,
  AlertCircle,
  Film,
  Send,
  ArrowRight
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
  const { user, isAuthenticated, logout, openAuthModal } = useAppStore();

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
  const [quotaToAllocate, setQuotaToAllocate] = useState(currentPackage?.quota_allocated || 500);
  const [quotaNotes, setQuotaNotes] = useState('Đạt tiêu chuẩn nội dung. Cấp phép hạn mức Token sản xuất.');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createProject({
      title: newTitle,
      genre: [newGenre],
      synopsis: newSynopsis || 'Dự án điện ảnh ứng dụng công nghệ GenAI thế hệ mới.',
      total_episodes: newEpisodes,
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

  const pendingPlanEpisodes = project.episodes.filter((e) => e.status === 'PLAN_PENDING');
  const submittedEpisodes = project.episodes.filter((e) => e.status === 'EPISODE_SUBMITTED' || e.status === 'COMPLIANCE_PASSED');

  // Access Control: Block Creator from accessing Reviewer Portal directly
  if (isAuthenticated && user?.role === 'creator') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Không đúng quyền truy cập</h2>
            <p className="text-sm text-slate-600">
              Tài khoản hiện tại của bạn là <strong className="text-ruby">Creator (Maker)</strong>. Trang này chỉ dành riêng cho vai trò <strong className="text-purple-600">Reviewer (Checker)</strong> để thẩm định và cấp hạn mức Token.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/creator')}
              className="w-full py-3 px-4 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-ruby/20"
            >
              <span>Về Studio Sáng tạo (Creator)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/');
                openAuthModal('login');
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              Đăng xuất & Đăng nhập tài khoản Reviewer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <RoleNavHeader />

      {/* Main Layout Body: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR NAVIGATION                                                   */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Episode Quick Switcher */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
              <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Tập Phim Cần Duyệt
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{project.episodes.length} Tập</span>
            </div>

            <div className="space-y-1">
              {project.episodes.map((ep) => {
                const isSelected = ep.id === currentPackage?.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => setActivePackage(ep.id)}
                    className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 border-l-2 border-purple-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                        <Film className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{ep.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {ep.status}
                      </div>
                    </div>

                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        ep.status === 'PUBLISHED'
                          ? 'bg-emerald-500'
                          : ep.status === 'EPISODE_SUBMITTED'
                          ? 'bg-purple-500 animate-pulse'
                          : ep.status === 'PLAN_PENDING'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-3 space-y-1 flex-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 pt-2">
              Menu Thẩm Định
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng Quan Thẩm Định</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-amber-500" />
                <span>Duyệt Kế Hoạch & Quota</span>
              </div>
              {pendingPlanEpisodes.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  {pendingPlanEpisodes.length} chờ
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audits')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeTab === 'audits'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>Kiểm Định Video & Pháp Lý</span>
              </div>
              {submittedEpisodes.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                  {submittedEpisodes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4 text-blue-600" />
                <span>Quản Lý Dự Án</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeTab === 'tokens'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Ngân Sách AI Tokens</span>
              </div>
              <span className="text-[10px] text-amber-700 font-mono">
                {project.allocated_tokens}/{project.total_budget_tokens}
              </span>
            </button>
          </nav>

          {/* Bottom Sidebar Action */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/70">
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" /> Khởi Tạo Dự Án Mới
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT DYNAMIC CONTENT AREA                                                */}
        {/* ========================================================================= */}
        <main className="flex-1 bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Trung Tâm Thẩm Định</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-purple-600 font-semibold">{project.title}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-700 font-medium capitalize">{activeTab}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {activeTab === 'overview'
                  ? 'Bảng Điều Khiển Thẩm Định Tổng Thể'
                  : activeTab === 'plans'
                  ? 'Thẩm Định Kịch Bản & Cấp AI Token Quota'
                  : activeTab === 'audits'
                  ? 'Kiểm Định Tuân Thủ & Pháp Lý Video'
                  : activeTab === 'projects'
                  ? 'Cấu Hình & Quản Lý Dự Án'
                  : 'Kiểm Soát Ngân Sách AI Tokens'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-purple-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tạo Dự Án Mới
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kế Hoạch Chờ Duyệt</span>
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-xl font-bold font-mono text-amber-600 mt-2.5">
                    {pendingPlanEpisodes.length} <span className="text-xs font-sans font-normal text-slate-500">Tập</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Cần xem xét Content Brief</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Video Chờ Kiểm Toán</span>
                    <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                      <BadgeCheck className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xl font-bold font-mono text-purple-600 mt-2.5">
                    {submittedEpisodes.length} <span className="text-xs font-sans font-normal text-slate-500">Tập</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Đã hoàn thành phân cảnh AI</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quota Đã Phân Bổ</span>
                    <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-2.5">
                    <span className="text-xl font-bold font-mono text-slate-900">{project.allocated_tokens}</span>
                    <span className="text-xs text-slate-500 font-mono">/ {project.total_budget_tokens} T</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Maker đã dùng: <span className="text-amber-600 font-mono font-medium">{project.consumed_tokens} T</span>
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Đã Lên Sóng OTT</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <Tv className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-xl font-bold font-mono text-emerald-600 mt-2.5">
                    {project.episodes.filter((e) => e.status === 'PUBLISHED').length} <span className="text-xs font-sans font-normal text-slate-500">Tập</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Đạt chuẩn Điều 44 & NĐ 142</p>
                </div>
              </div>

              {/* Episode Review Cards Grid */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" /> Danh Sách Gói Phim Cần Thẩm Định
                  </h3>
                  <span className="text-xs text-slate-500">Hàng đợi kiểm toán realtime</span>
                </div>

                <div className="space-y-3">
                  {project.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 shrink-0 shadow-xs">
                          #{ep.episode_number}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{ep.title}</h4>
                          <p className="text-xs text-slate-500">
                            Thời lượng: {ep.total_duration} · Tiêu thụ: {ep.actual_tokens_used}/{ep.quota_allocated} Tokens
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          ep.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ep.status === 'EPISODE_SUBMITTED'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : ep.status === 'PLAN_PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {ep.status}
                        </span>

                        {ep.status === 'PLAN_PENDING' && (
                          <button
                            onClick={() => {
                              setActivePackage(ep.id);
                              setActiveTab('plans');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                          >
                            Duyệt Kế Hoạch ➔
                          </button>
                        )}

                        {(ep.status === 'EPISODE_SUBMITTED' || ep.status === 'COMPLIANCE_PASSED') && (
                          <Link
                            href={`/reviewer/audit/${ep.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
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
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    Thẩm Định Kịch Bản & Cấp AI Token Quota
                  </h2>
                  <p className="text-xs text-slate-500">Đang thẩm định: <strong className="text-slate-900">{currentPackage?.title}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 text-xs font-bold transition cursor-pointer"
                  >
                    Yêu Cầu Chỉnh Sửa Kế Hoạch
                  </button>
                  <button
                    onClick={() => setIsQuotaModalOpen(true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Phê Duyệt & Cấp Quota AI
                  </button>
                </div>
              </div>

              {brief ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Tóm Tắt Cốt Truyện (Synopsis)
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">{brief.synopsis}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Kịch Bản Chi Tiết (Overview Script)
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">{brief.overview_script}</p>
                    </div>

                    {/* Scene Breakdown Table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Phân Tích Từng Phân Cảnh ({brief.scene_breakdown.length} Cảnh):
                      </h4>
                      {brief.scene_breakdown.map((sc) => (
                        <div key={sc.scene_number} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex justify-between items-center font-bold text-slate-900">
                            <span className="text-purple-700">Cảnh {sc.scene_number}: {sc.title}</span>
                            <span className="text-amber-600 font-mono">{sc.estimated_tokens} Tokens · {sc.target_duration_sec}s</span>
                          </div>
                          <p className="text-slate-700">{sc.description}</p>
                          <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200">
                            Visual: {sc.visual_prompt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Dự Toán Ngân Sách
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thời lượng dự kiến:</span>
                        <span className="font-bold text-slate-800">{brief.target_duration_minutes} Phút</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tokens đề xuất:</span>
                        <span className="font-bold text-amber-600 font-mono">{brief.estimated_tokens} Tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trạng thái duyệt:</span>
                        <span className="font-bold text-slate-800">{currentPackage?.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  Tập phim này chưa được nộp bản kế hoạch Content Brief.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VIDEO AUDITS & COMPLIANCE */}
          {activeTab === 'audits' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Trạm Kiểm Định Tuân Thủ & Phát Hành</h2>
                  <p className="text-xs text-slate-500">Kiểm tra Điều 44 Luật AI, Nghị định 142 và phát hành OTT</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.episodes.map((ep) => (
                  <div key={ep.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Tập {ep.episode_number}: {ep.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        ep.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ep.status === 'EPISODE_SUBMITTED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {ep.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Thời lượng: {ep.total_duration} · Token đã dùng: {ep.actual_tokens_used} Tokens
                    </p>

                    <Link
                      href={`/reviewer/audit/${ep.id}`}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
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
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Dự Án: {project.title}</h2>
                  <p className="text-xs text-slate-500">Quản lý ngân sách, thể loại và đạo diễn sản xuất</p>
                </div>
                <button
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Tạo Dự Án Mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-slate-700 font-bold block">Tóm tắt dự án:</span>
                  <p className="text-slate-600 leading-relaxed">{project.synopsis}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-slate-700 font-bold block">Thông tin phân quyền:</span>
                  <p className="text-slate-600">Creator (Maker): <strong className="text-slate-900">{project.creator_name}</strong></p>
                  <p className="text-slate-600">Reviewer (Checker): <strong className="text-slate-900">{project.reviewer_name}</strong></p>
                  <p className="text-slate-600">Hạn chót sản xuất: <strong className="text-amber-600">{project.deadline}</strong></p>
                  <p className="text-slate-600">Kế hoạch công chiếu: <strong className="text-emerald-600">{project.planned_release_date}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TOKEN BUDGET */}
          {activeTab === 'tokens' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Ngân Sách AI Tokens Toàn Dự Án</h2>
                  <p className="text-xs text-slate-500">Kiểm soát dòng tiêu thụ tài nguyên AI trong quá trình sản xuất</p>
                </div>
                <span className="text-sm font-mono font-bold text-amber-600">
                  {project.allocated_tokens} / {project.total_budget_tokens} Tokens
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Hạn mức đã cấp phát:</span>
                  <span className="font-bold font-mono">{((project.allocated_tokens / project.total_budget_tokens) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cấp Phép Token Quota</h3>
                <p className="text-xs text-slate-500">{currentPackage?.title}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số Token cấp phát:</label>
              <input
                type="number"
                value={quotaToAllocate}
                onChange={(e) => setQuotaToAllocate(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-amber-600 font-mono font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú thẩm định:</label>
              <textarea
                rows={3}
                value={quotaNotes}
                onChange={(e) => setQuotaNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleAllocateQuotaConfirm}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-200 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Xác Nhận Cấp Quota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject & Request Changes Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Yêu Cầu Hiệu Chỉnh Kế Hoạch</h3>
                <p className="text-xs text-slate-500">Trả về cho Maker bổ sung kịch bản</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lý do & hướng dẫn:</label>
              <textarea
                rows={4}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Ví dụ: Kịch bản phân cảnh 2 chưa có prompt âm thanh rõ ràng, vui lòng bổ sung..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRequestChangesConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-rose-200"
              >
                <Send className="w-3.5 h-3.5" /> Gửi Yêu Cầu Sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Khởi Tạo Dự Án Phim AI Mới</h3>
            <form onSubmit={handleCreateProjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Tên Dự Án:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Cyber Saigon 2077..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Số Tập:</label>
                  <input
                    type="number"
                    value={newEpisodes}
                    onChange={(e) => setNewEpisodes(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Ngân Sách AI Tokens:</label>
                  <input
                    type="number"
                    value={newBudgetTokens}
                    onChange={(e) => setNewBudgetTokens(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white text-xs font-bold cursor-pointer"
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
