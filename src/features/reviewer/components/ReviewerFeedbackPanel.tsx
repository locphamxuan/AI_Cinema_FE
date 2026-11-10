'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  History,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import type { AuditTicket, MasterEpisode } from '../types';

interface ReviewerFeedbackPanelProps {
  tickets: AuditTicket[];
  episode: MasterEpisode;
  currentTime: number;
  onTimeJump: (timeSec: number) => void;
  onAddTicket: (ticket: AuditTicket) => void;
  onRejectToStudio: () => void;
  onApproveForPublish: () => void;
  isComplianceActive: boolean;
}

export function ReviewerFeedbackPanel({
  tickets,
  episode,
  currentTime,
  onTimeJump,
  onAddTicket,
  onRejectToStudio,
  onApproveForPublish,
  isComplianceActive,
}: ReviewerFeedbackPanelProps) {
  const [activeTab, setActiveTab] = useState<'feedback' | 'ai_declare' | 'history'>('feedback');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Biến dạng AI (Artifact)');

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredTickets = tickets.filter((tkt) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return tkt.status === 'PENDING_STUDIO';
    if (filterStatus === 'in_progress') return tkt.status === 'IN_PROGRESS';
    if (filterStatus === 'resolved') return tkt.status === 'RESOLVED';
    return true;
  });

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) {
      toast.error('Thiếu nội dung', 'Vui lòng nhập mô tả yêu cầu chỉnh sửa cho Studio.');
      return;
    }

    const newTicket: AuditTicket = {
      id: `tkt-${Date.now()}`,
      timestampSeconds: currentTime,
      timestampText: formatSeconds(currentTime),
      category: selectedTag,
      title: `${selectedTag} tại ${formatSeconds(currentTime)}`,
      description: newFeedbackText.trim(),
      severity: selectedTag.includes('Bản quyền') ? 'CRITICAL' : 'WARNING',
      status: 'PENDING_STUDIO',
      statusLabel: 'Chờ Studio phản hồi',
      author: {
        name: episode.reviewerName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        role: 'Compliance Reviewer',
      },
      createdAt: 'Vừa xong',
    };

    onAddTicket(newTicket);
    setNewFeedbackText('');
    toast.success(
      'Đã ghi nhận Audit Ticket',
      `Mốc ${formatSeconds(currentTime)} đã được chuyển đến Studio ${episode.studioName}.`
    );
  };

  return (
    <aside
      aria-label="Bảng Thẩm Định & Góp Ý Lỗi"
      className="w-full lg:w-96 xl:w-104 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] flex flex-col justify-between h-auto lg:h-[calc(100vh-3.5rem)] text-slate-800 dark:text-slate-200 transition-colors duration-200"
    >
      {/* ── 1. Tabs Đầu Bảng (Refero Comments / Insights / Activity Style) ── */}
      <div className="shrink-0 border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0D1017]">
        <div className="flex items-center px-4 pt-3 gap-1">
          {/* Tab 1: Comments / Feedback */}
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'feedback'
                ? 'border-[#E50914] text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback Lỗi</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-[#E50914] text-[10px] font-mono">
              {tickets.length}
            </span>
          </button>

          {/* Tab 2: Khai báo AI / Insights */}
          <button
            type="button"
            onClick={() => setActiveTab('ai_declare')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ai_declare'
                ? 'border-[#E50914] text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Khai Báo AI</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
              {episode.promptsCount}
            </span>
          </button>

          {/* Tab 3: Lịch sử / Activity */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#E50914] text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử</span>
          </button>
        </div>

        {/* Dropdown Filter: Open threads ⌵ / Toàn bộ lỗi ⌵ */}
        {activeTab === 'feedback' && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-black/20 text-xs border-t border-slate-200 dark:border-white/[0.04]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Lọc danh sách sự cố:</span>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Lọc trạng thái lỗi"
                className="appearance-none bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-medium pl-2.5 pr-6 py-1 rounded-md text-[11px] focus:outline-none cursor-pointer border border-slate-200 dark:border-transparent shadow-xs"
              >
                <option value="all">Toàn bộ lỗi ({tickets.length})</option>
                <option value="pending">Chờ Studio phản hồi</option>
                <option value="in_progress">Studio đang khắc phục</option>
                <option value="resolved">Đã giải quyết xong</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Nội Dung Cuộn (Scrollable Thread List) ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'feedback' ? (
          filteredTickets.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Chưa có góp ý lỗi nào</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Tập phim chưa có lỗi nào cần sửa hoặc đã giải quyết xong toàn bộ.
              </p>
            </div>
          ) : (
            filteredTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="rounded-xl bg-slate-50 dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-3.5 space-y-2.5 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs"
              >
                {/* Header: Timestamp pill + Status badge */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onTimeJump(tkt.timestampSeconds)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#E50914]/15 hover:bg-[#E50914]/25 text-[#E50914] text-xs font-mono font-bold transition-colors cursor-pointer"
                    title="Bấm để tua video tới mốc thời gian này"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{tkt.timestampText}</span>
                  </button>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      tkt.status === 'PENDING_STUDIO'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                        : tkt.status === 'IN_PROGRESS'
                        ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {tkt.statusLabel}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {tkt.severity === 'CRITICAL' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span>{tkt.title}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{tkt.description}</p>
                </div>

                {/* Studio Response note if available */}
                {tkt.studioResponse && (
                  <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-2 text-[11px] text-sky-900 dark:text-sky-200 space-y-0.5">
                    <span className="font-bold text-sky-700 dark:text-sky-400">Phản hồi từ {episode.studioName}:</span>
                    <p>{tkt.studioResponse}</p>
                  </div>
                )}

                {/* Footer: Author & Time ago */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-white/[0.04]">
                  <span>Người gắn: {tkt.author.name}</span>
                  <span>{tkt.createdAt}</span>
                </div>
              </div>
            ))
          )
        ) : activeTab === 'ai_declare' ? (
          /* Tab Khai Báo AI Details */
          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-3 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tiêu Chuẩn Tuân Thủ AI (Điều 44 Luật AI)</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Tác phẩm do AI tham gia tạo lập bắt buộc phải gắn nhãn hiển thị nhận biết và lưu trữ nhật ký prompt
                đầy đủ nhằm bảo đảm quyền tác giả và minh bạch dữ liệu.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Trạng thái hồ sơ:</span>
                <span className={isComplianceActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                  {isComplianceActive ? 'ĐÃ ĐẠT TIÊU CHUẨN' : 'CHỜ THẨM ĐỊNH'}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-3 space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200">Danh Mục Công Nghệ Studio Sử Dụng:</h5>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                {episode.aiTechStack.map((tech) => (
                  <li key={tech} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          /* Tab Lịch Sử Activity */
          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">Bản Dựng Version 2 Tải Lên</span>
                <span>Hôm nay 10:15</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">Studio Saigon VFX Lab đã bàn giao bản Master Render 4K.</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#111420] border border-slate-200 dark:border-white/[0.08] p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">Reviewer Bắt Đầu Kiểm Duyệt</span>
                <span>Hôm nay 11:30</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">Trần Gia Huy đã nhận phân công thẩm định tập 02.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Khung Nhập Lỗi Gửi Thẳng Cho Studio (Comment Input Area) ── */}
      <div className="shrink-0 p-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#090B10] space-y-3 transition-colors">
        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium text-[10px]">Nhãn lỗi:</span>
          {[
            'Biến dạng AI (Artifact)',
            'Lệch khẩu hình (Lip-sync)',
            'Bản quyền logo/IP',
            'Nhiễu ánh sáng',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#E50914] text-white shadow-xs'
                  : 'bg-white dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Input Form with Current Timestamp attached */}
        <form onSubmit={handleSendTicket} className="space-y-2">
          <div className="relative rounded-xl border border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#111420] focus-within:border-[#E50914] transition-all overflow-hidden p-2.5 shadow-xs">
            {/* Timestamp Badge inside input */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-white/[0.06] text-[10px]">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E50914]/15 text-[#E50914] font-mono font-bold">
                <Clock className="w-2.5 h-2.5" />
                <span>Mốc hiện tại: {formatSeconds(currentTime)}</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">#{selectedTag}</span>
            </div>

            <textarea
              rows={2}
              value={newFeedbackText}
              onChange={(e) => setNewFeedbackText(e.target.value)}
              placeholder="Nhập nội dung yêu cầu Studio sửa đổi (gõ @ để tag Studio)..."
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">Gửi trực tiếp cho Studio {episode.studioName}</span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E50914] hover:bg-[#B81D24] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Gửi Ticket</span>
              </button>
            </div>
          </div>
        </form>

        {/* ── 4. Footer Phê Duyệt Cuối Bảng (Decision Buttons) ── */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] grid grid-cols-2 gap-2">
          {/* Nút 1: [ ❌ Từ Chối & Gửi Lại Studio ] */}
          <button
            type="button"
            onClick={onRejectToStudio}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Từ Chối & Gửi Lại</span>
          </button>

          {/* Nút 2: [ ✅ Phê Duyệt & Chuyển Admin Publish ] */}
          <button
            type="button"
            onClick={onApproveForPublish}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white text-xs font-bold shadow-lg hover:shadow-[0_0_15px_rgba(229,9,20,0.5)] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Phê Duyệt Publish</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
