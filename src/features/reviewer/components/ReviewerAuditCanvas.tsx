'use client';

import { useState } from 'react';
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Play,
  Pause,
  PlusCircle,
  Building2,
  MessageSquare,
  Cpu,
  Sparkles,
  User,
  Clock,
  Layers,
  FileText,
  CheckCircle2,
  MoreHorizontal,
  Volume2,
  VolumeX,
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
    <div className="flex-1 min-w-0 bg-[#F8FAFC] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto transition-colors duration-200">
      {/* ── 1. Thanh Công Cụ Đầu Canvas (Toolbar) ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
        {/* Navigation & Autosave */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent flex items-center justify-center transition-colors shadow-xs"
            title="Thu phóng toàn màn hình"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg p-0.5 shadow-xs">
            <button
              type="button"
              className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Tập trước: Tập 01"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium text-slate-700 dark:text-slate-300">Tập 02 / 08</span>
            <button
              type="button"
              className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Tập sau: Tập 03"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tự động lưu bản kiểm duyệt lúc 14:20</span>
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Nút hành động nhanh: [ ⚖️ Gắn Nhãn AI Điều 44 ] */}
          <button
            type="button"
            onClick={onToggleAiCompliance}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
              isComplianceActive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/10'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${isComplianceActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
            <span>{isComplianceActive ? '✅ Đã Cấp Nhãn Tuân Thủ AI (Điều 44)' : '⚖️ Gắn Nhãn AI Điều 44'}</span>
          </button>

          <button
            type="button"
            className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent flex items-center justify-center transition-colors shadow-xs"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 2. Khung Media Player (Video Master 16:9 - Giữ phong cách dark cinematic chuẩn) ── */}
      <section aria-label="Trình thẩm định Video Master" className="space-y-2">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0D1017] border border-slate-300 dark:border-white/[0.1] shadow-2xl group">
          {/* Visual Poster / Frame */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={episode.videoUrl}
            alt={episode.episodeTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Vignette Overlay & Cinema Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 pointer-events-none" />

          {/* Center Play Indicator */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-white fill-white" />
            ) : (
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            )}
          </button>

          {/* Top Info Bar on Player */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs z-10 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#E50914] text-white font-black tracking-wider uppercase text-[10px] shadow-sm">
                MASTER 4K UHD
              </span>
              <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-slate-200 font-mono">
                FPS: 24.00 • ProRes 422 HQ
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-slate-300 font-medium">
              Studio: <span className="text-white font-bold">{episode.studioName}</span>
            </div>
          </div>

          {/* Bottom Player Controls & Timestamp Scrubber */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-10 space-y-3">
            {/* Scrubber Progress Bar with Bug Markers */}
            <div className="relative w-full h-2 rounded-full bg-white/20 cursor-pointer group/bar">
              {/* Played track */}
              <div
                className="absolute top-0 left-0 bottom-0 rounded-full bg-[#E50914] transition-all"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Scrubber thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#E50914] shadow-md group-hover/bar:scale-125 transition-transform"
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
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="text-white hover:text-[#E50914] transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="font-mono text-slate-200">
                  <span className="text-white font-bold">{formatSeconds(currentTime)}</span> / {episode.durationText}
                </span>
              </div>

              {/* Prominent Mark Error Button: [ + Đánh dấu lỗi tại thời điểm này ] */}
              <button
                type="button"
                onClick={onMarkErrorAtCurrentTime}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white font-bold text-xs shadow-lg hover:shadow-[0_0_15px_rgba(229,9,20,0.5)] transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Đánh dấu lỗi tại {formatSeconds(currentTime)}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Thanh Thao Tác Ngắn (Dưới video - Refero Links Style) ── */}
      <section className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] pb-4">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-[#E50914]" />
          <span>Studio: <strong className="text-slate-900 dark:text-white">{episode.studioName}</strong></span>
        </div>

        <span className="text-slate-300 dark:text-slate-600">•</span>

        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <MessageSquare className="w-3.5 h-3.5" />
          <span><strong>{tickets.length} Góp ý cần sửa</strong></span>
        </div>

        <span className="text-slate-300 dark:text-slate-600">•</span>

        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Công nghệ: <strong className="text-slate-900 dark:text-white">{episode.aiTechStack.join(' • ')}</strong></span>
        </div>

        <span className="text-slate-300 dark:text-slate-600">•</span>

        <button
          type="button"
          onClick={() => setActiveReportTab('ai_prompts')}
          className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold cursor-pointer transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tóm tắt vi phạm AI ({episode.promptsCount} prompts)</span>
        </button>
      </section>

      {/* ── 4. Tiêu Đề & Tag Thông Tin (Refero Headline Style) ── */}
      <section className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {episode.projectTitle} - Tập {episode.episodeNumber < 10 ? `0${episode.episodeNumber}` : episode.episodeNumber}: {episode.episodeTitle}
        </h1>

        {/* Dãy Pill Tags nhỏ bo tròn */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pill 1: Thẩm định viên */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>Thẩm định viên: <strong className="text-slate-900 dark:text-white">{episode.reviewerName}</strong></span>
          </div>

          {/* Pill 2: Bản dựng */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <Layers className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span>Bản dựng: <strong className="text-slate-900 dark:text-white">{episode.version}</strong></span>
          </div>

          {/* Pill 3: Trạng thái */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
            <Clock className="w-3 h-3" />
            <span>Trạng thái: Đang kiểm duyệt</span>
          </div>

          {/* Pill 4: Giấy phép AI */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              isComplianceActive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{isComplianceActive ? 'Giấy phép AI: Đã cấp phép Điều 44' : 'Giấy phép AI: Chờ đối soát'}</span>
          </div>
        </div>
      </section>

      {/* ── 5. Khu Vực Báo Cáo Kỹ Thuật (Script / AI Log Preview) ── */}
      <section className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-5 space-y-4 shadow-sm transition-colors">
        {/* Sub-tabs for technical comparison */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-3">
          <button
            type="button"
            onClick={() => setActiveReportTab('script')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeReportTab === 'script'
                ? 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Đối Chiếu Kịch Bản Phân Cảnh ({episode.scriptExcerpt.length} màn)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveReportTab('ai_prompts')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeReportTab === 'ai_prompts'
                ? 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Khai Báo Model & Nhật Ký Prompt AI ({episode.aiDisclosureLogs.length} nguồn)</span>
          </button>
        </div>

        {/* Tab 1: Script Screenplay Comparison */}
        {activeReportTab === 'script' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              * Đối chiếu từng câu thoại và miêu tả hành động trong kịch bản Final Draft từ In-house Creator với diễn biến trên video Master của Studio.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {episode.scriptExcerpt.map((item, idx) => (
                <button
                  key={item.act}
                  type="button"
                  onClick={() => setSelectedSceneIndex(idx)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedSceneIndex === idx
                      ? 'bg-slate-100 dark:bg-white/[0.08] border-[#E50914] text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <p className="font-bold text-[#E50914]">{item.act}</p>
                  <p className="truncate mt-0.5 font-medium">{item.scene}</p>
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  {episode.scriptExcerpt[selectedSceneIndex].scene}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {episode.scriptExcerpt[selectedSceneIndex].act}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {episode.scriptExcerpt[selectedSceneIndex].description}
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] text-amber-700 dark:text-amber-300 font-mono">
                {episode.scriptExcerpt[selectedSceneIndex].dialogue}
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: AI Model Provenance & Prompts Disclosure */
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              * Hồ sơ khai báo dữ liệu AI theo Điều 44 Luật Trí tuệ Nhân tạo. Reviewer đối soát nguồn gốc model và quyền sử dụng thương mại.
            </p>

            <div className="space-y-2.5">
              {episode.aiDisclosureLogs.map((log) => (
                <div
                  key={log.tool}
                  className="rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{log.tool}</span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">({log.model})</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{log.purpose}</p>
                    <p className="text-slate-500 text-[11px]">{log.notes}</p>
                  </div>

                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1 self-start sm:self-center">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Đã Kiểm Định</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
