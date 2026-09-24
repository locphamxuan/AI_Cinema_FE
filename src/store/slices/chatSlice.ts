import type { StateCreator } from 'zustand';
import { ChatMessage, ChatPhase, SupportTicket } from '@/types/chat';
import type { AppState, ChatSlice } from './types';

const defaultSupportReply = 'Xin chào! Tôi đang chờ dữ liệu từ backend để trả lời chính xác cho bạn.';

export const createChatSlice: StateCreator<AppState, [], [], ChatSlice> = (set, get) => ({
  chatMessages: [],
  chatPhase: 'bot' as ChatPhase,
  chatIsOpen: false,
  chatTicket: null,
  estimatedWaitMinutes: 5,

  toggleChat: () => set((s) => ({ chatIsOpen: !s.chatIsOpen })),

  sendMessage: (content) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({ chatMessages: [...s.chatMessages, userMsg] }));

    // Simulate bot response after delay
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        content: `Đã nhận yêu cầu của bạn. ${defaultSupportReply}`,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({ chatMessages: [...s.chatMessages, botMsg] }));
    }, 1500);
  },

  handleQuickAction: (actionId) => {
    const actionLabels: Record<string, string> = {
      'coin-error': 'Tôi gặp lỗi trừ Coin',
      'cancel-renew': 'Tôi muốn hủy gia hạn tự động',
      'report': 'Tôi muốn báo cáo vi phạm',
    };

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: actionLabels[actionId] || actionId,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({ chatMessages: [...s.chatMessages, userMsg] }));

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        content: `${actionLabels[actionId] || 'Yêu cầu của bạn'} đã được ghi nhận. ${defaultSupportReply}`,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({ chatMessages: [...s.chatMessages, botMsg] }));
    }, 1500);
  },

  escalateToAgent: () => {
    const state = get();
    const ticket: SupportTicket = {
      id: `TK-${Date.now()}`,
      summary: state.chatMessages
        .filter((m) => m.sender === 'user')
        .map((m) => m.content)
        .join(' | '),
      userMessages: state.chatMessages.filter((m) => m.sender === 'user').map((m) => m.content),
      createdAt: new Date().toISOString(),
    };

    const systemMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'system',
      content: `📋 Đã tạo phiếu hỗ trợ #${ticket.id}. Đang chuyển tiếp đến Chuyên viên hỗ trợ...`,
      timestamp: new Date().toISOString(),
    };

    set({
      chatPhase: 'waiting',
      chatTicket: ticket,
      chatMessages: [...state.chatMessages, systemMsg],
      estimatedWaitMinutes: Math.floor(Math.random() * 5) + 3,
    });
  },
});
