'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAiSupportChat } from '@/hooks/useAiSupportChat';
import { AiChatBody } from './AiChatBody';
import { AiChatHeader } from './AiChatHeader';
import { AiOrb } from './AiOrb';

const CHAT_THEME_KEY = 'ai_cinema_chatbox_theme';
const FAB_SIZE = 58;
const PANEL_WIDTH = 432;
const PANEL_HEIGHT = 600;
const MARGIN = 16;

function clamp(val: number, min: number, max: number): number {
  if (max <= min) return min;
  return Math.min(Math.max(val, min), max);
}

function readInitialChatDark(): boolean {
  try {
    const saved = localStorage.getItem(CHAT_THEME_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return document.documentElement.classList.contains('dark');
  } catch {
    return false;
  }
}

/**
 * Draggable AI Smart Assistant widget for AI Cinema Web (FE).
 * Supports dragging up/down/left/right and switching chatbox color between Black (dark) & White (light).
 */
export function AiSupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatDark, setChatDark] = useState<boolean>(readInitialChatDark);
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

  const toggleChatDark = () => {
    setChatDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CHAT_THEME_KEY, next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

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
          className={`fixed z-50 flex cursor-grab active:cursor-grabbing select-none items-center justify-center rounded-full border border-pink-400/50 shadow-lg shadow-pink-500/25 backdrop-blur-md transition-shadow hover:shadow-xl touch-none ${
            chatDark ? 'bg-[#141724]/95' : 'bg-white/95'
          }`}
        >
          <AiOrb size="sm" />
          <span
            className={`absolute -bottom-1 -right-1 rounded-full border-2 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white ${
              chatDark ? 'border-[#141724] bg-pink-600' : 'border-white bg-[#121212]'
            }`}
          >
            AI
          </span>
        </button>
      )}

      {isOpen && (
        <section
          aria-label="Chatbox Trợ lý AI"
          data-chat-theme={chatDark ? 'dark' : 'light'}
          style={{
            width: Math.min(PANEL_WIDTH, viewport.width - MARGIN * 2),
            height: Math.min(PANEL_HEIGHT, viewport.height - MARGIN * 2),
            right: MARGIN,
            bottom: MARGIN,
            transform: `translate3d(${panelOffset.x}px, ${panelOffset.y}px, 0)`,
          }}
          className={`fixed z-50 flex flex-col overflow-hidden rounded-3xl border shadow-2xl transition-colors duration-200 ${
            chatDark
              ? 'border-white/10 bg-[#111420] text-slate-100'
              : 'border-slate-200/90 bg-white text-slate-900'
          }`}
        >
          <AiChatHeader
            dark={chatDark}
            status={conv?.status}
            canEscalate={canEscalate}
            isAuthenticated={chat.isAuthenticated}
            isClosed={isClosed}
            hasConversation={Boolean(conv)}
            busy={chat.loading || chat.sending}
            onToggleTheme={toggleChatDark}
            onStartNew={() => void chat.startNewConversation()}
            onRequestStaff={() => void chat.requestStaff()}
            onConfirmResolved={() => void chat.confirmResolved()}
            onClose={() => setIsOpen(false)}
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
          />

          {isWaitingStaff && (
            <div
              className={`mx-3 mt-2.5 flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-xs ${
                chatDark
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
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
            dark={chatDark}
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
