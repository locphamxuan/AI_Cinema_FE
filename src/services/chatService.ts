/**
 * AI Cinema - Customer Support & AI Chatbot Service
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ChatMessage, QuickReply } from '@/types/chat';

const QUICK_RESPONSES: Record<string, string> = {
  coin: 'Coin trong AI Cinema gồm: 🟡 Coin Chính (dùng mua tập phim, nâng cấp tài khoản) và 🎁 Coin Thưởng (nhận từ điểm danh hàng ngày).',
  vip: 'Gói VIP Cinema 4K cho phép xem không giới hạn tất cả các phim chất lượng 4K HDR10+ Dolby Atmos và tặng 200 Coin thưởng mỗi tháng.',
  luat: 'AI Cinema tuân thủ nghiêm ngặt Điều 44 Luật Trí tuệ Nhân tạo & Nghị định 142/2026/NĐ-CP, dán nhãn minh bạch 100% nội dung do AI tạo.',
  version: 'Mỗi tập phim trên AI Cinema có hệ thống quản lý phiên bản (Episode Version Control). Bạn có thể xem lịch sử nâng cấp model AI tại thanh thông tin tập phim.',
};

export const chatService = {
  async sendMessage(text: string): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post<ChatMessage>(
      API_ROUTES.CHAT.SEND_MESSAGE,
      { text },
      { useMockFallback: true },
      () => {
        const lower = text.toLowerCase();
        let reply = 'Cảm ơn bạn đã liên hệ AI Cinema! Tôi có thể hỗ trợ bạn về gói VIP, cách nhận Coin thưởng, hoặc các tính năng xem phim.';

        for (const [key, answer] of Object.entries(QUICK_RESPONSES)) {
          if (lower.includes(key)) {
            reply = answer;
            break;
          }
        }

        const botMsg: ChatMessage = {
          id: 'msg_bot_' + Date.now(),
          sender: 'bot',
          content: reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        return botMsg;
      }
    );
  },

  async escalateToHuman(): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post<ChatMessage>(
      API_ROUTES.CHAT.ESCALATE,
      {},
      { useMockFallback: true },
      () => ({
        id: 'msg_agent_' + Date.now(),
        sender: 'agent',
        content: 'Chuyên viên hỗ trợ trực tuyến (Hồng Nhung - Mã NV: #VN88) đã tham gia phiên hỗ trợ. Tôi có thể giúp gì cho bạn ngay bây giờ?',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      })
    );
  },

  getQuickReplies(): QuickReply[] {
    return [
      { id: 'q_coin', text: 'Cách nhận Coin thưởng?', payload: 'coin' },
      { id: 'q_vip', text: 'Quyền lợi gói VIP 4K', payload: 'vip' },
      { id: 'q_law', text: 'Tuân thủ Điều 44 Luật AI', payload: 'luat' },
      { id: 'q_agent', text: 'Gặp nhân viên hỗ trợ', payload: 'agent' },
    ];
  },
};
