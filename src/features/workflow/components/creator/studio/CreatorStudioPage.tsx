'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Plus, Send } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { StudioPlayer } from './StudioPlayer';
import { StudioTimeline } from './StudioTimeline';
import { GeneratorPanel, AI_MODELS } from './GeneratorPanel';
import { SubmitEpisodeModal } from './SubmitEpisodeModal';
import { toast } from '@/components/ui/Toast';

export interface CreatorStudioPageProps {
  episodeId: string;
}

export function CreatorStudioPage({ episodeId }: CreatorStudioPageProps) {
  const router = useRouter();
  const { project, triggerGenerationJob, addSceneJob, removeSceneJob, submitEpisodePackage, setActivePackage } = useWorkflowStore();

  const currentPackage = project.episodes.find((e) => e.id === episodeId) || project.episodes[0];
  const jobs = currentPackage?.jobs || [];
  const assets = currentPackage?.assets || [];

  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newPromptVideo, setNewPromptVideo] = useState('');
  const [newPromptAudio, setNewPromptAudio] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [tokenCost] = useState(70);
  const [renderingJobId, setRenderingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (currentPackage) {
      setActivePackage(currentPackage.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the episode itself changes
  }, [currentPackage?.id]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const selectedAsset = assets.find((a) => a.job_id === selectedJob?.id) || assets[0];

  const handleGenerate = (jobId: string) => {
    setRenderingJobId(jobId);
    triggerGenerationJob(currentPackage.id, jobId);
    setTimeout(() => setRenderingJobId(null), 4000);
  };

  const handleAddJob = () => {
    const nextSceneNum = jobs.length + 1;
    const titleToUse = newSceneTitle.trim() || `Cảnh ${nextSceneNum}: Phân Cảnh Mới #${nextSceneNum}`;
    addSceneJob(currentPackage.id, {
      episode_id: currentPackage.id,
      scene_id: `scene-${nextSceneNum}-${Date.now()}`,
      scene_number: nextSceneNum,
      title: titleToUse,
      ai_model: selectedModel,
      prompt_video: newPromptVideo.trim() || 'Cinematic wide angle, highly detailed lighting, 8k render',
      prompt_audio: newPromptAudio.trim() || 'Ambient cinematic background music and sound effects',
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
      toast.success(
        'Đã nộp bản dựng thành công!',
        'Gói tập phim đã được chuyển sang Thẩm định viên (Reviewer / Checker) để kiểm định nội dung & pháp lý.'
      );
      router.push('/creator');
    }
  };

  const allCompleted = jobs.length > 0 && jobs.every((j) => j.status === 'completed');
  const remainingQuota = currentPackage.quota_allocated - currentPackage.actual_tokens_used;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* Studio Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/creator"
            aria-label="Quay lại Dashboard Creator"
            className="p-2 rounded-xl bg-white dark:bg-[#151822] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
                AI Production Studio
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Tập {currentPackage.episode_number}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {currentPackage.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Quota Tracker Box */}
          <div className="bg-white dark:bg-[#151822] px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 flex items-center gap-3 shadow-xs">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
                Hạn Mức Quota
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {currentPackage.actual_tokens_used.toLocaleString()} / {currentPackage.quota_allocated.toLocaleString()} Tokens
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:border-white/10" />
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
                Còn lại
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  remainingQuota < 50
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {remainingQuota.toLocaleString()} Tokens
              </span>
            </div>
            <button
              onClick={() => {
                toast.info(
                  'Đã gửi yêu cầu cấp thêm Quota',
                  'Thông báo xin cấp thêm Token Quota đã được chuyển tới Thẩm định viên (Reviewer).'
                );
              }}
              title="Xin cấp thêm Token Quota"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={!allCompleted}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition shadow-xs cursor-pointer ${
              allCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp Bản Dựng Cho Checker</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <StudioPlayer
            selectedJob={selectedJob}
            selectedAsset={selectedAsset}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
          <StudioTimeline
            jobs={jobs}
            selectedJobId={selectedJobId}
            renderingJobId={renderingJobId}
            onSelectJob={setSelectedJobId}
            onGenerate={handleGenerate}
            onRemove={(jobId) => removeSceneJob(currentPackage.id, jobId)}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <GeneratorPanel
            selectedJob={selectedJob}
            newSceneTitle={newSceneTitle}
            onSceneTitleChange={setNewSceneTitle}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            newPromptVideo={newPromptVideo}
            onPromptVideoChange={setNewPromptVideo}
            newPromptAudio={newPromptAudio}
            onPromptAudioChange={setNewPromptAudio}
            tokenCost={tokenCost}
            isGenerating={renderingJobId === selectedJob?.id}
            onAddJob={handleAddJob}
            onGenerateSelected={() => selectedJob && handleGenerate(selectedJob.id)}
          />
        </div>
      </div>

      <SubmitEpisodeModal
        open={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitToChecker}
        currentPackage={currentPackage}
        jobsCount={jobs.length}
      />
    </div>
  );
}
