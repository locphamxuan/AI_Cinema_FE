'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { StudioPlayer } from './StudioPlayer';
import { StudioTimeline } from './StudioTimeline';
import { routeDefaults } from '@/features/workflow/lib/modelRouting';
import { SubmitEpisodeModal } from './SubmitEpisodeModal';
import { toast } from '@/components/ui/Toast';
import type { GenerationFunctionType, GenerationStep } from '@/types/workflow';
import { isDraftStep } from '@/features/workflow/lib/jobAdapter';
import { SceneWorkspace } from './SceneWorkspace';
import { useKeyedRequest } from './useKeyedRequest';
import { workflowService } from '@/services/workflowService';
import { canProduce } from '@/features/workflow/lib/workflowState';

const LOCKED_REASON: Partial<Record<string, string>> = {
  EPISODE_SUBMITTED: 'Bản dựng đang chờ Reviewer kiểm định. Bạn chỉ sửa được khi bản dựng bị trả về.',
  COMPLIANCE_PASSED: 'Bản dựng đã được duyệt và chờ phát hành.',
  PUBLISHED: 'Tập phim đã phát hành.',
};

export interface CreatorStudioPageProps {
  episodeId: string;
}

export function CreatorStudioPage({ episodeId }: CreatorStudioPageProps) {
  const router = useRouter();
  const {
    project,
    routing,
    loadRouting,
    routeStep,
    loadProjects,
    loadJobs,
    triggerGenerationJob,
    addGenerationStep,
    updateGenerationStep,
    removeGenerationStep,
    regenerateStep,
    discardStep,
    updateSceneDirection,
    resetScene,
    submitEpisodePackage,
    setActivePackage,
  } = useWorkflowStore();

  const currentPackage = project.episodes.find((e) => e.id === episodeId);
  const jobs = currentPackage?.jobs || [];
  const assets = currentPackage?.assets || [];

  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [renderingJobId, setRenderingJobId] = useState<string | null>(null);

  // Scene links are checked again whenever a scene's generated content or description changes.
  const continuityKey = currentPackage
    ? `${currentPackage.id}|${jobs.map((j) => `${j.id}:${j.generation_steps.filter((st) => !isDraftStep(st)).map((st) => `${st.id}${st.status}`).join('.')}`).join(',')}|${currentPackage.brief.scene_breakdown.map((sc) => sc.description).join('|')}`
    : null;
  const continuityLocked = !currentPackage || !canProduce(currentPackage.status);
  const continuity = useKeyedRequest(continuityLocked ? null : continuityKey, () => workflowService.getPlanContinuity(currentPackage!.id));

  // Opened by URL (e.g. after a refresh): the project is not in memory yet.
  useEffect(() => {
    loadRouting();
    if (!currentPackage) loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opened episode
  }, [episodeId]);

  useEffect(() => {
    if (currentPackage) {
      setActivePackage(currentPackage.id);
      loadJobs(currentPackage.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the episode itself changes
  }, [currentPackage?.id]);

  if (!currentPackage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-center px-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Không tìm thấy tập phim</h2>
        <Link href="/creator" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const selectedAsset = assets.find((a) => a.job_id === selectedJob?.id);

  const handleGenerate = async (jobId: string) => {
    setRenderingJobId(jobId);
    const ok = await triggerGenerationJob(currentPackage.id, jobId);
    setRenderingJobId(null);
    if (ok) toast.success('Đã tạo xong', 'Kết quả đã được lưu vào cảnh này.');
  };

  const selectedScene = currentPackage.brief.scene_breakdown.find((s) => s.id === selectedJob?.scene_id);

  const handleAddStep = (function_type: GenerationFunctionType = 'VIDEO', prompt = '') => {
    if (!selectedJob) return;
    addGenerationStep(currentPackage.id, selectedJob.id, {
      function_type,
      prompt,
      status: 'pending',
      ...routeDefaults(routing, { function_type }),
    });
  };

  const handleSaveScene = async (data: { title: string; description: string }) => {
    const ok = await updateSceneDirection(selectedJob!.scene_id, data);
    if (ok) toast.success('Đã lưu cảnh', 'Mô tả mới sẽ dùng cho các lần tạo sau.');
    return ok;
  };

  const handleResetScene = async () => {
    const ok = await resetScene(selectedJob!.scene_id);
    if (ok) toast.success('Đã làm lại cảnh', 'Cảnh đã trống, bạn có thể tạo lại từ đầu.');
    return ok;
  };

  const handleUpdateStep = (stepId: string, data: Partial<GenerationStep>) => {
    if (selectedJob) updateGenerationStep(currentPackage.id, selectedJob.id, stepId, data);
  };

  const handleRemoveStep = (stepId: string) => {
    if (selectedJob) removeGenerationStep(currentPackage.id, selectedJob.id, stepId);
  };

  const handleRegenerateStep = async (stepId: string, prompt: string) => {
    if (!selectedJob) return false;
    setRenderingJobId(selectedJob.id);
    const ok = await regenerateStep(currentPackage.id, selectedJob.id, stepId, prompt);
    setRenderingJobId(null);
    if (ok) toast.success('Đã tạo lại', 'Mục này đã được tạo lại với mô tả mới.');
    return ok;
  };

  const handleDiscardStep = async (stepId: string) => {
    if (!selectedJob) return false;
    const ok = await discardStep(currentPackage.id, selectedJob.id, stepId);
    if (ok) toast.success('Đã xóa mục', 'Mục này không còn nằm trong cảnh.');
    return ok;
  };

  const handleSubmitToChecker = async () => {
    setIsSubmitting(true);
    const success = await submitEpisodePackage(currentPackage.id);
    setIsSubmitting(false);
    if (success) {
      setIsSubmitModalOpen(false);
      toast.success(
        'Đã gửi bản dựng',
        'Reviewer sẽ kiểm tra nội dung và pháp lý của tập này.'
      );
      router.push('/creator');
    }
  };

  const allCompleted = jobs.length > 0 && jobs.every((j) => j.status === 'completed');
  const locked = !canProduce(currentPackage.status);
  const canSubmit = allCompleted && !locked;
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

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Quota Tracker Box */}
          <div className="bg-white dark:bg-[#151822] px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 flex items-center gap-3 shadow-xs">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
                Token được cấp
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {currentPackage.actual_tokens_used.toLocaleString()} / {currentPackage.quota_allocated.toLocaleString()} token
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
                {remainingQuota.toLocaleString()} token
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={!canSubmit}
            title={locked ? LOCKED_REASON[currentPackage.status] : allCompleted ? undefined : 'Tạo xong tất cả các cảnh rồi mới gửi được'}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0C10]"
          >
            Gửi bản dựng
          </button>
        </div>
      </div>

      {locked && (
        <p role="status" className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300">
          {LOCKED_REASON[currentPackage.status] ?? 'Tập này chưa được cấp token nên chưa sản xuất được.'}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <StudioPlayer selectedJob={selectedJob} selectedAsset={selectedAsset} />
          <StudioTimeline
            jobs={jobs}
            selectedJobId={selectedJobId}
            renderingJobId={renderingJobId}
            onSelectJob={setSelectedJobId}
            onGenerate={handleGenerate}
            locked={locked}
            continuity={locked ? undefined : continuity}
          />
        </div>

        <div className="lg:col-span-5">
          {selectedJob ? (
            <SceneWorkspace
              key={selectedJob.id}
              job={selectedJob}
              description={selectedScene?.description ?? ''}
              locked={locked}
              isGenerating={renderingJobId === selectedJob.id}
              busy={renderingJobId !== null}
              remainingQuota={remainingQuota}
              onAddStep={handleAddStep}
              onUpdateStep={handleUpdateStep}
              onRouteStep={(stepId, change) => routeStep(currentPackage.id, selectedJob.id, stepId, change)}
              onRemoveStep={handleRemoveStep}
              onRegenerateStep={handleRegenerateStep}
              onDiscardStep={handleDiscardStep}
              onGenerate={() => handleGenerate(selectedJob.id)}
              onSaveScene={handleSaveScene}
              onResetScene={handleResetScene}
            />
          ) : (
            <p className="p-5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">Kế hoạch chưa có cảnh nào.</p>
          )}
        </div>
      </div>

      <SubmitEpisodeModal
        open={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitToChecker}
        isSubmitting={isSubmitting}
        currentPackage={currentPackage}
        jobsCount={jobs.length}
      />
    </div>
  );
}
