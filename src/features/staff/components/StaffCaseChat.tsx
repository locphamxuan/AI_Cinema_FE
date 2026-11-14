'use client';

import { useState } from 'react';
import { Bot, Lock, Send, UserCheck, UserX, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAction } from '@/hooks/useAction';
import { formatDateTime } from '@/lib/format';
import { staffSupportService } from '@/services/staffSupportService';
import type { SupportConversationDetail, SupportMessage } from '@/types/support';

export function StaffCaseChat({
  detail,
  currentUserId,
  isAdmin,
  onRefresh,
}: {
  detail: SupportConversationDetail;
  currentUserId?: string;
  isAdmin?: boolean;
  onRefresh: () => Promise<void>;
}) {
  const { conversation: conv, messages } = detail;
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const { busy, run } = useAction();

  const isAiHandling = conv.status === 'AI_HANDLING';
  const isAssignedToMe = conv.assignedStaffId && conv.assignedStaffId === currentUserId;
  const canClaim = conv.status === 'WAITING_FOR_STAFF' || (!conv.assignedStaffId && conv.status === 'STAFF_HANDLING');
  const canRelease = isAssignedToMe || (isAdmin && !!conv.assignedStaffId);

  const getAiSuggestion = async () => {
    setLoadingSuggestion(true);
    const res = await staffSupportService.getAiSuggestion(conv.id);
    setLoadingSuggestion(false);
    if (res.success && res.data?.draft) {
      setContent(res.data.draft);
      setIsInternal(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const done = await run(
      () => staffSupportService.sendMessage(conv.id, content, isInternal),
      isInternal ? 'Đã lưu ghi chú nội bộ' : 'Đã gửi phản hồi cho khách hàng',
    );
    if (done) {
      setContent('');
      await onRefresh();
    }
  };

  const handleClaim = async () => {
    if (await run(() => staffSupportService.claim(conv.id), 'Đã nhận xử lý ca')) {
      await onRefresh();
    }
  };

  const handleRelease = async () => {
    if (await run(() => staffSupportService.release(conv.id), 'Đã trả ca về hàng đợi')) {
      await onRefresh();
    }
  };

  const handleResolve = async () => {
    if (await run(() => staffSupportService.resolve(conv.id), 'Đã đánh dấu giải quyết xong')) {
      await onRefresh();
    }
  };

  const handleClose = async () => {
    if (await run(() => staffSupportService.close(conv.id), 'Đã đóng ca hỗ trợ')) {
      await onRefresh();
    }
  };

  return (
    <div className="flex flex-col h-[650px] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] overflow-hidden shadow-xs text-xs">
      {/* ── Case Header ── */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.01]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Ca #{conv.id.slice(0, 8)}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">
              {conv.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Thành viên: <span className="font-medium text-slate-700 dark:text-slate-300">{conv.member?.fullName || conv.member?.email || 'Khách hàng'}</span>
            {conv.assignedStaff && ` · Nhân viên phụ trách: ${conv.assignedStaff.fullName}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {canClaim && (
            <Button size="sm" variant="secondary" disabled={busy} onClick={handleClaim} className="h-7 text-xs gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Nhận ca
            </Button>
          )}
          {canRelease && (
            <Button size="sm" variant="secondary" disabled={busy} onClick={handleRelease} className="h-7 text-xs gap-1">
              <UserX className="w-3.5 h-3.5 text-amber-600" /> Trả ca
            </Button>
          )}
          {conv.status !== 'RESOLVED' && conv.status !== 'CLOSED' && (
            <Button size="sm" variant="secondary" disabled={busy} onClick={handleResolve} className="h-7 text-xs gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Giải quyết
            </Button>
          )}
          {conv.status !== 'CLOSED' && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={handleClose} className="h-7 text-xs text-rose-600 gap-1">
              <XCircle className="w-3.5 h-3.5" /> Đóng
            </Button>
          )}
        </div>
      </div>

      {/* ── AI Summary banner ── */}
      {conv.aiSummary && (
        <div className="px-5 py-2.5 bg-amber-50/70 dark:bg-amber-500/10 border-b border-amber-100 dark:border-amber-500/20 flex items-start gap-2.5">
          <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-semibold text-amber-900 dark:text-amber-300 text-[11px]">Tóm tắt ca từ AI:</p>
            <p className="text-amber-800 dark:text-amber-200/90 leading-relaxed text-xs">{conv.aiSummary}</p>
          </div>
        </div>
      )}

      {/* ── Message Transcript ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* ── Reply Form or AI Handling Lock ── */}
      <div className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02]">
        {isAiHandling ? (
          <div className="py-4 text-center space-y-1">
            <p className="flex items-center justify-center gap-1.5 text-slate-500 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-500" /> Ca đang được AI Chatbot tự động hỗ trợ
            </p>
            <p className="text-[11px] text-slate-400">
              Nhân viên chỉ có thể trả lời khi ca được chuyển sang nhân viên (WAITING_FOR_STAFF / STAFF_HANDLING).
            </p>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-slate-300 dark:border-white/20 text-amber-600 focus:ring-amber-500"
                />
                <span className={`font-semibold ${isInternal ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                  Ghi chú nội bộ (Member không thấy)
                </span>
              </label>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy || loadingSuggestion}
                onClick={getAiSuggestion}
                className="h-6 text-[11px] gap-1 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10"
              >
                <Bot className="w-3 h-3" />
                {loadingSuggestion ? 'Đang lấy gợi ý…' : 'Gợi ý trả lời AI'}
              </Button>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isInternal ? 'Viết ghi chú nội bộ cho ca này…' : 'Nhập tin nhắn trả lời khách hàng…'}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs outline-none transition-colors ${
                  isInternal
                    ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-500/5'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1017]'
                }`}
              />
              <Button type="submit" disabled={busy || !content.trim()} className="self-end h-9 px-4">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message: m }: { message: SupportMessage }) {
  if (m.isInternal) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10 p-2.5 max-w-[85%] space-y-1">
        <div className="flex items-center justify-between gap-2 text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
          <span>Ghi chú nội bộ</span>
          <span>{formatDateTime(m.createdAt)}</span>
        </div>
        <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{m.content}</p>
      </div>
    );
  }

  const isStaff = m.senderType === 'STAFF';
  const isAi = m.senderType === 'AI';

  return (
    <div className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}>
      <div
        className={`rounded-2xl px-3.5 py-2 max-w-[80%] space-y-0.5 ${
          isStaff
            ? 'bg-sky-600 text-white rounded-br-xs'
            : isAi
              ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-sky-200/50 dark:border-sky-500/20'
              : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-100 rounded-bl-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
          <span>{isStaff ? 'Nhân viên CSKH' : isAi ? 'AI Chatbot' : 'Khách hàng'}</span>
          <span>{formatDateTime(m.createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
      </div>
    </div>
  );
}
