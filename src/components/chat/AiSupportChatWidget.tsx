'use client';

import { useEffect, useMemo, useState } from 'react';
import { Headphones, PlusCircle, X } from 'lucide-react';
import { useAiSupportChat } from '@/hooks/useAiSupportChat';
import type { SupportStatus } from '@/types/support';
import { AiChatBody } from './AiChatBody';
import { AiOrb } from './AiOrb';

const STATUS_LABELS: Record<SupportStatus, string> = {
  AI_HANDLING: 'AI sẵn sàng hỗ trợ',
  WAITING_FOR_STAFF: 'Đang chờ nhân viên CSKH',
  STAFF_HANDLING: 'Nhân viên đang hỗ trợ',
  RESOLVED: 'Đã hoàn tất',
  CLOSED: 'Đã đóng hội thoại',
};

const FAB_SIZE = 58;
const PANEL_WIDTH = 410;
const PANEL_HEIGHT = 590;
const MARGIN = 16;

function clamp(val: number, min: number, max: number): number {
  if (max <= min) return min;
  return Math.min(Math.max(val, min), max);
}

/**
 * Draggable AI Smart Assistant widget for AI Cinema Web (FE).
 * Both the floating launcher orb and the opened chat window can be dragged up, down, left, or right.
 */
export function AiSupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const chat = useAiSupportChat(isOpen);

  const [viewport, setViewport] = useState({ width: 1280, height: 800 });
  const [fabDragged, setFabDragged] = useState<{ x: number; y: number } | null>(null);
  const [fabDragStart, setFabDragStart] = useState<{ px: number; py: number; sx: number; sy: number } | null>(null);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const [panelDragStart, setPanelDragStart] = useState<{ px: number; py: number; sx: number; sy: number } | null>(null);

  useEffect(() => {
    const syncViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const fabBounds = useMemo(
    () => ({
      minX: MARGIN,
      maxX: Math.max(MARGIN, viewport.width - FAB_SIZE - MARGIN),
      minY: MARGIN,
      maxY: Math.max(MARGIN, viewport.height - FAB_SIZE - MARGIN),
    }),
    [viewport.width, viewport.height],
  );

  const fabRaw = fabDragged ?? { x: fabBounds.maxX - 4, y: fabBounds.maxY - 4 };
  const fabPos = {
    x: clamp(fabRaw.x, fabBounds.minX, fabBounds.maxX),
    y: clamp(fabRaw.y, fabBounds.minY, fabBounds.maxY),
  };

  const conv = chat.conversation;
  const statusText = conv ? STATUS_LABELS[conv.status] : 'Đang kết nối trợ lý AI...';
  const canEscalate = !conv || conv.status === 'AI_HANDLING';
  const isWaitingStaff = conv?.status === 'WAITING_FOR_STAFF' || conv?.status === 'STAFF_HANDLING';
  const isClosed = conv?.status === 'RESOLVED' || conv?.status === 'CLOSED';
  const showHero = chat.messages.length <= 1 && !chat.loading && !isClosed;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          aria-label="Mở Trợ lý AI (kéo để di chuyển)"
          title="Trợ lý AI — Giữ & kéo để di chuyển"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setFabDragStart({ px: e.clientX, py: e.clientY, sx: fabPos.x, sy: fabPos.y });
          }}
          onPointerMove={(e) => {
            if (!fabDragStart) return;
            setFabDragged({
              x: clamp(fabDragStart.sx + e.clientX - fabDragStart.px, fabBounds.minX, fabBounds.maxX),
              y: clamp(fabDragStart.sy + e.clientY - fabDragStart.py, fabBounds.minY, fabBounds.maxY),
            });
          }}
          onPointerUp={(e) => {
            if (fabDragStart) {
              const dist = Math.hypot(e.clientX - fabDragStart.px, e.clientY - fabDragStart.py);
              setFabDragStart(null);
              if (dist < 6) setIsOpen(true);
            } else {
              setIsOpen(true);
            }
          }}
          onPointerCancel={() => setFabDragStart(null)}
          style={{ left: fabPos.x, top: fabPos.y, width: FAB_SIZE, height: FAB_SIZE }}
          className="fixed z-50 flex cursor-grab active:cursor-grabbing select-none items-center justify-center rounded-full border border-pink-400/50 bg-white/95 shadow-lg shadow-pink-500/25 backdrop-blur-md transition-shadow hover:shadow-xl dark:bg-[#141724]/95 touch-none"
        >
          <AiOrb size="sm" />
          <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-[#121212] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white dark:border-[#141724] dark:bg-pink-600">
            AI
          </span>
        </button>
      )}

      {isOpen && (
        <section
          aria-label="Chatbox Trợ lý AI"
          style={{
            width: Math.min(PANEL_WIDTH, viewport.width - MARGIN * 2),
            height: Math.min(PANEL_HEIGHT, viewport.height - MARGIN * 2),
            right: MARGIN,
            bottom: MARGIN,
            transform: `translate3d(${panelOffset.x}px, ${panelOffset.y}px, 0)`,
          }}
          className="fixed z-50 flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-[#111420] dark:text-slate-100"
        >
          <header
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              e.currentTarget.setPointerCapture?.(e.pointerId);
              setPanelDragStart({ px: e.clientX, py: e.clientY, sx: panelOffset.x, sy: panelOffset.y });
            }}
            onPointerMove={(e) => {
              if (!panelDragStart) return;
              const maxLeft = Math.max(0, viewport.width - PANEL_WIDTH - MARGIN * 2);
              const maxUp = Math.max(0, viewport.height - PANEL_HEIGHT - MARGIN * 2);
              setPanelOffset({
                x: clamp(panelDragStart.sx + e.clientX - panelDragStart.px, -maxLeft, MARGIN),
                y: clamp(panelDragStart.sy + e.clientY - panelDragStart.py, -maxUp, MARGIN),
              });
            }}
            onPointerUp={() => setPanelDragStart(null)}
            onPointerCancel={() => setPanelDragStart(null)}
            className="flex cursor-grab active:cursor-grabbing select-none items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3 dark:border-white/10 touch-none"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <AiOrb size="sm" />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">Trợ lý AI</h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
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
                onClick={() => void chat.startNewConversation()}
                disabled={chat.loading || chat.sending}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Hội thoại mới
              </button>

              {canEscalate && chat.isAuthenticated && (
                <button
                  type="button"
                  onClick={() => void chat.requestStaff()}
                  disabled={chat.loading || chat.sending}
                  title="Gặp nhân viên CSKH"
                  aria-label="Gặp nhân viên CSKH"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"
                >
                  <Headphones className="h-3.5 w-3.5" />
                </button>
              )}

              {!isClosed && conv && chat.isAuthenticated && (
                <button
                  type="button"
                  onClick={() => void chat.confirmResolved()}
                  disabled={chat.loading || chat.sending}
                  className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/15 dark:text-rose-300"
                >
                  Đã xong
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng Trợ lý AI"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {isWaitingStaff && (
            <div className="mx-3 mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <span>CSKH đang tiếp nhận — AI tạm dừng. Bấm để chat AI mới ngay.</span>
              <button
                type="button"
                onClick={() => void chat.startNewConversation()}
                className="shrink-0 rounded-full bg-[#121212] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-black"
              >
                Chat AI mới
              </button>
            </div>
          )}

          <AiChatBody
            loading={chat.loading}
            sending={chat.sending}
            isClosed={isClosed}
            showHero={showHero}
            messages={chat.messages}
            quickReplies={chat.quickReplies}
            draft={chat.draft}
            errorMsg={chat.errorMsg}
            messagesEndRef={chat.messagesEndRef}
            onDraftChange={chat.setDraft}
            onSend={(text) => void chat.sendText(text)}
            onStartNew={() => void chat.startNewConversation()}
          />
        </section>
      )}
    </>
  );
}
