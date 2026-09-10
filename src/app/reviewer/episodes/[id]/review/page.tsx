'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import ProductionHeader from '@/components/production/ProductionHeader';
import QuotaGaugeBar from '@/components/production/QuotaGaugeBar';
import FeedbackHistory from '@/components/production/FeedbackHistory';
import RequestChangesModal from '@/components/production/RequestChangesModal';
import CompliancePublishModal from '@/components/production/CompliancePublishModal';
import { useProductionStore } from '@/store/useProductionStore';
import { ComplianceMetadata } from '@/types/production';

export default function EpisodeReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const episodeId = resolvedParams.id;

  const {
    getEpisode,
    getProject,
    requestContentChanges,
    approveContent,
    verifyComplianceAndPublish,
  } = useProductionStore();

  const episode = getEpisode(episodeId) || getEpisode('ep-prod-02');
  const project = getProject();

  const [isRequestChangesOpen, setIsRequestChangesOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!episode || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-bold">Không tìm thấy tập phim cần thẩm định.</p>
          <Link href="/reviewer/projects/create" className="text-ruby underline text-sm mt-2 inline-block">
            Quay lại trang quản lý dự án
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmChanges = (feedback: string) => {
    requestContentChanges(project.id, episode.id, feedback);
    setToastMessage('Đã trả bản dựng về cho Creator kèm yêu cầu chỉnh sửa!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveContentOnly = () => {
    approveContent(project.id, episode.id);
    setIsComplianceOpen(true);
  };

  const handleConfirmPublish = (complianceData: ComplianceMetadata, scheduledDate: string) => {
    verifyComplianceAndPublish(project.id, episode.id, complianceData, scheduledDate);
    setToastMessage('Chúc mừng! Tập phim đã được xuất bản chính thức lên nền tảng!');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const isPublished = episode.status === 'PUBLISHED';
  const isContentRejected = episode.status === 'CONTENT_REJECTED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-zinc-100 transition-colors">
      <ProductionHeader
        title={`Thẩm Định: ${episode.title}`}
        subtitle="Split-view thẩm định video, kiểm định Luật AI & Xuất bản"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-500/30 flex items-center gap-2 animate-bounce-in">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Summary Bar & Status */}
        <div className="glass-card p-5 sm:p-6 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-ruby text-white">
                Màn Hình 1.2
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Thẩm Định Tập Phim & Kiểm Tra Tuân Thủ AI
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {episode.title}
            </h1>
          </div>

          {/* Action Decision Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {!isPublished ? (
              <>
                <button
                  onClick={() => setIsRequestChangesOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Request Content Changes</span>
                </button>

                <button
                  onClick={handleApproveContentOnly}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Approve Content & Kiểm Định Pháp Lý</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>ĐÃ XUẤT BẢN LÊN SÀN (PUBLISHED)</span>
                </span>
                <Link
                  href="/watch/1"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ruby hover:bg-ruby-dark shadow-md shadow-ruby/30 transition-all"
                >
                  Xem Trên Nền Tảng
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Split-View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Nửa Trái: Trình Phát Video Bản Dựng Hoàn Chỉnh (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-card overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
              {/* Video Player Mock Header */}
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">Bản Dựng Final Master 4K</span>
                </div>
                <span className="font-mono text-zinc-400">Thời lượng: {episode.totalDuration}</span>
              </div>

              {/* Video Player Screen */}
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80"
                  alt="Draft Video"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />

                {/* AI Law Compliance Watermark Badge in Video */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-ruby" />
                  <span>AI CONTENT LABEL • ĐIỀU 44 LUẬT AI</span>
                </div>

                {/* Play Button Simulation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-ruby/90 text-white flex items-center justify-center shadow-2xl shadow-ruby/50 group-hover:scale-110 transition-transform cursor-pointer">
                    <svg className="w-7 h-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Video Controls Bar Simulation */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-white text-xs">
                  <span className="font-mono">00:00 / {episode.totalDuration}</span>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold">4K UHD</span>
                    <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold">Dolby Atmos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Quota Consumption Visual Bar */}
            <QuotaGaugeBar
              usedTokens={episode.actualTokensUsed}
              allocatedTokens={episode.quota?.allocatedTokens || 450}
              episodeTitle={`Thực tế tiêu thụ: ${episode.actualTokensUsed} / ${episode.quota?.allocatedTokens || 450} Tokens`}
            />
          </div>

          {/* Nửa Phải: Bảng Thông Số Kỹ Thuật & Kịch Bản Phân Cảnh (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Storyboard Scene Breakdown */}
            <div className="glass-card p-5 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Phân Cảnh & Thông Số Kỹ Thuật</span>
                </h3>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                  {episode.scenes.length} Scenes
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {episode.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Cảnh #{scene.sceneNumber}: {scene.title}
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {scene.tokenCost} Tokens
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-300 italic text-[11px] line-clamp-2">
                      &quot;{scene.prompt}&quot;
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10">
                        {scene.videoModel.split('(')[0]}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10">
                        {scene.durationSec}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback & Interaction History */}
            <div className="glass-card p-5 border border-slate-200 dark:border-white/10">
              <FeedbackHistory feedbacks={episode.plan?.feedbackHistory || []} />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <RequestChangesModal
        isOpen={isRequestChangesOpen}
        onClose={() => setIsRequestChangesOpen(false)}
        type="content"
        targetTitle={episode.title}
        onConfirm={handleConfirmChanges}
      />

      <CompliancePublishModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
        episode={episode}
        onConfirm={handleConfirmPublish}
      />
    </div>
  );
}
