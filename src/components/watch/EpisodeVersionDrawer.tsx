'use client';

import { Episode, EpisodeVersion } from '@/types/movie';

interface EpisodeVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode;
  activeVersionId: string;
  onSelectVersion: (version: EpisodeVersion) => void;
}

export default function EpisodeVersionDrawer({
  isOpen,
  onClose,
  episode,
  activeVersionId,
  onSelectVersion,
}: EpisodeVersionDrawerProps) {
  if (!isOpen) return null;

  const versions = episode.versions || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-xl h-full bg-[#111319] border-l border-white/10 p-6 overflow-y-auto flex flex-col z-10 animate-slide-left shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🗂️</span>
              <h2 className="text-lg font-bold text-foreground">
                Quản Lý Phiên Bản & Lịch Sử Hiệu Chỉnh
              </h2>
            </div>
            <p className="text-xs text-muted-light">
              Tập {episode.episodeNumber}: <strong className="text-foreground">{episode.title}</strong> • Tổng cộng {versions.length} phiên bản
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-muted-light hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* AI Compliance Note */}
        <div className="my-4 p-3 rounded-xl bg-neon/10 border border-neon/20 flex items-start gap-2.5">
          <span className="text-base">🛡️</span>
          <p className="text-[11px] text-neon-light leading-relaxed">
            <strong>Quy chuẩn kiểm duyệt Điều 44 Luật AI:</strong> Mọi lần cập nhật prompt, đổi model render hoặc cắt ghép video AI đều được hệ thống gắn nhãn phiên bản, ghi nhật ký thay đổi (changelog) và lưu vết kiểm duyệt minh bạch.
          </p>
        </div>

        {/* Versions Timeline List */}
        <div className="space-y-4 flex-1">
          {versions.map((ver, idx) => {
            const isSelected = ver.id === activeVersionId || (!activeVersionId && ver.isCurrent);

            return (
              <div
                key={ver.id}
                className={`glass-card p-4 transition-all border ${
                  isSelected
                    ? 'border-ruby/60 bg-ruby/[0.07] ring-1 ring-ruby/40 shadow-lg shadow-ruby/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Top line: Version Badge, Status, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-ruby/20 text-ruby font-mono text-xs font-bold">
                      {ver.versionNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ver.status === 'published'
                          ? 'bg-verified/20 text-verified border border-verified/30'
                          : ver.status === 'in_review'
                            ? 'bg-warning/20 text-warning border border-warning/30'
                            : 'bg-white/10 text-muted-light'
                      }`}
                    >
                      {ver.statusLabel}
                    </span>
                    {ver.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-coin/20 text-coin text-[10px] font-bold border border-coin/30">
                        ⭐ Bản chính thức
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-light">
                    {new Date(ver.releaseDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Version Title */}
                <h4 className="text-sm font-bold text-foreground mb-1">
                  {ver.versionTitle}
                </h4>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 my-2.5 text-[11px] bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <div>
                    <span className="text-muted-light">Người hiệu chỉnh:</span>
                    <p className="text-foreground font-medium truncate">{ver.author}</p>
                  </div>
                  <div>
                    <span className="text-muted-light">Mô hình AI sử dụng:</span>
                    <p className="text-neon font-medium truncate">{ver.aiModel}</p>
                  </div>
                  <div>
                    <span className="text-muted-light">Điểm duyệt nội dung:</span>
                    <p className="text-verified font-bold">{ver.moderationScore}/100</p>
                  </div>
                  <div>
                    <span className="text-muted-light">Thời lượng:</span>
                    <p className="text-foreground font-medium">{ver.duration}</p>
                  </div>
                </div>

                {/* Changelog list */}
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-light font-bold mb-1.5">
                    📝 Nhật ký hiệu chỉnh (Changelog):
                  </p>
                  <ul className="space-y-1">
                    {ver.changelog.map((item, cIdx) => (
                      <li key={cIdx} className="text-xs text-foreground/80 flex items-start gap-1.5">
                        <span className="text-ruby text-sm leading-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Switch / Select Action */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-muted">
                    {isSelected ? 'Đang được phát trong Player' : 'Có thể phát để đối chiếu'}
                  </span>

                  <button
                    onClick={() => onSelectVersion(ver)}
                    disabled={isSelected}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-verified/20 text-verified border border-verified/40 cursor-default'
                        : 'bg-white/10 hover:bg-ruby hover:text-white text-foreground active:scale-95'
                    }`}
                  >
                    {isSelected ? '✓ Đang phát bản này' : '▶ Chọn phát bản này'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-4 mt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-muted">
            Mỗi phiên bản được gắn mã băm SHA-256 bất biến phục vụ công tác tra cứu kiểm duyệt.
          </p>
        </div>
      </div>
    </div>
  );
}
