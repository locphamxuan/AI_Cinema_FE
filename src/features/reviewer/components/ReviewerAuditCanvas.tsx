'use client';

import { useState } from 'react';
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Play,
  Pause,
  Building2,
  MessageSquare,
  Cpu,
  User,
  Clock,
  Layers,
  FileText,
  CheckCircle2,
  MoreHorizontal,
  Volume2,
  VolumeX,
  AlertTriangle,
} from 'lucide-react';
import type { MasterEpisode, AuditTicket } from '../types';

interface ReviewerAuditCanvasProps {
  episode: MasterEpisode;
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (newTime: number) => void;
  onTogglePlay: () => void;
  onMarkErrorAtCurrentTime: () => void;
  onToggleAiCompliance: () => void;
  isComplianceActive: boolean;
  tickets: AuditTicket[];
}

export function ReviewerAuditCanvas({
  episode,
  currentTime,
  isPlaying,
  onTimeChange,
  onTogglePlay,
  onMarkErrorAtCurrentTime,
  onToggleAiCompliance,
  isComplianceActive,
  tickets,
}: ReviewerAuditCanvasProps) {
  const [activeReportTab, setActiveReportTab] = useState<'script' | 'ai_prompts'>('script');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (currentTime / episode.durationSeconds) * 100);

  return (
    <div className="flex-1 min-w-0 bg-[#F9FAFB] dark:bg-[#090B10] text-[#0F172A] dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto transition-colors duration-200 font-sans">
      {/* ── 1. Thanh Header Phụ (Contra Pill Toolbar) ── */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        {/* Bộ chuyển tập & Autosave */}
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white border border-slate-200/80 dark:border-white/10 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            title="Thu phóng toàn màn hình"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="inline-flex items-center gap-1 bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-full px-1.5 py-1 shadow-xs">
            <button
              type="button"
              className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Tập trước: Tập 01"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 font-semibold text-[#0F172A] dark:text-slate-200">
              Tập 02 / 08
            </span>
            <button
              type="button"
              className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Tập sau: Tập 03"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-[#64748B] dark:text-slate-400 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Tự động lưu lúc 14:20</span>
          </span>
        </div>

        {/* Nút Gắn Nhãn AI Điều 44 (Contra Pill) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAiCompliance}
            className={`inline-flex items-center gap-2 rounded-full border transition-all text-xs font-semibold px-4 py-2 shadow-xs cursor-pointer ${
              isComplianceActive
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40'
                : 'border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.05] text-[#0F172A] dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            <ShieldCheck
              className={`w-4 h-4 ${
                isComplianceActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            />
            <span>
              {isComplianceActive ? 'Đã Cấp Nhãn AI Điều 44' : 'Gắn Nhãn AI Điều 44'}
            </span>
          </button>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white border border-slate-200/80 dark:border-white/10 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 2. Khung Video Player (Contra Dark Obsidian Hero Container) ── */}
      <section aria-label="Trình thẩm định Video Master">
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-[#0B0E14] shadow-md group">
          {/* Visual Poster / Frame */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={episode.videoUrl}
            alt={episode.episodeTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Cinema Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35 pointer-events-none" />

          {/* Center Play Indicator */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-white fill-white" />
            ) : (
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            )}
          </button>

          {/* Top Frosted Glass Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs z-10 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="bg-black/60 backdrop-blur-md text-white font-bold tracking-wider uppercase text-[10px] rounded-full px-3 py-1 border border-white/15">
                MASTER 4K UHD
              </span>
              <span className="bg-black/60 backdrop-blur-md text-white/90 text-xs rounded-full px-3 py-1 font-mono border border-white/10">
                FPS: 24.00 • ProRes 422 HQ
              </span>
            </div>

            <div className="bg-black/60 backdrop-blur-md text-white/90 text-xs rounded-full px-3.5 py-1 border border-white/10 font-medium">
              Studio: <span className="text-white font-semibold">{episode.studioName}</span>
            </div>
          </div>

          {/* Bottom Player Controls & Timestamp Scrubber */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-10 space-y-3">
            {/* Scrubber Progress Bar with Bug Markers */}
            <div className="relative w-full h-1.5 rounded-full bg-white/25 cursor-pointer group/bar">
              <div
                className="absolute top-0 left-0 bottom-0 rounded-full bg-white transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md group-hover/bar:scale-125 transition-transform"
                style={{ left: `${progressPercent}%` }}
              />

              {/* Timestamp Bug Markers on Timeline */}
              {tickets.map((tkt) => {
                const markerPos = (tkt.timestampSeconds / episode.durationSeconds) * 100;
                return (
                  <button
                    key={tkt.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimeChange(tkt.timestampSeconds);
                    }}
                    title={`Mốc lỗi [${tkt.timestampText}]: ${tkt.title}`}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 hover:bg-amber-300 border border-black shadow-sm z-20 cursor-pointer transition-transform hover:scale-150"
                    style={{ left: `${markerPos}%` }}
                  />
                );
              })}
            </div>

            {/* Bottom Row Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/85">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="text-white hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/75 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="font-mono text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                  <span className="text-white font-bold">{formatSeconds(currentTime)}</span> / {episode.durationText}
                </span>
              </div>

              {/* Prominent Timestamp Mark Button */}
              <button
                type="button"
                onClick={onMarkErrorAtCurrentTime}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#121212]/90 hover:bg-black border border-white/25 backdrop-blur-md text-white font-semibold px-4 py-1.5 text-xs shadow-md transition-all cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>+ Đánh dấu lỗi tại {formatSeconds(currentTime)}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Khung Thông Tin Dự Án (Contra White Card) ── */}
      <section className="bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              {episode.projectTitle} — Tập {episode.episodeNumber < 10 ? `0${episode.episodeNumber}` : episode.episodeNumber}: {episode.episodeTitle}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Kiểm tra bản dựng Master 4K và đối chiếu khai báo tuân thủ Điều 44 Luật AI trước khi chuyển Admin duyệt phát hành.
            </p>
          </div>
        </div>

        {/* Pill Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-white/[0.06] text-[#0F172A] dark:text-slate-200 border border-slate-200/80 dark:border-white/10">
            <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Studio: <strong>{episode.studioName}</strong></span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-white/[0.06] text-[#0F172A] dark:text-slate-200 border border-slate-200/80 dark:border-white/10">
            <Cpu className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Công nghệ: <strong>{episode.aiTechStack.slice(0, 2).join(' + ')}</strong></span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{tickets.length} Góp ý cần sửa</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-white/[0.06] text-[#64748B] dark:text-slate-300 border border-slate-200/80 dark:border-white/10">
            <User className="w-3.5 h-3.5" />
            <span>Reviewer: {episode.reviewerName}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-white/[0.06] text-[#64748B] dark:text-slate-300 border border-slate-200/80 dark:border-white/10">
            <Layers className="w-3.5 h-3.5" />
            <span>{episode.version}</span>
          </span>

          <button
            type="button"
            onClick={() => setActiveReportTab('ai_prompts')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors cursor-pointer ${
              isComplianceActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isComplianceActive ? 'Đã cấp phép Điều 44' : 'Chờ đối soát Điều 44'}</span>
          </button>
        </div>
      </section>

      {/* ── 4. Khu Vực Đối Chiếu Kịch Bản & AI Log ── */}
      <section className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveReportTab('script')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeReportTab === 'script'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-xs'
                : 'bg-slate-100 dark:bg-white/[0.05] text-[#64748B] dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Đối Chiếu Kịch Bản ({episode.scriptExcerpt.length} màn)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveReportTab('ai_prompts')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeReportTab === 'ai_prompts'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-xs'
                : 'bg-slate-100 dark:bg-white/[0.05] text-[#64748B] dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Khai Báo Model & Prompt AI ({episode.aiDisclosureLogs.length} nguồn)</span>
          </button>
        </div>

        {activeReportTab === 'script' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {episode.scriptExcerpt.map((item, idx) => (
                <button
                  key={item.act}
                  type="button"
                  onClick={() => setSelectedSceneIndex(idx)}
                  className={`text-left p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                    selectedSceneIndex === idx
                      ? 'bg-[#F9FAFB] dark:bg-white/[0.08] border-[#121212] dark:border-white text-[#0F172A] dark:text-white shadow-xs'
                      : 'bg-white dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06] text-[#64748B] dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-[#0F172A] dark:text-white">{item.act}</p>
                  <p className="truncate mt-0.5 font-medium">{item.scene}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-[#F9FAFB] dark:bg-black/40 border border-slate-200/70 dark:border-white/[0.06] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-[#64748B] dark:text-slate-400">
                <span className="font-bold text-[#0F172A] dark:text-white uppercase tracking-wider text-[11px]">
                  {episode.scriptExcerpt[selectedSceneIndex].scene}
                </span>
                <span className="text-[11px] font-mono">
                  {episode.scriptExcerpt[selectedSceneIndex].act}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {episode.scriptExcerpt[selectedSceneIndex].description}
              </p>
              <div className="pt-2 border-t border-slate-200/70 dark:border-white/[0.06] text-[#0F172A] dark:text-slate-200 font-mono">
                {episode.scriptExcerpt[selectedSceneIndex].dialogue}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {episode.aiDisclosureLogs.map((log) => (
              <div
                key={log.tool}
                className="rounded-2xl bg-[#F9FAFB] dark:bg-black/40 border border-slate-200/70 dark:border-white/[0.06] p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A] dark:text-white">{log.tool}</span>
                    <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-400">({log.model})</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{log.purpose}</p>
                  <p className="text-[#64748B] text-[11px]">{log.notes}</p>
                </div>

                <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 text-[11px] font-semibold inline-flex items-center gap-1 self-start sm:self-center">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Đã Kiểm Định</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
