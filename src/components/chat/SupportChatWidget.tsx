'use client';

import { useAppStore } from '@/store/useAppStore';
import { quickActions } from '@/mocks/mockData';
import { useState, useRef, useEffect } from 'react';

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

  return (
    <>
      {/* Chat Window */}
      {chatIsOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] glass-card flex flex-col z-50 animate-slide-up shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon to-neon-dark flex items-center justify-center text-lg">
                  {chatPhase === 'waiting' ? '⏳' : chatPhase === 'agent' ? '👨💼' : '🤖'}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                  chatPhase === 'waiting' ? 'bg-warning' : 'bg-verified'
                }`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {chatPhase === 'waiting' ? 'Hàng đợi hỗ trợ'
                    : chatPhase === 'agent' ? 'Chuyên viên hỗ trợ'
                      : 'Trợ lý AI Cinema'}
                </p>
                <p className="text-[10px] text-muted-light">
                  {chatPhase === 'waiting'
                    ? `Thời gian chờ ước tính: ~${estimatedWaitMinutes} phút`
                    : chatPhase === 'bot' ? 'Trực tuyến' : 'Đang kết nối...'}
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
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-neon text-white rounded-br-md'
                    : msg.sender === 'system'
                      ? 'bg-warning/20 text-warning border border-warning/30 rounded-lg text-xs'
                      : 'bg-white/10 text-foreground rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && chatPhase === 'bot' && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            {/* Waiting Queue UI */}
            {chatPhase === 'waiting' && (
              <div className="p-4 rounded-xl bg-neon/10 border border-neon/20 text-center animate-bounce-in">
                <div className="text-4xl mb-3 animate-pulse">⏳</div>
                <p className="text-sm font-bold text-foreground">Đang trong hàng đợi</p>
                <p className="text-xs text-muted-light mt-1">
                  Thời gian chờ ước tính: <span className="text-neon font-bold">~{estimatedWaitMinutes} phút</span>
                </p>
                {chatTicket && (
                  <div className="mt-3 p-3 rounded-lg bg-white/5 text-left">
                    <p className="text-[10px] text-muted-light uppercase">Phiếu hỗ trợ #{chatTicket.id}</p>
                    <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{chatTicket.summary}</p>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (only in bot phase) */}
          {chatPhase === 'bot' && chatMessages.length <= 2 && (
            <div className="px-4 py-2 border-t border-white/5">
              <p className="text-[10px] text-muted-light mb-2">Thao tác nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-foreground hover:bg-neon/20 hover:text-neon transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Escalate Button (only in bot phase when there are enough messages) */}
          {chatPhase === 'bot' && chatMessages.length >= 3 && (
            <div className="px-4 py-2 border-t border-white/5">
              <button
                onClick={escalateToAgent}
                className="w-full py-2 rounded-xl bg-ruby/20 text-ruby text-xs font-medium hover:bg-ruby/30 transition-colors"
              >
                🔄 Chưa giải quyết được? Chuyển tiếp đến Chuyên viên hỗ trợ
              </button>
            </div>
          )}

          {/* Input Area */}
          {chatPhase !== 'waiting' && (
            <div className="p-3 border-t border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:ring-1 focus:ring-neon/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-xl bg-neon text-white flex items-center justify-center hover:bg-neon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 sm:right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all z-50 ${
          chatIsOpen
            ? 'bg-white/20 rotate-180 scale-90'
            : 'bg-gradient-to-br from-neon to-neon-dark glow-neon hover:scale-110 active:scale-95'
        }`}
      >
        {chatIsOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
