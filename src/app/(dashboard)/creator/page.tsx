'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
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
  Sliders,
  FileText,
  Play,
  ArrowRight,
  Video,
  Info,
  Layers,
  LayoutDashboard,
  Clapperboard,
  History,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
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
                <Layers className="w-3.5 h-3.5 text-ruby" /> Danh Sách Tập Phim
              </span>
              <span className="text-[10px] font-mono text-emerald-400">{project.episodes.length} Tập</span>
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
                        ? 'bg-ruby/15 border-ruby/50 text-white shadow-md shadow-ruby/10'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <Clapperboard className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-ruby' : 'text-slate-500'}`} />
                        <span className="truncate">{ep.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {ep.actual_tokens_used > 0 ? `${ep.actual_tokens_used} Tokens` : 'Chưa dùng Token'}
                      </div>
                    </div>

                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        ep.status === 'PUBLISHED'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                          : ep.status === 'EPISODE_SUBMITTED'
                          ? 'bg-purple-400'
                          : ep.status === 'CHANGES_REQUESTED'
                          ? 'bg-red-400 animate-pulse'
                          : 'bg-amber-400'
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
              Chức Năng Maker
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-ruby text-white shadow-lg shadow-ruby/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng Quan & Số Liệu</span>
            </button>

            <button
              onClick={() => setActiveTab('brief')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'brief'
                  ? 'bg-ruby text-white shadow-lg shadow-ruby/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Kế Hoạch & Kịch Bản</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-300 font-mono">
                {scenes.length} cảnh
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
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-ruby text-white shadow-lg shadow-ruby/25'
                  : canEnterStudio
                  ? 'text-slate-300 hover:text-white hover:bg-white/5'
                  : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-[#8B5CF6]" />
                <span>AI Production Studio</span>
              </div>
              {canEnterStudio ? (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  Mở <ExternalLink className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 font-semibold">Khóa</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'tokens'
                  ? 'bg-ruby text-white shadow-lg shadow-ruby/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>AI Token Quota</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">
                {currentPackage?.actual_tokens_used}/{currentPackage?.quota_allocated}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-ruby text-white shadow-lg shadow-ruby/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Phản Hồi & Thẩm Định</span>
              </div>
              {latestFeedback && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Bottom Sidebar Token Card */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="bg-[#161922] p-3 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Quota Tập Hiện Tại:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {currentPackage?.quota_allocated > 0 ? `${currentPackage.quota_allocated} T` : 'Chưa cấp'}
                </span>
              </div>
              <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isQuotaWarning ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  }`}
                  style={{
                    width: `${currentPackage?.quota_allocated > 0 ? Math.min(100, (currentPackage.actual_tokens_used / currentPackage.quota_allocated) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Trạng thái: <strong className="text-white">{currentPackage?.status}</strong>
              </p>
            </div>
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
                <span>{project.title}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-ruby font-semibold">Tập {currentPackage?.episode_number}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-200 capitalize">{activeTab}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {currentPackage?.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {canEnterStudio && (
                <Link
                  href={`/creator/studio/${currentPackage?.id}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#8B5CF6] hover:from-purple-500 hover:to-[#9d74f8] text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-900/30"
                >
                  <Video className="w-4 h-4" /> Mở AI Studio
                </Link>
              )}
              {currentPackage?.status === 'PUBLISHED' && (
                <Link
                  href={`/watch/${currentPackage?.id}`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dự án Tổng Thể</span>
                    <Film className="w-4 h-4 text-ruby" />
                  </div>
                  <p className="text-lg font-black text-white mt-2 truncate">{project.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span>{project.total_episodes} Tập</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{project.genre[0]}</span>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden ${
                  isQuotaWarning ? 'bg-[#1C1418] border-red-500/40 shadow-red-900/20' : 'bg-[#161922] border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Token Quota</span>
                    <Zap className={`w-4 h-4 ${isQuotaWarning ? 'text-red-400' : 'text-amber-400'}`} />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-white">{currentPackage?.actual_tokens_used}</span>
                    <span className="text-xs text-slate-400">/ {currentPackage?.quota_allocated} Tokens</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${isQuotaWarning ? 'bg-red-500' : 'bg-amber-400'}`}
                      style={{ width: `${currentPackage?.quota_allocated > 0 ? Math.min(100, (currentPackage.actual_tokens_used / currentPackage.quota_allocated) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kế Hoạch & Phân Cảnh</span>
                    <Clock className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-base font-black text-white mt-2">
                    {scenes.length} Phân Cảnh
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Dự toán: <span className="text-purple-300 font-bold">{estimatedTokens} Tokens</span>
                  </p>
                </div>

                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến Độ Studio</span>
                    <Video className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-base font-black text-white mt-2">
                    {completedJobsCount}/{totalJobsCount} Phân Đoạn Hoàn Tất
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Trạng thái: <strong className="text-emerald-400">{currentPackage?.status}</strong>
                  </p>
                </div>
              </div>

              {/* Feedback Banner if Changes Requested */}
              {latestFeedback && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <h4 className="font-bold text-red-400">Yêu cầu hiệu chỉnh từ Thẩm định viên (Checker):</h4>
                    <p className="text-slate-300 mt-1 bg-black/30 p-2.5 rounded-lg border border-red-500/20">
                      {latestFeedback.feedback_notes}
                    </p>
                    <button
                      onClick={() => setActiveTab('brief')}
                      className="mt-2.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-[11px] flex items-center gap-1.5 transition"
                    >
                      Mở Form Kịch Bản Để Hiệu Chỉnh ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Action Navigation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-ruby" /> Tóm Tắt Kịch Bản & Bối Cảnh
                  </h3>
                  <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                    {synopsis || 'Chưa có tóm tắt kịch bản.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('brief')}
                    className="text-xs text-ruby hover:underline font-semibold flex items-center gap-1"
                  >
                    Xem toàn bộ {scenes.length} phân cảnh ➔
                  </button>
                </div>

                <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#8B5CF6]" /> Trạng Thái AI Studio
                  </h3>
                  <div className="space-y-2 text-xs">
                    {currentPackage?.jobs?.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <span className="font-semibold text-white truncate max-w-[200px]">{job.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {job.status === 'completed' ? 'Hoàn tất' : 'Chờ sinh AI'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {canEnterStudio && (
                    <Link
                      href={`/creator/studio/${currentPackage?.id}`}
                      className="inline-flex text-xs text-[#8B5CF6] hover:underline font-semibold items-center gap-1 mt-2"
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
            <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ruby" />
                    Soạn Thảo Kế Hoạch & Kịch Bản (Content Brief)
                  </h2>
                  <p className="text-xs text-slate-400">PostgreSQL Schema: `content_brief`</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition"
                  >
                    {isSaved ? '✓ Đã Lưu' : 'Lưu Bản Nháp'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitPlan}
                    className="px-5 py-2 rounded-xl bg-ruby hover:bg-ruby-dark text-white text-xs font-bold shadow-lg shadow-ruby/25 flex items-center gap-2 transition cursor-pointer"
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
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Tóm Tắt Cốt Truyện (Synopsis)
                    </label>
                    <textarea
                      rows={3}
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="Nhập bối cảnh và tóm tắt diễn biến chính của tập phim..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ruby leading-relaxed font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Kịch Bản Tổng Thể (Overview Script)
                    </label>
                    <textarea
                      rows={4}
                      value={overviewScript}
                      onChange={(e) => setOverviewScript(e.target.value)}
                      placeholder="Diễn giải kịch bản mở đầu, cao trào và kết thúc..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ruby leading-relaxed font-sans"
                    />
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                    Thông Số Kỹ Thuật Dự Kiến
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Thời lượng mục tiêu (Phút):</label>
                    <input
                      type="number"
                      value={targetDuration}
                      onChange={(e) => setTargetDuration(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-ruby"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tổng Token Dự Toán:</label>
                    <input
                      type="number"
                      value={estimatedTokens}
                      onChange={(e) => setEstimatedTokens(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-ruby"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Ghi Chú Storyboard:</label>
                    <textarea
                      rows={2}
                      value={storyboardSummary}
                      onChange={(e) => setStoryboardSummary(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[11px] text-white focus:outline-none focus:border-ruby"
                    />
                  </div>
                </div>
              </div>

              {/* Scene Breakdown List */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Phân Tích Chi Tiết Từng Phân Cảnh ({scenes.length} Cảnh)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddScene}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Thêm Phân Cảnh
                  </button>
                </div>

                <div className="space-y-3">
                  {scenes.map((scene, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <span className="font-bold text-xs text-ruby flex items-center gap-1.5">
                          Phân Cảnh #{scene.scene_number}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={scene.title}
                            onChange={(e) => handleSceneChange(idx, 'title', e.target.value)}
                            placeholder="Tiêu đề phân cảnh..."
                            className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScene(idx)}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Visual Prompt AI:</label>
                          <textarea
                            rows={2}
                            value={scene.visual_prompt}
                            onChange={(e) => handleSceneChange(idx, 'visual_prompt', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-ruby"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Audio / Voice Prompt:</label>
                          <textarea
                            rows={2}
                            value={scene.audio_prompt}
                            onChange={(e) => handleSceneChange(idx, 'audio_prompt', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-ruby"
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
            <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">AI Production Studio Workspace</h2>
                  <p className="text-xs text-slate-400">Không gian điều khiển sinh video, thoại AI & lắp ghép timeline</p>
                </div>
              </div>

              {canEnterStudio ? (
                <div className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl text-center space-y-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-white">Studio Đã Sẵn Sàng Hoạt Động</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Hạn mức Token Quota: <span className="font-bold text-amber-400 font-mono">{currentPackage.quota_allocated} Tokens</span>
                    </p>
                  </div>
                  <Link
                    href={`/creator/studio/${currentPackage.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ruby to-ruby-dark text-white font-bold text-xs shadow-lg shadow-ruby/30 hover:scale-105 transition"
                  >
                    <Play className="w-4 h-4" /> Truy Cập AI Studio Ngay
                  </Link>
                </div>
              ) : (
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-3">
                  <Clock className="w-10 h-10 text-amber-400 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-white">Studio Đang Khóa (Chờ Duyệt Quota)</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Kịch bản của bạn đang ở trạng thái <span className="font-bold text-amber-400">{currentPackage?.status}</span>.
                      Reviewer (Checker) cần phê duyệt và cấp Token Quota trước khi bắt đầu sinh clip.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('brief')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
                  >
                    Kiểm Tra Lại Bản Kế Hoạch ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TOKEN QUOTA DETAILS */}
          {activeTab === 'tokens' && (
            <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Chi Tiết Tiêu Hao Token AI</h2>
                    <p className="text-xs text-slate-400">Hạn mức được cấp phát bởi Reviewer (Checker)</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {currentPackage?.actual_tokens_used} / {currentPackage?.quota_allocated} Tokens
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Tiến độ tiêu thụ:</span>
                    <span className="font-bold">{quotaPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isQuotaWarning ? 'bg-red-500' : 'bg-amber-400'}`}
                      style={{ width: `${currentPackage?.quota_allocated > 0 ? Math.min(100, (currentPackage.actual_tokens_used / currentPackage.quota_allocated) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Danh Sách Tác Vụ Sinh Clip:</h4>
                <div className="space-y-2">
                  {currentPackage?.jobs?.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div>
                        <p className="font-bold text-white">{job.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{job.ai_model}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-purple-400">{job.token_cost} Tokens</span>
                        <div className="text-[10px] text-emerald-400">
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
            <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Nhật Ký Thẩm Định Của Reviewer</h2>
                  <p className="text-xs text-slate-400">Lịch sử phê duyệt và hướng dẫn chỉnh sửa từ Checker</p>
                </div>
              </div>

              {episodeReviews.length > 0 ? (
                <div className="space-y-3">
                  {episodeReviews.map((rev) => (
                    <div key={rev.id} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />
                          {rev.reviewer_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rev.decision === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {rev.decision === 'approved' ? 'ĐÃ PHÊ DUYỆT' : 'YÊU CẦU CHỈNH SỬA'}
                        </span>
                      </div>
                      <p className="text-slate-300 bg-black/30 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                        {rev.feedback_notes}
                      </p>
                      {rev.quota_granted && (
                        <p className="text-[11px] text-amber-300 font-mono">
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
