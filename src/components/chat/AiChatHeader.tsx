'use client';

import type { PointerEvent } from 'react';
import { Headphones, Moon, PlusCircle, Sun, X } from 'lucide-react';
import type { SupportStatus } from '@/types/support';
import { AiOrb } from './AiOrb';

const STATUS_LABELS: Record<SupportStatus, string> = {
  AI_HANDLING: 'AI sẵn sàng',
  WAITING_FOR_STAFF: 'Chờ CSKH',
  STAFF_HANDLING: 'CSKH đang hỗ trợ',
  RESOLVED: 'Đã hoàn tất',
  CLOSED: 'Đã đóng',
};

interface AiChatHeaderProps {
  dark: boolean;
  status?: SupportStatus;
  canEscalate: boolean;
  isAuthenticated: boolean;
  isClosed: boolean;
  hasConversation: boolean;
  busy: boolean;
  onToggleTheme: () => void;
  onStartNew: () => void;
  onRequestStaff: () => void;
  onConfirmResolved: () => void;
  onClose: () => void;
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
}

/** Draggable chatbox header with status pill, Black/White theme switcher, and session actions. */
export function AiChatHeader({
  dark,
  status,
  canEscalate,
  isAuthenticated,
  isClosed,
  hasConversation,
  busy,
  onToggleTheme,
  onStartNew,
  onRequestStaff,
  onConfirmResolved,
  onClose,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: AiChatHeaderProps) {
  const statusText = status ? STATUS_LABELS[status] : 'Đang kết nối...';
  const isWaitingStaff = status === 'WAITING_FOR_STAFF' || status === 'STAFF_HANDLING';

  return (
    <header
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`flex cursor-grab active:cursor-grabbing select-none items-center justify-between gap-2 border-b px-4 py-3 touch-none ${
        dark ? 'border-white/10' : 'border-slate-200/80'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <AiOrb size="sm" />
        <div className="min-w-0">
          <h2 className={`truncate text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
            Trợ lý AI
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium ${
              dark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                isWaitingStaff ? 'bg-amber-500' : isClosed ? 'bg-slate-400' : 'bg-emerald-500'
              }`}
            />
            {statusText}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleTheme}
          title={dark ? 'Chuyển nền trắng' : 'Chuyển nền đen'}
          aria-label={dark ? 'Chuyển khung chat sang màu trắng' : 'Chuyển khung chat sang màu đen'}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${
            dark
              ? 'border-white/15 bg-white/[0.08] text-amber-300 hover:bg-white/15'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={onStartNew}
          disabled={busy}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
            dark
              ? 'border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/10'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Hội thoại mới
        </button>

        {canEscalate && isAuthenticated && (
          <button
            type="button"
            onClick={onRequestStaff}
            disabled={busy}
            title="Gặp nhân viên CSKH"
            aria-label="Gặp nhân viên CSKH"
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition disabled:opacity-50 ${
              dark
                ? 'border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/10'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
          </button>
        )}

        {!isClosed && hasConversation && isAuthenticated && (
          <button
            type="button"
            onClick={onConfirmResolved}
            disabled={busy}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
              dark
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            }`}
          >
            Đã xong
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng Trợ lý AI"
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
            dark
              ? 'text-slate-400 hover:bg-white/10 hover:text-white'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
