'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useAppStore } from '@/store/useAppStore';
import { RoleNavHeader } from '@/components/dashboard/RoleNavHeader';
import {
  Film,
  Zap,
  Clock,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Play,
  ArrowRight,
  Video,
  Layers,
  LayoutDashboard,
  Clapperboard,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const {
    project,
    activePackageId,
    setActivePackage,
    updateContentBrief,
    submitProductionPlan,
    reviseProductionPlan,
    reviews,
  } = useWorkflowStore();
  const { user, isAuthenticated, logout, openAuthModal } = useAppStore();

  const currentPackage = project.episodes.find((e) => e.id === activePackageId) || project.episodes[0];
  const brief = currentPackage?.brief;

  // Active Tab: 'overview' | 'brief' | 'studio' | 'tokens' | 'reviews'
  const [activeTab, setActiveTab] = useState<'overview' | 'brief' | 'studio' | 'tokens' | 'reviews'>('overview');

  // Local editable brief form state
  const [synopsis, setSynopsis] = useState(brief?.synopsis || '');
  const [overviewScript, setOverviewScript] = useState(brief?.overview_script || '');
  const [targetDuration, setTargetDuration] = useState(brief?.target_duration_minutes || 40);
  const [estimatedTokens, setEstimatedTokens] = useState(brief?.estimated_tokens || 480);
  const [storyboardSummary, setStoryboardSummary] = useState(brief?.storyboard_summary || '');
  const [scenes, setScenes] = useState(brief?.scene_breakdown || []);

  const [isSaved, setIsSaved] = useState(false);

  // Sync state when active episode changes
  React.useEffect(() => {
    if (brief) {
      setSynopsis(brief.synopsis);
      setOverviewScript(brief.overview_script);
      setTargetDuration(brief.target_duration_minutes);
      setEstimatedTokens(brief.estimated_tokens);
      setStoryboardSummary(brief.storyboard_summary);
      setScenes(brief.scene_breakdown);
    }
  }, [activePackageId, brief]);

  // Quota calculation
  const quotaPercent = project.allocated_tokens > 0 ? (project.consumed_tokens / project.allocated_tokens) * 100 : 0;
  const isQuotaWarning = quotaPercent >= 90;

  // Feedback review if changes requested
  const latestFeedback = reviews.filter((r) => r.episode_package_id === currentPackage?.id && r.decision === 'changes_requested')[0];
  const episodeReviews = reviews.filter((r) => r.episode_package_id === currentPackage?.id);

  const handleAddScene = () => {
    const nextNum = scenes.length + 1;
    const newScene = {
      scene_number: nextNum,
      title: `Phân Cảnh Mới #${nextNum}`,
      description: 'Mô tả bối cảnh và diễn biến phân cảnh...',
      target_duration_sec: 15,
      estimated_tokens: 60,
      visual_prompt: 'Cinematic lighting, high detailed scene.',
      audio_prompt: 'Voiceover and ambient SFX sound.',
    };
    const updated = [...scenes, newScene];
    setScenes(updated);
    setEstimatedTokens(updated.reduce((sum, s) => sum + s.estimated_tokens, 0));
  };

  const handleRemoveScene = (index: number) => {
    const updated = scenes.filter((_, i) => i !== index).map((s, i) => ({ ...s, scene_number: i + 1 }));
    setScenes(updated);
    setEstimatedTokens(updated.reduce((sum, s) => sum + s.estimated_tokens, 0));
  };

  const handleSceneChange = (index: number, field: string, value: any) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: value };
    setScenes(updated);
    if (field === 'estimated_tokens') {
      setEstimatedTokens(updated.reduce((sum, s) => sum + Number(s.estimated_tokens || 0), 0));
    }
  };

  const handleSaveDraft = () => {
    if (!currentPackage) return;
    updateContentBrief(currentPackage.id, {
      synopsis,
      overview_script: overviewScript,
      target_duration_minutes: targetDuration,
      estimated_tokens: estimatedTokens,
      storyboard_summary: storyboardSummary,
      scene_breakdown: scenes,
      scene_count: scenes.length,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSubmitPlan = () => {
    if (!currentPackage) return;
    handleSaveDraft();
    if (currentPackage.status === 'CHANGES_REQUESTED') {
      reviseProductionPlan(currentPackage.id, {
        synopsis,
        overview_script: overviewScript,
        target_duration_minutes: targetDuration,
        estimated_tokens: estimatedTokens,
        storyboard_summary: storyboardSummary,
        scene_breakdown: scenes,
      });
      alert('Đã nộp bản kế hoạch hiệu chỉnh lên Reviewer (Checker) để duyệt và cấp lại Quota!');
    } else {
      submitProductionPlan(currentPackage.id);
      alert('Đã nộp Kế hoạch Sản xuất lên Thẩm định viên (Reviewer) để phê duyệt và cấp Token Quota!');
    }
  };

  const canEnterStudio =
    currentPackage?.status === 'QUOTA_ALLOCATED' ||
    currentPackage?.status === 'IN_PRODUCTION' ||
    currentPackage?.status === 'EPISODE_SUBMITTED' ||
    currentPackage?.status === 'COMPLIANCE_PASSED' ||
    currentPackage?.status === 'PUBLISHED';

  const completedJobsCount = currentPackage?.jobs?.filter((j) => j.status === 'completed').length || 0;
  const totalJobsCount = currentPackage?.jobs?.length || 0;

  // Access Control: Block Reviewer from accessing Creator Studio directly
  if (isAuthenticated && user?.role === 'reviewer') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Không đúng quyền truy cập</h2>
            <p className="text-sm text-slate-600">
              Tài khoản hiện tại của bạn là <strong className="text-purple-600">Reviewer (Checker)</strong>. Trang này chỉ dành riêng cho vai trò <strong className="text-ruby">Creator (Maker)</strong>.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/reviewer')}
              className="w-full py-3 px-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-200"
            >
              <span>Đến trang Thẩm định (Reviewer)</span>
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
              Đăng xuất & Đăng nhập tài khoản Creator
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
                <Layers className="w-3.5 h-3.5 text-ruby" /> Danh Sách Tập Phim
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
                        ? 'bg-slate-100 text-slate-900 border-l-2 border-ruby font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                        <Clapperboard className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-ruby' : 'text-slate-400'}`} />
                        <span className="truncate">{ep.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {ep.actual_tokens_used > 0 ? `${ep.actual_tokens_used} Tokens` : 'Chưa dùng Token'}
                      </div>
                    </div>

                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        ep.status === 'PUBLISHED'
                          ? 'bg-emerald-500'
                          : ep.status === 'EPISODE_SUBMITTED'
                          ? 'bg-purple-500'
                          : ep.status === 'CHANGES_REQUESTED'
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-amber-500'
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
              Menu Sáng Tạo
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-ruby/10 text-ruby border border-ruby/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng Quan & Số Liệu</span>
            </button>

            <button
              onClick={() => setActiveTab('brief')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeTab === 'brief'
                  ? 'bg-ruby/10 text-ruby border border-ruby/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Kế Hoạch & Kịch Bản</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                {scenes.length}
              </span>
            </button>

            <button
              onClick={() => {
                if (canEnterStudio) {
                  router.push(`/creator/studio/${currentPackage.id}`);
                } else {
                  setActiveTab('studio');
                }
              }}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-ruby/10 text-ruby border border-ruby/20 font-bold'
                  : canEnterStudio
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-purple-600" />
                <span>AI Production Studio</span>
              </div>
              {canEnterStudio ? (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  Mở <ExternalLink className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">Khóa</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeTab === 'tokens'
                  ? 'bg-ruby/10 text-ruby border border-ruby/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>AI Token Quota</span>
              </div>
              <span className="text-[10px] text-amber-700 font-mono">
                {currentPackage?.actual_tokens_used}/{currentPackage?.quota_allocated}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-ruby/10 text-ruby border border-ruby/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Phản Hồi & Thẩm Định</span>
              </div>
              {latestFeedback && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Bottom Sidebar Token Card */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/70">
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 shadow-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px] font-medium">Quota Tập Đang Chọn:</span>
                <span className="font-mono text-amber-600 font-bold text-xs">
                  {currentPackage?.quota_allocated > 0 ? `${currentPackage.quota_allocated} T` : 'Chưa cấp'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isQuotaWarning ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  }`}
                  style={{
                    width: `${currentPackage?.quota_allocated > 0 ? Math.min(100, (currentPackage.actual_tokens_used / currentPackage.quota_allocated) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                Trạng thái: <strong className="text-slate-700 font-semibold">{currentPackage?.status}</strong>
              </p>
            </div>
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
                <span>{project.title}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-ruby font-semibold">Tập {currentPackage?.episode_number}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-700 font-medium capitalize">{activeTab}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {currentPackage?.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {canEnterStudio && (
                <Link
                  href={`/creator/studio/${currentPackage?.id}`}
                  className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-purple-200 cursor-pointer"
                >
                  <Video className="w-4 h-4" /> Mở AI Studio
                </Link>
              )}
              {currentPackage?.status === 'PUBLISHED' && (
                <Link
                  href={`/watch/${currentPackage?.id}`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-200"
                >
                  <Play className="w-4 h-4" /> Xem Trên OTT
                </Link>
              )}
            </div>
          </div>

          {/* TAB 1: OVERVIEW & METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Dự án Tổng Thể</span>
                    <div className="w-7 h-7 rounded-lg bg-ruby/10 border border-ruby/20 flex items-center justify-center">
                      <Film className="w-3.5 h-3.5 text-ruby" />
                    </div>
                  </div>
                  <p className="text-base font-bold text-slate-900 mt-2.5 truncate">{project.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <span>{project.total_episodes} Tập</span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">{project.genre[0]}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                  isQuotaWarning ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">AI Token Quota</span>
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Zap className={`w-3.5 h-3.5 ${isQuotaWarning ? 'text-rose-500' : 'text-amber-500'}`} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-2.5">
                    <span className="text-xl font-bold font-mono text-slate-900">{currentPackage?.actual_tokens_used}</span>
                    <span className="text-xs text-slate-500 font-mono">/ {currentPackage?.quota_allocated} T</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isQuotaWarning ? 'bg-rose-500' : 'bg-amber-400'}`}
                      style={{ width: `${currentPackage?.quota_allocated > 0 ? Math.min(100, (currentPackage.actual_tokens_used / currentPackage.quota_allocated) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kế Hoạch & Kịch Bản</span>
                    <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-2.5">
                    {scenes.length} <span className="text-xs font-sans font-normal text-slate-500">Phân Cảnh</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Dự toán: <span className="text-purple-600 font-mono font-medium">{estimatedTokens} Tokens</span>
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tiến Độ Studio</span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-2.5">
                    {completedJobsCount}/{totalJobsCount} <span className="text-xs font-sans font-normal text-slate-500">Phân Đoạn</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>Trạng thái:</span>
                    <span className="text-emerald-600 font-medium">{currentPackage?.status}</span>
                  </p>
                </div>
              </div>

              {/* Feedback Banner if Changes Requested */}
              {latestFeedback && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <h4 className="font-bold text-rose-700">Yêu cầu hiệu chỉnh từ Thẩm định viên (Checker):</h4>
                    <p className="text-slate-700 mt-1 bg-white p-2.5 rounded-lg border border-rose-100">
                      {latestFeedback.feedback_notes}
                    </p>
                    <button
                      onClick={() => setActiveTab('brief')}
                      className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      Mở Form Kịch Bản Để Hiệu Chỉnh ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Action Navigation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-ruby" /> Tóm Tắt Kịch Bản & Bối Cảnh
                  </h3>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {synopsis || 'Chưa có tóm tắt kịch bản.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('brief')}
                    className="text-xs text-ruby hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Xem toàn bộ {scenes.length} phân cảnh ➔
                  </button>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-600" /> Trạng Thái AI Studio
                  </h3>
                  <div className="space-y-2 text-xs">
                    {currentPackage?.jobs?.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">{job.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          job.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {job.status === 'completed' ? 'Hoàn tất' : 'Chờ sinh AI'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {canEnterStudio && (
                    <Link
                      href={`/creator/studio/${currentPackage?.id}`}
                      className="inline-flex text-xs text-purple-600 hover:underline font-semibold items-center gap-1 mt-2"
                    >
                      Chuyển vào AI Studio Workspace ➔
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT BRIEF FORM */}
          {activeTab === 'brief' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ruby" />
                    Soạn Thảo Kế Hoạch & Kịch Bản (Content Brief)
                  </h2>
                  <p className="text-xs text-slate-500">PostgreSQL Schema: `content_brief`</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
                  >
                    {isSaved ? '✓ Đã Lưu' : 'Lưu Bản Nháp'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitPlan}
                    className="px-5 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white text-xs font-bold shadow-md shadow-ruby/20 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {currentPackage?.status === 'CHANGES_REQUESTED' ? 'Nộp Lại Bản Hiệu Chỉnh' : 'Nộp Kế Hoạch & Xin Quota'}
                  </button>
                </div>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tóm Tắt Cốt Truyện (Synopsis)
                    </label>
                    <textarea
                      rows={3}
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="Nhập bối cảnh và tóm tắt diễn biến chính của tập phim..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ruby focus:ring-1 focus:ring-ruby leading-relaxed font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Kịch Bản Tổng Thể (Overview Script)
                    </label>
                    <textarea
                      rows={4}
                      value={overviewScript}
                      onChange={(e) => setOverviewScript(e.target.value)}
                      placeholder="Diễn giải kịch bản mở đầu, cao trào và kết thúc..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ruby focus:ring-1 focus:ring-ruby leading-relaxed font-sans"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Thông Số Kỹ Thuật Dự Kiến
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Thời lượng mục tiêu (Phút):</label>
                    <input
                      type="number"
                      value={targetDuration}
                      onChange={(e) => setTargetDuration(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-ruby"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Tổng Token Dự Toán:</label>
                    <input
                      type="number"
                      value={estimatedTokens}
                      onChange={(e) => setEstimatedTokens(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-amber-600 font-mono font-bold focus:outline-none focus:border-ruby"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Ghi Chú Storyboard:</label>
                    <textarea
                      rows={2}
                      value={storyboardSummary}
                      onChange={(e) => setStoryboardSummary(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-[11px] text-slate-900 focus:outline-none focus:border-ruby"
                    />
                  </div>
                </div>
              </div>

              {/* Scene Breakdown List */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Phân Tích Chi Tiết Từng Phân Cảnh ({scenes.length} Cảnh)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddScene}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" /> Thêm Phân Cảnh
                  </button>
                </div>

                <div className="space-y-3">
                  {scenes.map((scene, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <span className="font-bold text-xs text-ruby flex items-center gap-1.5">
                          Phân Cảnh #{scene.scene_number}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={scene.title}
                            onChange={(e) => handleSceneChange(idx, 'title', e.target.value)}
                            placeholder="Tiêu đề phân cảnh..."
                            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScene(idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">Visual Prompt AI:</label>
                          <textarea
                            rows={2}
                            value={scene.visual_prompt}
                            onChange={(e) => handleSceneChange(idx, 'visual_prompt', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-ruby"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">Audio / Voice Prompt:</label>
                          <textarea
                            rows={2}
                            value={scene.audio_prompt}
                            onChange={(e) => handleSceneChange(idx, 'audio_prompt', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-ruby"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STUDIO SHORTCUT */}
          {activeTab === 'studio' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Production Studio Workspace</h2>
                  <p className="text-xs text-slate-500">Không gian điều khiển sinh video, thoại AI & lắp ghép timeline</p>
                </div>
              </div>

              {canEnterStudio ? (
                <div className="p-6 bg-purple-50/50 border border-purple-200 rounded-2xl text-center space-y-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Studio Đã Sẵn Sàng Hoạt Động</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Hạn mức Token Quota: <span className="font-bold text-amber-600 font-mono">{currentPackage.quota_allocated} Tokens</span>
                    </p>
                  </div>
                  <Link
                    href={`/creator/studio/${currentPackage.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ruby hover:bg-ruby-dark text-white font-bold text-xs shadow-md shadow-ruby/20 transition"
                  >
                    <Play className="w-4 h-4" /> Truy Cập AI Studio Ngay
                  </Link>
                </div>
              ) : (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
                  <Clock className="w-10 h-10 text-amber-600 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Studio Đang Khóa (Chờ Duyệt Quota)</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Kịch bản của bạn đang ở trạng thái <span className="font-bold text-amber-600">{currentPackage?.status}</span>.
                      Reviewer (Checker) cần phê duyệt và cấp Token Quota trước khi bắt đầu sinh clip.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('brief')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
                  >
                    Kiểm Tra Lại Bản Kế Hoạch ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TOKEN QUOTA DETAILS */}
          {activeTab === 'tokens' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Chi Tiết Tiêu Hao Token AI</h2>
                    <p className="text-xs text-slate-500">Hạn mức được cấp phát bởi Reviewer (Checker)</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-amber-600">
                  {currentPackage?.actual_tokens_used} / {currentPackage?.quota_allocated} Tokens
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>Tiến độ tiêu thụ:</span>
                    <span className="font-bold font-mono">{quotaPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isQuotaWarning ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${currentPackage?.quota_allocated > 0 ? Math.min(100, (currentPackage.actual_tokens_used / currentPackage.quota_allocated) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Danh Sách Tác Vụ Sinh Clip:</h4>
                <div className="space-y-2">
                  {currentPackage?.jobs?.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{job.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{job.ai_model}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-purple-600">{job.token_cost} Tokens</span>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          {job.status === 'completed' ? '✓ Đã hoàn tất' : 'Chưa hoàn thành'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REVIEW FEEDBACK LOGS */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Nhật Ký Thẩm Định Của Reviewer</h2>
                  <p className="text-xs text-slate-500">Lịch sử phê duyệt và hướng dẫn chỉnh sửa từ Checker</p>
                </div>
              </div>

              {episodeReviews.length > 0 ? (
                <div className="space-y-3">
                  {episodeReviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          {rev.reviewer_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          rev.decision === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {rev.decision === 'approved' ? 'ĐÃ PHÊ DUYỆT' : 'YÊU CẦU CHỈNH SỬA'}
                        </span>
                      </div>
                      <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        {rev.feedback_notes}
                      </p>
                      {rev.quota_granted && (
                        <p className="text-[11px] text-amber-700 font-mono font-medium">
                          ⚡ Quota cấp: +{rev.quota_granted} Tokens
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Chưa có nhật ký thẩm định nào cho tập phim này.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
