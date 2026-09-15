'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import RoleNavHeader from '@/components/dashboard/RoleNavHeader';
import {
  Video,
  Play,
  Pause,
  Zap,
  Sparkles,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  ArrowLeft,
  Settings,
  Cpu,
  Volume2,
  Film,
  Eye,
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

  const currentPackage = project.episodes.find((e) => e.id === episodeId) || project.episodes[0];
  const jobs = currentPackage?.jobs || [];
  const assets = currentPackage?.assets || [];

  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [activeVideoPreview, setActiveVideoPreview] = useState<string>(assets[0]?.url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New Scene Generation State
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newPromptVideo, setNewPromptVideo] = useState('');
  const [newPromptAudio, setNewPromptAudio] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [tokenCost, setTokenCost] = useState(70);

  const [renderingJobId, setRenderingJobId] = useState<string | null>(null);

  React.useEffect(() => {
    if (currentPackage) {
      setActivePackage(currentPackage.id);
      if (jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(jobs[0].id);
      }
    }
  }, [currentPackage, jobs, selectedJobId, setActivePackage]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const selectedAsset = assets.find((a) => a.job_id === selectedJob?.id);

  const handleGenerate = async (jobId: string) => {
    setRenderingJobId(jobId);
    const success = await triggerGenerationJob(currentPackage.id, jobId);
    setRenderingJobId(null);
    if (success) {
      const updatedAsset = assets.find((a) => a.job_id === jobId);
      if (updatedAsset) {
        setActiveVideoPreview(updatedAsset.url);
      }
    }
  };

  const handleAddJob = () => {
    if (!newSceneTitle.trim() || !newPromptVideo.trim()) {
      alert('Vui lòng nhập tên phân cảnh và Visual Prompt!');
      return;
    }

    addSceneJob(currentPackage.id, {
      episode_id: currentPackage.id,
      scene_id: `sc-${Date.now()}`,
      scene_number: jobs.length + 1,
      title: newSceneTitle,
      prompt_video: newPromptVideo,
      prompt_audio: newPromptAudio || 'Voiceover and ambient background.',
      ai_model: selectedModel,
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
      router.push('/(dashboard)/creator');
    }
  };

  const allCompleted = jobs.length > 0 && jobs.every((j) => j.status === 'completed');
  const remainingQuota = currentPackage.quota_allocated - currentPackage.actual_tokens_used;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-100 pb-20 font-sans">
      {/* Role Navigation Top Header */}
      <RoleNavHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Studio Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link
              href="/(dashboard)/creator"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-ruby/20 text-ruby-light border border-ruby/40">
                  AI STUDIO WORKSPACE
                </span>
                <span className="text-xs text-slate-400 font-mono">Tập {currentPackage.episode_number}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">{currentPackage.title}</h2>
            </div>
          </div>

          {/* Quota tracker & Submit Action */}
          <div className="flex items-center gap-3">
            <div className="bg-[#161922] px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Hạn Mức Quota</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {currentPackage.actual_tokens_used} / {currentPackage.quota_allocated} Tokens
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Còn lại</span>
                <span className={`text-xs font-mono font-bold ${remainingQuota < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {remainingQuota} Tokens
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={!allCompleted}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                allCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-900/30 hover:scale-105'
                  : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Episode to Checker</span>
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
            <div className="bg-[#161922] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-3.5 bg-[#11141D] border-b border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Video className="w-4 h-4 text-ruby" />
                  <span>Trình Phát Ghép Bản Dựng Phân Cảnh (Episode Assembly)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[11px]">
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

                      <span className="text-slate-400 font-mono text-[11px]">
                        Model: {selectedJob?.ai_model || 'CinemaGen v3.2'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clip Metadata Bar */}
              {selectedAsset && (
                <div className="p-3.5 bg-[#0E1017] border-t border-white/10 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Độ phân giải</span>
                    <span className="font-mono font-bold text-white">{selectedAsset.resolution}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Thời lượng</span>
                    <span className="font-mono font-bold text-white">{selectedAsset.duration_seconds} Giây</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Dung lượng</span>
                    <span className="font-mono font-bold text-white">{selectedAsset.file_size_mb} MB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Chi phí Token</span>
                    <span className="font-mono font-bold text-amber-300">{selectedJob.token_cost} Tokens</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Multi-Scene Assembly (episode_package_asset) */}
            <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neon" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Timeline Phân Cảnh Ghép Tập ({jobs.length} Cảnh)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Hoàn thành: <b className="text-emerald-400">{jobs.filter((j) => j.status === 'completed').length}</b> / {jobs.length} Cảnh
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
                          ? 'bg-gradient-to-r from-white/10 to-white/5 border-ruby ring-1 ring-ruby/40'
                          : 'bg-[#0E1017] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-ruby/20 border border-ruby/40 flex items-center justify-center text-ruby-light font-mono font-bold text-xs shrink-0">
                          #{job.scene_number}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{job.title}</h4>
                          <p className="text-[11px] text-slate-400 truncate max-w-md font-mono mt-0.5">
                            {job.ai_model} • {job.token_cost} Tokens
                          </p>
                        </div>
                      </div>

                      {/* Job Action / Status */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isRendering ? (
                          <div className="flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 px-3 py-1.5 rounded-lg">
                            <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                            <span className="text-xs font-bold text-blue-300 font-mono">
                              Rendering ({job.progress}%)
                            </span>
                          </div>
                        ) : isCompleted ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hoàn Tất</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerate(job.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-semibold border border-white/10"
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
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ruby hover:bg-ruby-dark text-white text-xs font-bold shadow-md shadow-ruby/20 transition-all cursor-pointer"
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
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
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
            <div className="bg-[#161922] p-5 rounded-2xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-ruby" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Bộ Điều Khiển Sinh Tài Nguyên AI (generation_job)
                  </h3>
                </div>
              </div>

              {/* Form to add or edit selected scene */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Tên Phân Cảnh (Scene Title)
                  </label>
                  <input
                    type="text"
                    value={selectedJob?.title || newSceneTitle}
                    onChange={(e) => setNewSceneTitle(e.target.value)}
                    placeholder="Ví dụ: Cảnh 4: Rượt đuổi trên xa lộ tầng không..."
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-ruby outline-none"
                  />
                </div>

                {/* AI Model Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Mô Hình AI Tạo Sinh (ai_model)
                  </label>
                  <select
                    value={selectedJob?.ai_model || selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-ruby outline-none cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Visual Video Prompt (Mô tả hình ảnh & Ánh sáng)
                  </label>
                  <textarea
                    value={selectedJob?.prompt_video || newPromptVideo}
                    onChange={(e) => setNewPromptVideo(e.target.value)}
                    rows={4}
                    placeholder="Nhập visual prompt chi tiết bằng tiếng Anh (cinematic lighting, camera angle, 8k resolution...)"
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl p-3 text-xs text-slate-200 focus:border-ruby outline-none resize-none font-mono"
                  />
                </div>

                {/* Audio Prompt Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Audio & Voice Prompt (Lời thoại & SFX)
                  </label>
                  <textarea
                    value={selectedJob?.prompt_audio || newPromptAudio}
                    onChange={(e) => setNewPromptAudio(e.target.value)}
                    rows={3}
                    placeholder="Nhập lời thoại diễn viên và hiệu ứng âm thanh không gian..."
                    className="w-full bg-[#0E1017] border border-white/15 rounded-xl p-3 text-xs text-slate-200 focus:border-neon outline-none resize-none font-mono"
                  />
                </div>

                {/* Token Cost Estimation */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1017] border border-white/10 text-xs">
                  <span className="text-slate-400 font-medium">Chi phí ước tính phân cảnh:</span>
                  <span className="text-amber-300 font-mono font-bold text-sm">
                    {selectedJob?.token_cost || tokenCost} Tokens
                  </span>
                </div>

                {/* Action trigger buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddJob}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Phân Cảnh Mới</span>
                  </button>

                  <button
                    onClick={() => selectedJob && handleGenerate(selectedJob.id)}
                    disabled={renderingJobId === selectedJob?.id}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-ruby to-ruby-dark text-white text-xs font-bold shadow-lg shadow-ruby/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-white/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Nộp Bản Dựng Tập Phim Cho Reviewer</h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tất cả {jobs.length} phân cảnh đã được render hoàn chỉnh. Xác nhận nộp gói tập phim (<code>episode_package</code>) sang Reviewer để thực hiện thẩm định nội dung & kiểm định pháp lý AI.
            </p>

            {/* Token & Specs Summary Box */}
            <div className="bg-[#0E1017] p-4 rounded-xl border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tên tập phim:</span>
                <span className="font-bold text-white">{currentPackage.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Số lượng phân cảnh:</span>
                <span className="font-mono font-bold text-white">{jobs.length} Cảnh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Thời lượng ước tính:</span>
                <span className="font-mono font-bold text-white">{currentPackage.total_duration}</span>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token Quota được cấp:</span>
                <span className="font-mono font-bold text-amber-300">{currentPackage.quota_allocated} Tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token thực tế tiêu thụ:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{currentPackage.actual_tokens_used} Tokens</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                onClick={handleSubmitToChecker}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
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
