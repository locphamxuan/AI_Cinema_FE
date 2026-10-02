'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Play, Lock, CheckCircle, ShieldCheck,  Calendar,  Info } from 'lucide-react';
import type { Movie, Episode } from '@/types/movie';
import { useAppStore } from '@/store/useAppStore';

interface MovieDetailQuickModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieDetailQuickModal({ movie, onClose }: MovieDetailQuickModalProps) {
  const { wallet, openUnlockModal, openAuthModal, isAuthenticated } = useAppStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'episodes' | 'compliance' | 'brief'>('episodes');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (movie) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movie, onClose]);

  if (!movie) return null;

  const handleEpisodeClick = (ep: Episode) => {
    if (ep.isFree || ep.isUnlocked) {
      // Navigate to watch page
      router.push(`/watch/${ep.id}`);
      return;
    }
    // Need unlock
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    openUnlockModal(ep.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Dark Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Body */}
      <div className="relative w-full max-w-4xl bg-[#12151E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col my-auto text-white">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-lg"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Hero Banner Section */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full shrink-0 overflow-hidden">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12151E] via-[#12151E]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12151E] via-transparent to-transparent w-2/3" />

          {/* Hero Meta Info */}
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider">
                {movie.badge || 'Độc Quyền AI'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/15 border border-white/20 text-white text-xs font-semibold">
                {movie.quality}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              {movie.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
              {movie.description}
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-6 px-6 border-b border-white/10 bg-[#0E1118] shrink-0 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('episodes')}
            className={`py-3.5 relative transition-colors cursor-pointer ${
              activeTab === 'episodes' ? 'text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Danh Sách Tập ({movie.episodes.length})</span>
            {activeTab === 'episodes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914] rounded-full shadow-[0_0_8px_#E50914]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3.5 relative flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'compliance' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Minh Bạch AI (Điều 44)</span>
            {activeTab === 'compliance' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10B981]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('brief')}
            className={`py-3.5 relative transition-colors cursor-pointer ${
              activeTab === 'brief' ? 'text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Kịch Bản & Hồ Sơ Phim</span>
            {activeTab === 'brief' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6] rounded-full shadow-[0_0_8px_#8B5CF6]" />
            )}
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: EPISODES & UNLOCK */}
          {activeTab === 'episodes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Chọn tập để xem hoặc mở khóa bằng ví Coin:</span>
                <span className="text-amber-400 font-medium">Số dư ví của bạn: {(wallet.mainCoin + wallet.bonusCoin).toLocaleString()} Coin</span>
              </div>

              {movie.episodes.map((ep) => {
                const canPlay = ep.isFree || ep.isUnlocked;

                return (
                  <div
                    key={ep.id}
                    onClick={() => handleEpisodeClick(ep)}
                    className="group/ep flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                  >
                    {/* Episode Thumbnail */}
                    <div className="relative w-28 sm:w-36 aspect-[16/9] rounded-xl overflow-hidden shrink-0 bg-black">
                      <img
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover/ep:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {canPlay ? (
                          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover/ep:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-black translate-x-0.5" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-500/80 text-black flex items-center justify-center shadow-lg">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                        {ep.duration}
                      </span>
                    </div>

                    {/* Episode Title & Synopsis */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#E50914]">Tập {ep.episodeNumber}</span>
                        <h4 className="text-sm font-bold text-white group-hover/ep:text-[#E50914] transition-colors truncate">
                          {ep.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {ep.synopsis || 'Bản phát hành chất lượng cao trên nền tảng AI Cinema.'}
                      </p>
                    </div>

                    {/* Action Status Pill */}
                    <div className="shrink-0 text-right">
                      {ep.isFree ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          Miễn Phí
                        </span>
                      ) : ep.isUnlocked ? (
                        <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã Mở Khóa
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{ep.price} Coins</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: COMPLIANCE DISCLOSURE (ARTICLE 44) */}
          {activeTab === 'compliance' && (
            <div className="space-y-4 animate-fade-in">
              {/* Compliance Header Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    Chứng Nhận Tuân Thủ Pháp Lý Trí Tuệ Nhân Tạo (AI Compliance)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Tác phẩm này đã được Ban Thẩm Định nền tảng kiểm tra, cấp mã chứng nhận và gắn nhãn theo{' '}
                    <strong>{movie.aiCompliance.complianceArticle}</strong>.
                  </p>
                </div>
              </div>

              {/* What the platform actually knows about the episodes it released */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Nhãn nội dung AI</span>
                  </div>
                  <p className="text-sm font-bold text-white">{movie.aiCompliance.disclaimer}</p>
                  <p className="text-[11px] text-slate-400">Reviewer gắn nhãn cho từng tập sau khi kiểm duyệt nội dung và pháp lý.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Phân loại độ tuổi</span>
                  </div>
                  <p className="text-sm font-bold text-white">{movie.aiCompliance.contentRating}</p>
                </div>
              </div>

              {/* Official Disclaimer */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-400 italic leading-relaxed">
                &ldquo;{movie.aiCompliance.disclaimer}&rdquo;
              </div>
            </div>
          )}

          {/* TAB 3: BRIEF & SCRIPT OVERVIEW */}
          {activeTab === 'brief' && (
            <div className="space-y-4 animate-fade-in text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Tóm tắt phim</span>
                </h4>
                <p>
                  {movie.contentBrief || 'Chưa có tóm tắt.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">Phát hành trên AI Cinema</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                  <li>Mỗi tập được kiểm duyệt nội dung và pháp lý trước khi phát hành.</li>
                  <li>Các tập đầu của mỗi phim xem miễn phí; các tập sau mở khoá bằng Coin.</li>
                  <li>Mọi tập đều mang nhãn nội dung AI.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
