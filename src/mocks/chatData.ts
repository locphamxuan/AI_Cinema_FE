import { ChatMessage } from '@/types/chat';

// ====== INITIAL CHAT MESSAGES ======
export const mockInitialMessages: ChatMessage[] = [
  {
    id: 'msg-0',
    sender: 'bot',
    content: 'Xin chào! 👋 Tôi là trợ lý ảo AI Cinema. Tôi có thể giúp bạn giải đáp các thắc mắc về tài khoản, gói dịch vụ, hoặc vấn đề kỹ thuật. Bạn cần hỗ trợ gì?',
    timestamp: new Date().toISOString(),
  },
];

// Quick action chips for chatbot
export const quickActions = [
  { id: 'coin-error', label: '💰 Lỗi trừ Coin' },
  { id: 'cancel-renew', label: '🔄 Cách hủy gia hạn' },
  { id: 'report', label: '🚨 Báo cáo vi phạm' },
];

// Bot auto-responses for quick actions
export const botResponses: Record<string, string> = {
  'coin-error': 'Tôi hiểu bạn gặp vấn đề về trừ Coin. Bạn có thể cho tôi biết mã giao dịch cụ thể không? Thông thường, nếu giao dịch bị lỗi, hệ thống sẽ tự động hoàn Coin trong vòng 24h. Bạn có thể kiểm tra tại mục Lịch sử giao dịch.',
  'cancel-renew': 'Để hủy gia hạn tự động, bạn vào Hồ sơ → Quản lý gói thành viên → Tắt toggle "Tự động gia hạn". Lưu ý: Sau khi tắt, gói của bạn vẫn hoạt động đến ngày hết hạn.',
  'report': 'Cảm ơn bạn đã báo cáo. Vui lòng mô tả chi tiết nội dung vi phạm bạn phát hiện, bao gồm: tên phim, số tập, và thời điểm xuất hiện nội dung vi phạm. Tôi sẽ chuyển thông tin đến đội ngũ kiểm duyệt.',
  'default': 'Cảm ơn bạn đã liên hệ. Tôi đang phân tích câu hỏi của bạn. Nếu tôi không thể giải quyết, bạn có thể chuyển tiếp đến Chuyên viên hỗ trợ.',
};
