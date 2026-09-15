'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useAppStore } from '@/store/useAppStore';
import RoleNavHeader from '@/components/dashboard/RoleNavHeader';
import {
  Video,
  Play,
  Pause,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowLeft,
  ArrowRight,
  Cpu,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

const AI_MODELS = [
  { id: 'CinemaGen v3.2 (4K Photoreal)', label: 'CinemaGen v3.2 (4K Photoreal)', type: 'video', costPerSec: 4.5 },
  { id: 'Sora Vision Pro v2', label: 'Sora Vision Pro v2', type: 'video', costPerSec: 5.0 },
  { id: 'ElevenLabs Pro Voice HD', label: 'ElevenLabs Pro Voice HD', type: 'audio', costPerSec: 1.5 },
  { id: 'Dolby Spatial AI SFX', label: 'Dolby Spatial AI SFX', type: 'audio', costPerSec: 1.0 },
];

export default function CreatorStudioPage() {
  const params = useParams();
  const episodeId = (params?.episodeId as string) || 'pkg-ep-03';
  const router = useRouter();

  const {
    project,
    triggerGenerationJob,
    addSceneJob,
    removeSceneJob,
    submitEpisodePackage,
    setActivePackage,
  } = useWorkflowStore();
  const { user, isAuthenticated, logout, openAuthModal } = useAppStore();

  const currentPackage = project.episodes.find((e) => e.id === episodeId) || project.episodes[0];
  const jobs = currentPackage?.jobs || [];
  const assets = currentPackage?.assets || [];

  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New Scene Generation State
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newPromptVideo, setNewPromptVideo] = useState('');
  const [newPromptAudio, setNewPromptAudio] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [tokenCost] = useState(70);

  const [renderingJobId, setRenderingJobId] = useState<string | null>(null);

  React.useEffect(() => {
    if (currentPackage) {
      setActivePackage(currentPackage.id);
    }
  }, [currentPackage?.id]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const selectedAsset = assets.find((a) => a.job_id === selectedJob?.id) || assets[0];

  const handleGenerate = (jobId: string) => {
    setRenderingJobId(jobId);
    triggerGenerationJob(currentPackage.id, jobId);
    setTimeout(() => {
      setRenderingJobId(null);
    }, 4000);
  };

  const handleAddJob = () => {
    if (!newSceneTitle.trim()) {
      alert('Vui lòng nhập tên phân cảnh mới!');
      return;
    }
    const nextSceneNum = jobs.length + 1;
    addSceneJob(currentPackage.id, {
      episode_id: currentPackage.id,
      scene_id: `scene-${nextSceneNum}`,
      scene_number: nextSceneNum,
      title: newSceneTitle,
      ai_model: selectedModel,
      prompt_video: newPromptVideo || 'Cinematic shot, highly detailed lighting',
      prompt_audio: newPromptAudio || 'Ambient cinematic background music',
      token_cost: tokenCost,
    });
    setNewSceneTitle('');
    setNewPromptVideo('');
    setNewPromptAudio('');
  };

  const handleSubmitToChecker = () => {
    const success = submitEpisodePackage(currentPackage.id);
    if (success) {
      setIsSubmitModalOpen(false);
      alert('Tập phim đã được nộp thành công sang Thẩm định viên (Reviewer / Checker) để kiểm định nội dung & pháp lý!');
      router.push('/creator');
    }
  };

  const allCompleted = jobs.length > 0 && jobs.every((j) => j.status === 'completed');
  const remainingQuota = currentPackage.quota_allocated - currentPackage.actual_tokens_used;

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      {/* Role Navigation Top Header */}
      <RoleNavHeader />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Studio Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              href="/creator"
              className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-ruby/10 text-ruby border border-ruby/20">
                  AI STUDIO WORKSPACE
                </span>
                <span className="text-xs text-slate-500 font-mono">Tập {currentPackage.episode_number}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">{currentPackage.title}</h2>
            </div>
          </div>

          {/* Quota tracker & Submit Action */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Hạn Mức Quota</span>
                <span className="text-xs font-mono font-bold text-amber-600">
                  {currentPackage.actual_tokens_used} / {currentPackage.quota_allocated} Tokens
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Còn lại</span>
                <span className={`text-xs font-mono font-bold ${remainingQuota < 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {remainingQuota} Tokens
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={!allCompleted}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                allCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Nộp Bản Dựng Cho Checker</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* MAIN WORKSPACE GRID: Video Viewport & Prompt Panel   */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Main Viewport & Timeline Assembly */}
          <div className="lg:col-span-7 space-y-6">
            {/* Video Player Previewer */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Video className="w-4 h-4 text-ruby" />
                  <span>Trình Phát Ghép Bản Dựng Phân Cảnh (Episode Assembly)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono text-[11px]">
                  4K 60fps • HEVC
                </span>
              </div>

              {/* Viewport Screen */}
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                <img
                  src={selectedAsset?.thumbnail_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'}
                  alt="Video Viewport"
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                />

                {/* Video HUD Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold">
                      {selectedJob ? selectedJob.title : 'Chọn phân cảnh'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                      AI Generated • 100%
                    </span>
                  </div>

                  {/* Player Controls */}
                  <div className="space-y-2">
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                      <div className="h-full bg-ruby rounded-full w-2/5" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 rounded-full bg-ruby flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-ruby/30"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <span className="font-mono text-xs">00:06 / {selectedAsset ? `00:${selectedAsset.duration_seconds}` : '00:15'}</span>
                      </div>

                      <span className="text-slate-300 font-mono text-[11px]">
                        Model: {selectedJob?.ai_model || 'CinemaGen v3.2'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clip Metadata Bar */}
              {selectedAsset && (
                <div className="p-3.5 bg-slate-50 border-t border-slate-200 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Độ phân giải</span>
                    <span className="font-mono font-bold text-slate-900">{selectedAsset.resolution}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Thời lượng</span>
                    <span className="font-mono font-bold text-slate-900">{selectedAsset.duration_seconds} Giây</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Dung lượng</span>
                    <span className="font-mono font-bold text-slate-900">{selectedAsset.file_size_mb} MB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Chi phí Token</span>
                    <span className="font-mono font-bold text-amber-600">{selectedJob.token_cost} Tokens</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Multi-Scene Assembly (episode_package_asset) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Timeline Phân Cảnh Ghép Tập ({jobs.length} Cảnh)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Hoàn thành: <b className="text-emerald-600">{jobs.filter((j) => j.status === 'completed').length}</b> / {jobs.length} Cảnh
                </span>
              </div>

              <div className="space-y-3">
                {jobs.map((job) => {
                  const isSelected = job.id === selectedJobId;
                  const isRendering = renderingJobId === job.id || job.status === 'processing';
                  const isCompleted = job.status === 'completed';

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-ruby/5 border-ruby/40 ring-1 ring-ruby/30'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-ruby/10 border border-ruby/20 flex items-center justify-center text-ruby font-mono font-bold text-xs shrink-0">
                          #{job.scene_number}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{job.title}</h4>
                          <p className="text-[11px] text-slate-500 truncate max-w-md font-mono mt-0.5">
                            {job.ai_model} • {job.token_cost} Tokens
                          </p>
                        </div>
                      </div>

                      {/* Job Action / Status */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isRendering ? (
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                            <span className="text-xs font-bold text-blue-700 font-mono">
                              Rendering ({job.progress}%)
                            </span>
                          </div>
                        ) : isCompleted ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hoàn Tất</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerate(job.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer"
                            >
                              Re-render
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerate(job.id);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ruby hover:bg-ruby-dark text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Sinh Clip</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSceneJob(currentPackage.id, job.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): AI Generator Prompt & Model Controller */}
          <div className="lg:col-span-5 space-y-6">
            {/* Generator Controller Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-ruby" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Bộ Điều Khiển Sinh Tài Nguyên AI (generation_job)
                  </h3>
                </div>
              </div>

              {/* Form to add or edit selected scene */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tên Phân Cảnh (Scene Title)
                  </label>
                  <input
                    type="text"
                    value={selectedJob?.title || newSceneTitle}
                    onChange={(e) => setNewSceneTitle(e.target.value)}
                    placeholder="Ví dụ: Cảnh 4: Rượt đuổi trên xa lộ tầng không..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-ruby outline-none"
                  />
                </div>

                {/* AI Model Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mô Hình AI Tạo Sinh (ai_model)
                  </label>
                  <select
                    value={selectedJob?.ai_model || selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-ruby outline-none cursor-pointer"
                  >
                    {AI_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label} ({model.costPerSec} Tokens/giây)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Video Prompt Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Visual Video Prompt (Mô tả hình ảnh & Ánh sáng)
                  </label>
                  <textarea
                    value={selectedJob?.prompt_video || newPromptVideo}
                    onChange={(e) => setNewPromptVideo(e.target.value)}
                    rows={4}
                    placeholder="Nhập visual prompt chi tiết bằng tiếng Anh (cinematic lighting, camera angle, 8k resolution...)"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:border-ruby outline-none resize-none font-mono"
                  />
                </div>

                {/* Audio Prompt Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Audio & Voice Prompt (Lời thoại & SFX)
                  </label>
                  <textarea
                    value={selectedJob?.prompt_audio || newPromptAudio}
                    onChange={(e) => setNewPromptAudio(e.target.value)}
                    rows={3}
                    placeholder="Nhập lời thoại diễn viên và hiệu ứng âm thanh không gian..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:border-purple-600 outline-none resize-none font-mono"
                  />
                </div>

                {/* Token Cost Estimation */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-600 font-medium">Chi phí ước tính phân cảnh:</span>
                  <span className="text-amber-600 font-mono font-bold text-sm">
                    {selectedJob?.token_cost || tokenCost} Tokens
                  </span>
                </div>

                {/* Action trigger buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddJob}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Phân Cảnh Mới</span>
                  </button>

                  <button
                    onClick={() => selectedJob && handleGenerate(selectedJob.id)}
                    disabled={renderingJobId === selectedJob?.id}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-ruby hover:bg-ruby-dark text-white text-xs font-bold shadow-md shadow-ruby/20 transition-all cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{renderingJobId === selectedJob?.id ? 'Đang Render...' : 'Trigger Sinh Clip'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SUBMIT EPISODE MODAL (Summary of Actual Tokens)     */}
      {/* ==================================================== */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold">Nộp Bản Dựng Tập Phim Cho Reviewer</h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tất cả {jobs.length} phân cảnh đã được render hoàn chỉnh. Xác nhận nộp gói tập phim (<code>episode_package</code>) sang Reviewer để thực hiện thẩm định nội dung & kiểm định pháp lý AI.
            </p>

            {/* Token & Specs Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tên tập phim:</span>
                <span className="font-bold text-slate-900">{currentPackage.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Số lượng phân cảnh:</span>
                <span className="font-mono font-bold text-slate-900">{jobs.length} Cảnh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Thời lượng ước tính:</span>
                <span className="font-mono font-bold text-slate-900">{currentPackage.total_duration}</span>
              </div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Token Quota được cấp:</span>
                <span className="font-mono font-bold text-amber-600">{currentPackage.quota_allocated} Tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Token thực tế tiêu thụ:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">{currentPackage.actual_tokens_used} Tokens</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                onClick={handleSubmitToChecker}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all cursor-pointer"
              >
                Xác Nhận Nộp Cho Checker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
