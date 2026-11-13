import { apiClient, type ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  SupportConversation,
  SupportConversationDetail,
  SupportMessage,
  SupportQuickReply,
  SupportSendResult,
} from '@/types/support';

const S = API_ROUTES.SUPPORT;

export const DEFAULT_QUICK_REPLIES: SupportQuickReply[] = [
  { label: 'Nạp Coin VNPay', message: 'Làm sao để nạp Coin qua VNPay?' },
  { label: 'Mua Gói Tháng', message: 'Quyền lợi và cách đăng ký Gói Tháng?' },
  { label: 'Quy trình xuất bản', message: 'Quy trình duyệt Điều 44 và phát hành phim lên OTT?' },
  { label: 'Gặp nhân viên', message: 'Tôi muốn gặp nhân viên hỗ trợ trực tiếp.' },
];

const WELCOME_CONTENT =
  'Xin chào! Tôi là Trợ lý AI của AI Cinema. Tôi có thể hỗ trợ bạn về nạp Coin, Gói Tháng, đăng ký 18+ hoặc quy trình sản xuất & phát hành phim.';

function makeWelcomeMessage(): SupportMessage {
  return {
    id: `fe-welcome-${Date.now()}`,
    senderType: 'AI',
    content: WELCOME_CONTENT,
    createdAt: new Date().toISOString(),
  };
}

let localConv: SupportConversation = {
  id: 'local-fe-ai-support',
  status: 'AI_HANDLING',
  createdAt: new Date().toISOString(),
};
let localMessages: SupportMessage[] = [makeWelcomeMessage()];

export function localAiReply(content: string): string {
  const q = content.toLowerCase();
  if (q.includes('coin') || q.includes('nạp') || q.includes('vnpay')) {
    return 'Bạn có thể nạp Coin qua cổng VNPay tại ứng dụng AI Cinema (Hồ sơ → Ví Coin → Nạp Coin). Sau khi thanh toán thành công, số dư Coin được cộng ngay lập tức.';
  }
  if (q.includes('gói') || q.includes('tháng') || q.includes('vip')) {
    return 'Gói Tháng giúp thành viên xem toàn bộ tập phim đã phát hành trong chu kỳ hiệu lực. Admin có thể cấu hình gói & giá Coin tại mục Quản trị → Gói thành viên.';
  }
  if (q.includes('điều 44') || q.includes('xuất bản') || q.includes('phát hành') || q.includes('ott')) {
    return 'Quy trình phát hành OTT (MF-1): Kịch bản duyệt cuối → Studio nộp video & hợp đồng ký số → Reviewer thẩm định & gắn nhãn AI Điều 44 → Admin nhấn Phát hành lên OTT.';
  }
  if (q.includes('18+') || q.includes('tuổi') || q.includes('đăng ký')) {
    return 'Theo quy định BR-54, người dùng đăng ký tài khoản xem phim cần nhập ngày sinh hợp lệ từ đủ 18 tuổi trở lên và xác nhận đồng ý điều khoản sử dụng.';
  }
  if (q.includes('thiết bị') || q.includes('máy') || q.includes('giới hạn')) {
    return 'Bạn có thể kiểm tra và gỡ bớt thiết bị đăng nhập tại Hồ sơ → Thiết bị của tôi để tiếp tục xem phim trên thiết bị mới.';
  }
  if (q.includes('nhân viên') || q.includes('staff') || q.includes('người')) {
    return 'Bạn có thể bấm nút "Gặp nhân viên" ở góc trên khung chat để chuyển yêu cầu này sang đội ngũ CSKH của AI Cinema.';
  }
  return 'Tôi đã ghi nhận câu hỏi của bạn. Bạn có thể hỏi về nạp Coin VNPay, Gói Tháng, quy định 18+, quy trình Điều 44 / phát hành OTT hoặc bấm "Hội thoại mới" bất cứ lúc nào.';
}

function isFallbackStatus(statusCode?: number): boolean {
  return (
    statusCode === undefined ||
    statusCode === 404 ||
    statusCode === 401 ||
    statusCode === 403 ||
    statusCode === 408 ||
    statusCode === 504 ||
    statusCode === 502
  );
}

