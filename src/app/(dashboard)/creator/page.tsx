'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import RoleNavHeader from '@/components/dashboard/RoleNavHeader';
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
  Sparkles,
  FileText,
  Play,
  ArrowRight,
  Video,
  Info,
  Layers,
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
      alert('Đã gửi Kế hoạch Sản xuất (content_brief) lên Reviewer (Checker) thẩm định!');
    }
  };

  const canEnterStudio =
    currentPackage?.status === 'QUOTA_ALLOCATED' ||
    currentPackage?.status === 'IN_PRODUCTION' ||
    currentPackage?.status === 'EPISODE_SUBMITTED' ||
    currentPackage?.status === 'COMPLIANCE_PASSED' ||
    currentPackage?.status === 'PUBLISHED';

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-100 pb-16 font-sans">
      {/* Role Navigation Top Header */}
      <RoleNavHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* ==================================================== */}
        {/* 1. OVERVIEW METRICS SECTION                          */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Project Overview */}
          <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dự án Đang Thực Hiện</span>
              <Film className="w-4 h-4 text-ruby" />
            </div>
            <p className="text-lg font-black text-white mt-2 truncate">{project.title}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span>{project.total_episodes} Tập phim</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{project.genre[0]}</span>
            </div>
          </div>

          {/* Card 2: Token Quota Metric with Warning */}
          <div className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden ${
            isQuotaWarning ? 'bg-[#1C1418] border-red-500/40 shadow-red-900/20' : 'bg-[#161922] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Token Quota</span>
              <Zap className={`w-4 h-4 ${isQuotaWarning ? 'text-red-400' : 'text-amber-400'}`} />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className={`text-2xl font-black ${isQuotaWarning ? 'text-red-400' : 'text-white'}`}>
                {project.consumed_tokens}
              </p>
              <span className="text-xs text-slate-400">/ {project.allocated_tokens} Tokens</span>
            </div>

            {/* Quota Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isQuotaWarning
                    ? 'bg-gradient-to-r from-orange-500 to-red-500'
                    : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, quotaPercent)}%` }}
              />
            </div>
            <p className={`text-[11px] mt-1.5 font-medium ${isQuotaWarning ? 'text-red-400' : 'text-slate-400'}`}>
              {isQuotaWarning ? '⚠️ Cảnh báo: Sử dụng vượt 90% hạn mức token!' : `Đã sử dụng ${quotaPercent.toFixed(1)}% ngân sách`}
            </p>
          </div>

          {/* Card 3: Plan Status Tracker */}
          <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kế hoạch Tập {currentPackage?.episode_number}</span>
              <Clock className="w-4 h-4 text-neon" />
            </div>
            <p className="text-lg font-black text-white mt-2 capitalize">
              {currentPackage?.status === 'PLAN_PENDING' ? 'Chờ Duyệt Quota' : currentPackage?.status === 'QUOTA_ALLOCATED' ? 'Đã Cấp Quota' : currentPackage?.status === 'CHANGES_REQUESTED' ? 'Cần Chỉnh Sửa' : currentPackage?.status === 'EPISODE_SUBMITTED' ? 'Đã Nộp Video' : currentPackage?.status === 'PUBLISHED' ? 'Đã Phát Hành' : 'Đang Biên Soạn'}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Dự toán: <span className="font-bold text-amber-300 font-mono">{brief?.estimated_tokens || 0} Tokens</span>
            </p>
          </div>

          {/* Card 4: Quick Launch Studio Action */}
          <div className="bg-gradient-to-br from-[#1C162E] to-[#161922] p-5 rounded-2xl border border-neon/30 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neon-light uppercase tracking-wider">AI Studio Workspace</span>
              <Video className="w-4 h-4 text-neon" />
            </div>
            {canEnterStudio ? (
              <div>
                <p className="text-xs text-slate-300 mb-2.5">Quota đã cấp ({currentPackage?.quota_allocated} Tokens). Sẵn sàng render phân cảnh!</p>
                <Link
                  href={`/(dashboard)/creator/studio/${currentPackage?.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-ruby to-neon text-white font-bold text-xs shadow-lg shadow-ruby/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <span>Mở Studio Sinh Clip AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-400 mb-2">Studio đang khóa cho đến khi Reviewer duyệt kế hoạch và cấp Quota.</p>
                <button
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-500 font-bold text-xs cursor-not-allowed border border-white/10"
                >
                  <span>Chờ Phê Duyệt Quota</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* REVISION NOTICE BANNER (IF CHANGES REQUESTED)       */}
        {/* ==================================================== */}
        {currentPackage?.status === 'CHANGES_REQUESTED' && latestFeedback && (
          <div className="bg-[#241315] border border-red-500/40 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start gap-4 animate-fade-in">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-red-300 uppercase tracking-wider">Yêu Cầu Chỉnh Sửa Từ Reviewer (Checker)</h4>
                <span className="text-xs text-slate-400 font-mono">• {new Date(latestFeedback.created_at).toLocaleTimeString('vi-VN')}</span>
              </div>
              <p className="text-sm text-slate-200 mt-1.5 font-medium leading-relaxed bg-black/30 p-3 rounded-xl border border-red-500/20">
                "{latestFeedback.feedback_notes}"
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Vui lòng cập nhật lại phần kịch bản hoặc phân bổ token bên dưới, sau đó bấm <span className="text-ruby-light font-bold">"Revise Production Plan"</span> để gửi lại.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 2. PRODUCTION BRIEF AREA (content_brief)            */}
        {/* ==================================================== */}
        <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-ruby" />
                <h3 className="text-lg font-bold text-white tracking-tight">Kế Hoạch Sản Xuất & Phân Cảnh (Content Brief)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Schema: <code className="text-neon-light font-mono">content_brief</code> • Soạn thảo brief, storyboard và dự toán token trước khi cấp phép sản xuất
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSaveDraft}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                {isSaved ? '✓ Đã lưu nháp' : 'Lưu bản nháp'}
              </button>

              <button
                onClick={handleSubmitPlan}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                  currentPackage?.status === 'CHANGES_REQUESTED'
                    ? 'bg-gradient-to-r from-amber-500 to-ruby text-white shadow-amber-900/30 hover:scale-105'
                    : 'bg-gradient-to-r from-ruby to-ruby-dark text-white shadow-ruby/30 hover:scale-105'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{currentPackage?.status === 'CHANGES_REQUESTED' ? 'Revise Production Plan' : 'Submit Production Plan'}</span>
              </button>
            </div>
          </div>

          {/* Form Overview Brief */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tóm Tắt Cốt Truyện (Synopsis)
                </label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0E1017] border border-white/15 rounded-xl p-3 text-sm text-white focus:border-ruby focus:ring-1 focus:ring-ruby outline-none transition-all placeholder:text-slate-600"
                  placeholder="Nhập tóm tắt diễn biến chính của tập phim..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Kịch Bản Tổng Thể (Overview Script)
                </label>
                <textarea
                  value={overviewScript}
                  onChange={(e) => setOverviewScript(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0E1017] border border-white/15 rounded-xl p-3 text-sm text-white focus:border-ruby focus:ring-1 focus:ring-ruby outline-none transition-all placeholder:text-slate-600"
                  placeholder="Diễn giải chi tiết từng tuyến nhân vật và bối cảnh không gian..."
                />
              </div>
            </div>

            {/* Side Specs */}
            <div className="bg-[#0E1017] p-4 rounded-xl border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-neon-light uppercase tracking-wider border-b border-white/10 pb-2">
                Thông Số Kỹ Thuật Dự Kiến
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Thời lượng mục tiêu (Phút)
                </label>
                <input
                  type="number"
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(Number(e.target.value))}
                  className="w-full bg-[#161922] border border-white/15 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-neon outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tổng Token Dự Toán (Estimated Tokens)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={estimatedTokens}
                    onChange={(e) => setEstimatedTokens(Number(e.target.value))}
                    className="w-full bg-[#161922] border border-white/15 rounded-lg px-3 py-2 text-sm text-amber-300 font-bold font-mono focus:border-amber-400 outline-none"
                  />
                  <span className="text-xs text-slate-400 font-mono">Tokens</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Mô Tả Storyboard Ngắn
                </label>
                <textarea
                  value={storyboardSummary}
                  onChange={(e) => setStoryboardSummary(e.target.value)}
                  rows={3}
                  className="w-full bg-[#161922] border border-white/15 rounded-lg p-2 text-xs text-slate-300 focus:border-neon outline-none resize-none"
                  placeholder="Ghi chú phong cách thẩm mỹ, bảng màu visual..."
                />
              </div>
            </div>
          </div>

          {/* Scene Breakdown List */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neon" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Phân Tích Chi Tiết Từng Phân Cảnh (Scene Breakdown - {scenes.length} Cảnh)
                </h4>
              </div>

              <button
                onClick={handleAddScene}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon/15 hover:bg-neon/25 border border-neon/30 text-neon-light text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Phân Cảnh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="bg-[#0E1017] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-ruby/20 border border-ruby/40 text-ruby-light text-xs font-extrabold font-mono">
                        CẢNH {scene.scene_number}
                      </span>
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) => handleSceneChange(idx, 'title', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-ruby text-sm font-bold text-white outline-none px-1"
                        placeholder="Tiêu đề phân cảnh..."
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 font-mono font-bold">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <input
                          type="number"
                          value={scene.estimated_tokens}
                          onChange={(e) => handleSceneChange(idx, 'estimated_tokens', Number(e.target.value))}
                          className="w-12 bg-transparent text-right outline-none text-amber-300"
                        />
                        <span>Tokens</span>
                      </div>

                      <button
                        onClick={() => handleRemoveScene(idx)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                        title="Xóa phân cảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Visual Prompt (Hình ảnh & Camera)
                      </label>
                      <textarea
                        value={scene.visual_prompt}
                        onChange={(e) => handleSceneChange(idx, 'visual_prompt', e.target.value)}
                        rows={2}
                        className="w-full bg-[#161922] border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:border-ruby outline-none"
                        placeholder="Nhập prompt tiếng Anh chi tiết cho mô hình tạo video..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Audio Prompt & Lời Thoại (Voiceover)
                      </label>
                      <textarea
                        value={scene.audio_prompt}
                        onChange={(e) => handleSceneChange(idx, 'audio_prompt', e.target.value)}
                        rows={2}
                        className="w-full bg-[#161922] border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:border-neon outline-none"
                        placeholder="Nhập lời thoại nhân vật và hiệu ứng âm thanh SFX..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. EPISODES STATUS SUMMARY TABLE                    */}
        {/* ==================================================== */}
        <div className="bg-[#161922] rounded-2xl border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-ruby" />
              <span>Tiến Độ Toàn Bộ Các Tập Trong Dự Án</span>
            </h3>
            <span className="text-xs text-slate-400">{project.episodes.length} / {project.total_episodes} Tập</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.episodes.map((ep) => {
              const isSelected = ep.id === currentPackage?.id;
              const isUnlocked = ep.quota_allocated > 0;

              return (
                <div
                  key={ep.id}
                  onClick={() => setActivePackage(ep.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-gradient-to-br from-white/10 to-white/5 border-ruby/80 ring-1 ring-ruby/50 shadow-lg'
                      : 'bg-[#0E1017] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-ruby-light uppercase">Tập {ep.episode_number}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                      {ep.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{ep.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-white/5">
                    <span>Quota: <b className="text-amber-300 font-mono">{ep.quota_allocated}</b> Tokens</span>
                    <span>Dùng: <b className="text-emerald-400 font-mono">{ep.actual_tokens_used}</b></span>
                  </div>

                  {isUnlocked && (
                    <div className="mt-3">
                      <Link
                        href={`/(dashboard)/creator/studio/${ep.id}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-neon/15 hover:bg-neon/30 text-neon-light text-xs font-bold border border-neon/30 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Vào Studio Tập {ep.episode_number}</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
