'use client';

import { useState } from 'react';
import {
  MessageSquare,
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
      className="w-full lg:w-96 xl:w-[26rem] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#0D1017] flex flex-col justify-between h-auto lg:h-[calc(100vh-3.5rem)] text-[#0F172A] dark:text-slate-200 transition-colors duration-200 font-sans"
    >
      {/* ── 1. Header Tabs Dạng Pill (Contra Pill Navigation) ── */}
      <div className="shrink-0 border-b border-slate-200/70 dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#0D1017] p-3.5 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-xs'
                : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#0F172A]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback Lỗi ({tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_declare')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ai_declare'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-xs'
                : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#0F172A]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Khai Báo AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-xs'
                : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#0F172A]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử</span>
          </button>
        </div>

        {/* Filter Status Bar */}
        {activeTab === 'feedback' && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#64748B] dark:text-slate-400 font-medium">Lọc sự cố:</span>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Lọc trạng thái lỗi"
                className="appearance-none rounded-full bg-slate-50 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-[#0F172A] dark:text-slate-200 font-medium pl-3 pr-7 py-1 text-xs focus:outline-none cursor-pointer border border-slate-200 dark:border-white/10"
              >
                <option value="all">Toàn bộ lỗi ({tickets.length})</option>
                <option value="pending">Chờ Studio phản hồi</option>
                <option value="in_progress">Studio đang khắc phục</option>
                <option value="resolved">Đã giải quyết xong</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Danh Sách Lỗi (Ticket Items - Contra Minimalist Cards) ── */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#F9FAFB]/60 dark:bg-transparent">
        {activeTab === 'feedback' ? (
          filteredTickets.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">Chưa có góp ý lỗi nào</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-xs mx-auto">
                Tập phim chưa có lỗi nào cần sửa hoặc đã giải quyết xong toàn bộ.
              </p>
            </div>
          ) : (
            filteredTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 mb-3 hover:border-slate-400 dark:hover:border-white/25 transition-all shadow-xs space-y-2.5"
              >
                {/* Header: Timestamp Pill + Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onTimeJump(tkt.timestampSeconds)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-mono font-semibold transition-colors cursor-pointer"
                    title="Bấm để tua video tới mốc thời gian này"
                  >
                    <Clock className="w-3 h-3 text-[#64748B] dark:text-slate-300" />
                    <span>{tkt.timestampText}</span>
                  </button>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium border ${
                      tkt.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                        : tkt.status === 'PENDING_STUDIO'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                    }`}
                  >
                    {tkt.statusLabel}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    {tkt.severity === 'CRITICAL' && (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span>{tkt.title}</span>
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
                    {tkt.description}
                  </p>
                </div>

                {/* Studio Response */}
                {tkt.studioResponse && (
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/10 p-2.5 text-xs text-slate-700 dark:text-slate-200 space-y-0.5">
                    <span className="font-semibold text-[#0F172A] dark:text-white">
                      Phản hồi từ {episode.studioName}:
                    </span>
                    <p className="text-[#64748B] dark:text-slate-300">{tkt.studioResponse}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-white/[0.05]">
                  <span>Người gắn: {tkt.author.name}</span>
                  <span>{tkt.createdAt}</span>
                </div>
              </div>
            ))
          )
        ) : activeTab === 'ai_declare' ? (
          <div className="space-y-3 text-xs">
            <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-4 space-y-2.5 shadow-xs">
              <h4 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tiêu Chuẩn Tuân Thủ AI (Điều 44)</span>
              </h4>
              <p className="text-[#64748B] dark:text-slate-300 leading-relaxed">
                Tác phẩm do AI tham gia tạo lập bắt buộc phải gắn nhãn hiển thị nhận biết và lưu trữ nhật ký prompt đầy đủ nhằm bảo đảm minh bạch dữ liệu.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[#64748B]">Trạng thái hồ sơ:</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium border ${
                    isComplianceActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isComplianceActive ? 'ĐÃ ĐẠT TIÊU CHUẨN' : 'CHỜ THẨM ĐỊNH'}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-4 space-y-2.5 shadow-xs">
              <h5 className="font-bold text-[#0F172A] dark:text-white">Công Nghệ Studio Sử Dụng:</h5>
              <ul className="space-y-1.5 text-xs text-[#64748B] dark:text-slate-300">
                {episode.aiTechStack.map((tech) => (
                  <li key={tech} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-white" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B]">
                <span className="font-semibold text-[#0F172A] dark:text-white">Bản Dựng Version 2 Tải Lên</span>
                <span>Hôm nay 10:15</span>
              </div>
              <p className="text-[#64748B] dark:text-slate-300">
                Studio Saigon VFX Lab đã bàn giao bản Master Render 4K.
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[#64748B]">
                <span className="font-semibold text-[#0F172A] dark:text-white">Reviewer Bắt Đầu Kiểm Duyệt</span>
                <span>Hôm nay 11:30</span>
              </div>
              <p className="text-[#64748B] dark:text-slate-300">
                Trần Gia Huy đã nhận phân công thẩm định tập 02.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Khung Tạo Ticket Lỗi & Footer Phê Duyệt (Contra Bottom Dock) ── */}
      <div className="shrink-0 p-4 border-t border-slate-200/70 dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#0D1017] space-y-3">
        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212]'
                  : 'bg-slate-100 dark:bg-white/[0.06] text-[#64748B] dark:text-slate-300 hover:bg-slate-200/70'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Box nhập liệu Contra */}
        <form onSubmit={handleSendTicket} className="space-y-2.5">
          <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-2xl p-3 focus-within:bg-white dark:focus-within:bg-[#111420] focus-within:border-slate-400 transition-all">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 dark:border-white/[0.06] text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white font-mono font-semibold">
                <Clock className="w-3 h-3" />
                <span>Mốc: {formatSeconds(currentTime)}</span>
              </span>
              <span className="text-[#64748B] truncate max-w-[140px]">{selectedTag}</span>
            </div>

            <textarea
              rows={2}
              value={newFeedbackText}
              onChange={(e) => setNewFeedbackText(e.target.value)}
              placeholder="Nhập yêu cầu Studio chỉnh sửa tại mốc này..."
              className="w-full bg-transparent text-xs text-[#0F172A] dark:text-white placeholder-slate-400 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-[#121212] rounded-full py-2.5 px-5 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi Ticket Cho Studio</span>
          </button>
        </form>

        {/* ── 4. Footer Phê Duyệt Cuối Bảng (Contra Pill Actions) ── */}
        <div className="pt-3 border-t border-slate-200/70 dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={onRejectToStudio}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white dark:bg-transparent border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-full px-4 py-2.5 text-xs font-medium transition-all cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Từ Chối & Yêu Cầu Sửa</span>
          </button>

          <button
            type="button"
            onClick={onApproveForPublish}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#121212] dark:bg-white text-white dark:text-[#121212] hover:bg-black dark:hover:bg-slate-100 rounded-full px-4 py-2.5 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Phê Duyệt & Chuyển Admin</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
