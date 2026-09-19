'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { StudioPlayer } from './StudioPlayer';
import { StudioTimeline } from './StudioTimeline';
import { GeneratorPanel } from './GeneratorPanel';
import { resolveModel, stepDefaults } from '@/features/workflow/lib/modelRegistry';
import { SubmitEpisodeModal } from './SubmitEpisodeModal';
import type { GenerationStep } from '@/types/workflow';

export interface CreatorStudioPageProps {
  episodeId: string;
}

function makeDraftStep(): GenerationStep {
  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    function_type: 'VIDEO',
    prompt: '',
    status: 'pending',
    ...stepDefaults({ function_type: 'VIDEO' }),
  };
}

export function CreatorStudioPage({ episodeId }: CreatorStudioPageProps) {
  const router = useRouter();
  const {
    project,
    triggerGenerationJob,
    addSceneJob,
    removeSceneJob,
    addGenerationStep,
    updateGenerationStep,
    removeGenerationStep,
    submitEpisodePackage,
    setActivePackage,
  } = useWorkflowStore();

  const currentPackage = project.episodes.find((e) => e.id === episodeId) || project.episodes[0];
  const jobs = currentPackage?.jobs || [];
  const assets = currentPackage?.assets || [];

  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [draftSteps, setDraftSteps] = useState<GenerationStep[]>([makeDraftStep()]);
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
    const stepsToUse = draftSteps.filter((s) => s.prompt.trim().length > 0 && resolveModel(s).match !== 'pending');
    addSceneJob(currentPackage.id, {
      episode_id: currentPackage.id,
      scene_id: `scene-${nextSceneNum}-${Date.now()}`,
      scene_number: nextSceneNum,
      title: titleToUse,
      generation_steps: stepsToUse,
      token_cost: stepsToUse.reduce((sum, s) => sum + s.token_cost, 0),
    });
    setNewSceneTitle('');
    setDraftSteps([makeDraftStep()]);
  };

  // Editing steps operates on whichever scene is selected in the timeline;
  // falls back to the new-scene draft when nothing is selected yet.
  const handleAddStep = () => {
    if (selectedJob) {
      addGenerationStep(currentPackage.id, selectedJob.id, {
        function_type: 'VIDEO',
        prompt: '',
        status: 'pending',
        ...stepDefaults({ function_type: 'VIDEO' }),
      });
    } else {
      setDraftSteps((prev) => [...prev, makeDraftStep()]);
    }
  };

  const handleUpdateStep = (stepId: string, data: Partial<GenerationStep>) => {
    if (selectedJob) {
      updateGenerationStep(currentPackage.id, selectedJob.id, stepId, data);
    } else {
      setDraftSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...data } : s)));
    }
  };

  const handleRemoveStep = (stepId: string) => {
    if (selectedJob) {
      removeGenerationStep(currentPackage.id, selectedJob.id, stepId);
    } else {
      setDraftSteps((prev) => prev.filter((s) => s.id !== stepId));
    }
  };

  const handleSubmitToChecker = () => {
    const success = submitEpisodePackage(currentPackage.id);
    if (success) {
      setIsSubmitModalOpen(false);
      alert('Đã nộp bản dựng cho người kiểm duyệt.');
      router.push('/creator');
    }
  };

  const allCompleted = jobs.length > 0 && jobs.every((j) => j.status === 'completed');
  const remainingQuota = currentPackage.quota_allocated - currentPackage.actual_tokens_used;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="min-w-0">
          <Link href="/creator" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Quay lại phim
          </Link>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mt-1.5 truncate">{currentPackage.title}</h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Token: {currentPackage.actual_tokens_used.toLocaleString()} / {currentPackage.quota_allocated.toLocaleString()}
            <span className={`ml-1.5 ${remainingQuota < 50 ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}`}>(còn {remainingQuota.toLocaleString()})</span>
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={!allCompleted}
            title={allCompleted ? undefined : 'Cần tạo xong tất cả phân cảnh trước khi nộp'}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0C10]"
          >
            Nộp bản dựng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <StudioPlayer selectedJob={selectedJob} selectedAsset={selectedAsset} />
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
            steps={selectedJob ? selectedJob.generation_steps : draftSteps}
            onAddStep={handleAddStep}
            onUpdateStep={handleUpdateStep}
            onRemoveStep={handleRemoveStep}
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
