'use client';

import { useAppStore } from '@/store/useAppStore';
import { quickActions } from '@/mocks/mockData';
import { useState, useRef, useEffect, useCallback } from 'react';

export default function SupportChatWidget() {
  const {
    chatMessages,
    chatPhase,
    chatIsOpen,
    chatTicket,
    estimatedWaitMinutes,
    toggleChat,
    sendMessage,
    handleQuickAction,
    escalateToAgent,
  } = useAppStore();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop state for floating button
  const [bottomOffset, setBottomOffset] = useState(24); // px from bottom
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number>(0);
  const startBottomRef = useRef<number>(24);
  const hasMovedRef = useRef<boolean>(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate typing indicator when bot responds
  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg?.sender === 'user') {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag handlers for mouse and touch
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartYRef.current = e.clientY;
    startBottomRef.current = bottomOffset;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;

    const deltaY = dragStartYRef.current - e.clientY; // drag up increases bottom offset
    if (Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }

    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const maxBottom = windowHeight - 90; // clamp near top of screen
    const minBottom = 20; // clamp near bottom of screen

    const newBottom = Math.max(minBottom, Math.min(maxBottom, startBottomRef.current + deltaY));
    setBottomOffset(newBottom);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Only toggle chat if it was a tap/click, not a drag
    if (!hasMovedRef.current) {
      toggleChat();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {chatIsOpen && (
        <div
          style={{ bottom: `${Math.min(bottomOffset + 68, typeof window !== 'undefined' ? window.innerHeight - 540 : 540)}px` }}
          className="fixed right-4 sm:right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] glass-card flex flex-col z-50 animate-slide-up shadow-2xl shadow-black/80 border border-white/20"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon to-neon-dark flex items-center justify-center text-lg shadow-md">
                  {chatPhase === 'waiting' ? '⏳' : chatPhase === 'agent' ? '👨‍💼' : '🤖'}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#161922] ${
                    chatPhase === 'waiting' ? 'bg-warning' : 'bg-verified'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {chatPhase === 'waiting'
                    ? 'Hàng đợi hỗ trợ'
                    : chatPhase === 'agent'
                      ? 'Chuyên viên hỗ trợ'
                      : 'Trợ lý AI Cinema'}
                </p>
                <p className="text-[10px] text-muted-light">
                  {chatPhase === 'waiting'
                    ? `Thời gian chờ ước tính: ~${estimatedWaitMinutes} phút`
                    : chatPhase === 'bot'
                      ? 'Trực tuyến 24/7'
                      : 'Đang kết nối...'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-muted-light hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-neon text-white rounded-br-md shadow-md shadow-neon/20'
                      : msg.sender === 'system'
                        ? 'bg-white/10 text-muted-light text-xs text-center mx-auto rounded-xl w-full border border-white/10'
                        : 'glass-card-sm text-foreground rounded-bl-md border border-white/10'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.sender !== 'system' && (
                    <p className="text-[9px] text-white/50 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass-card-sm px-4 py-3 rounded-2xl rounded-bl-md border border-white/10">
                  <div className="typing-indicator flex items-center">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (bot phase only) */}
          {chatPhase === 'bot' && (
            <div className="px-4 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {quickActions.map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => handleQuickAction(qa.id)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-muted-light hover:text-foreground whitespace-nowrap transition-colors shrink-0"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* Escalate CTA (bot phase, after some messages) */}
          {chatPhase === 'bot' && chatMessages.length >= 3 && (
            <div className="px-4 py-2 bg-neon/10 border-t border-neon/20 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-muted-light">Chưa giải quyết được?</span>
              <button
                onClick={escalateToAgent}
                className="text-xs font-bold text-neon hover:text-neon-dark transition-colors flex items-center gap-1"
              >
                <span>Chuyển tiếp Chuyên viên</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* Input Area */}
          {chatPhase !== 'waiting' && (
            <div className="p-3 border-t border-white/10 shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:ring-1 focus:ring-neon/50 transition-all border border-white/5"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-xl bg-neon text-white flex items-center justify-center hover:bg-neon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md shadow-neon/30"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Draggable Button */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          bottom: `${bottomOffset}px`,
          touchAction: 'none',
        }}
        className={`fixed right-4 sm:right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-transform z-50 select-none ${
          isDragging
            ? 'cursor-grabbing scale-110 ring-4 ring-neon/50 shadow-neon/50'
            : 'cursor-grab hover:scale-105 active:scale-95'
        } ${
          chatIsOpen
            ? 'bg-white/20 rotate-180 border border-white/20'
            : 'bg-gradient-to-br from-neon to-neon-dark glow-neon border border-white/20'
        }`}
        title="Bấm để mở chat • Giữ và kéo lên/xuống để đổi vị trí"
      >
        {chatIsOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