export const supportService = {
  async startOrGetOpen(): Promise<ApiResponse<SupportConversation>> {
    const res = await apiClient.post<SupportConversation>(S.CONVERSATIONS, {}, { timeoutMs: 30_000 });
    if (res.success && res.data) return res;
    if (isFallbackStatus(res.statusCode)) {
      return { success: true, data: localConv, statusCode: 200 };
    }
    return res;
  },

  async getDetail(id: string): Promise<ApiResponse<SupportConversationDetail>> {
    if (id === localConv.id) {
      return {
        success: true,
        data: { conversation: localConv, messages: [...localMessages], quickReplies: DEFAULT_QUICK_REPLIES },
        statusCode: 200,
      };
    }
    const res = await apiClient.get<SupportConversationDetail | SupportConversation>(S.CONVERSATION(id), { timeoutMs: 30_000 });
    if (res.success && res.data) {
      const payload = res.data as SupportConversationDetail;
      if (payload.conversation) return { ...res, data: payload };
      return {
        ...res,
        data: {
          conversation: res.data as SupportConversation,
          messages: ((res.data as { messages?: SupportMessage[] }).messages) ?? [],
          quickReplies: DEFAULT_QUICK_REPLIES,
        },
      };
    }
    if (isFallbackStatus(res.statusCode)) {
      return {
        success: true,
        data: { conversation: localConv, messages: [...localMessages], quickReplies: DEFAULT_QUICK_REPLIES },
        statusCode: 200,
      };
    }
    return res as ApiResponse<SupportConversationDetail>;
  },

  async sendMessage(id: string, content: string, clientMessageId?: string): Promise<ApiResponse<SupportSendResult>> {
    const body = { content: content.trim(), ...(clientMessageId ? { clientMessageId } : {}) };
    if (id !== localConv.id) {
      const res = await apiClient.post<SupportSendResult>(S.MESSAGES(id), body, { timeoutMs: 60_000 });
      if (res.success && res.data) return res;
      if (!isFallbackStatus(res.statusCode)) return res;
    }

    const memberMessage: SupportMessage = {
      id: `fe-m-${Date.now()}`,
      senderType: 'MEMBER',
      content: body.content,
      createdAt: new Date().toISOString(),
    };
    const aiMessage: SupportMessage | null =
      localConv.status === 'AI_HANDLING'
        ? {
            id: `fe-ai-${Date.now() + 1}`,
            senderType: 'AI',
            content: localAiReply(body.content),
            createdAt: new Date().toISOString(),
          }
        : null;
    localMessages = [...localMessages, memberMessage, ...(aiMessage ? [aiMessage] : [])];
    return {
      success: true,
      statusCode: 200,
      data: {
        conversation: localConv,
        memberMessage,
        aiMessage,
        systemMessage: null,
        quickReplies: DEFAULT_QUICK_REPLIES,
      },
    };
  },

  async requestStaff(id: string, note?: string): Promise<ApiResponse<SupportConversation>> {
    if (id !== localConv.id) {
      const res = await apiClient.post<SupportConversation>(S.REQUEST_STAFF(id), note ? { note } : {});
      if (res.success || !isFallbackStatus(res.statusCode)) return res;
    }
    localConv = { ...localConv, status: 'WAITING_FOR_STAFF' };
    localMessages = [
      ...localMessages,
      {
        id: `fe-sys-${Date.now()}`,
        senderType: 'SYSTEM',
        content: 'Yêu cầu của bạn đã được chuyển sang nhân viên CSKH. Bạn có thể bấm "Hội thoại mới" để chat tiếp với AI.',
        createdAt: new Date().toISOString(),
      },
    ];
    return { success: true, data: localConv, statusCode: 200 };
  },

  async confirmResolved(id: string, rating?: number, comment?: string): Promise<ApiResponse<SupportConversation>> {
    if (id !== localConv.id) {
      const res = await apiClient.post<SupportConversation>(S.CONFIRM_RESOLVED(id), {
        ...(rating ? { rating } : {}),
        ...(comment ? { comment } : {}),
      });
      if (res.success || !isFallbackStatus(res.statusCode)) return res;
    }
    localConv = { ...localConv, status: 'RESOLVED' };
    localMessages = [
      ...localMessages,
      {
        id: `fe-sys-${Date.now()}`,
        senderType: 'SYSTEM',
        content: 'Cảm ơn bạn đã xác nhận vấn đề đã được giải quyết.',
        createdAt: new Date().toISOString(),
      },
    ];
    return { success: true, data: localConv, statusCode: 200 };
  },

  async close(id: string, note?: string): Promise<ApiResponse<SupportConversation>> {
    if (id !== localConv.id) {
      const res = await apiClient.post<SupportConversation>(S.CLOSE(id), note ? { note } : {});
      if (res.success || !isFallbackStatus(res.statusCode)) return res;
    }
    localConv = { ...localConv, status: 'CLOSED' };
    return { success: true, data: localConv, statusCode: 200 };
  },

  async startFresh(currentId?: string): Promise<ApiResponse<SupportConversation>> {
    if (currentId && currentId !== localConv.id) {
      try {
        await apiClient.post<SupportConversation>(S.CLOSE(currentId), { note: 'Người dùng tạo cuộc hội thoại mới' });
      } catch {
        // Ignore if already closed.
      }
    }
    await this.resetLocalConversation();
    return this.startOrGetOpen();
  },

  async resetLocalConversation(): Promise<void> {
    localConv = {
      id: 'local-fe-ai-support',
      status: 'AI_HANDLING',
      createdAt: new Date().toISOString(),
    };
    localMessages = [makeWelcomeMessage()];
  },
};
