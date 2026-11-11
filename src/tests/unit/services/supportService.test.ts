import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/apiClient';
import { supportService } from '@/services/supportService';

describe('FE supportService (Chatbox AI)', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await supportService.resetLocalConversation();
  });

  it('calls backend MemberSupportController routes when available', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      statusCode: 201,
      data: { id: 'fe-conv-1', status: 'AI_HANDLING', createdAt: '2026-11-11T00:00:00Z' },
    });

    const started = await supportService.startOrGetOpen();
    expect(postSpy).toHaveBeenCalledWith(API_ROUTES.SUPPORT.CONVERSATIONS, {});
    expect(started.success).toBe(true);
    expect(started.data.id).toBe('fe-conv-1');

    postSpy.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      data: {
        conversation: { id: 'fe-conv-1', status: 'AI_HANDLING', createdAt: '2026-11-11T00:00:00Z' },
        memberMessage: { id: 'm1', senderType: 'MEMBER', content: 'Hỏi Điều 44', createdAt: '2026-11-11T00:01:00Z' },
        aiMessage: { id: 'a1', senderType: 'AI', content: 'Cần gắn nhãn AI trước khi phát hành.', createdAt: '2026-11-11T00:01:01Z' },
      },
    });

    const sent = await supportService.sendMessage('fe-conv-1', ' Hỏi Điều 44 ', 'cid-1');
    expect(postSpy).toHaveBeenLastCalledWith(API_ROUTES.SUPPORT.MESSAGES('fe-conv-1'), {
      content: 'Hỏi Điều 44',
      clientMessageId: 'cid-1',
    });
    expect(sent.data.aiMessage?.content).toContain('gắn nhãn AI');
  });

  it('closes old conversation and starts fresh on startFresh', async () => {
    const postSpy = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: { id: 'old-1', status: 'CLOSED', createdAt: '2026-11-10T00:00:00Z' },
      })
      .mockResolvedValueOnce({
        success: true,
        statusCode: 201,
        data: { id: 'new-1', status: 'AI_HANDLING', createdAt: '2026-11-11T00:00:00Z' },
      });

    const fresh = await supportService.startFresh('old-1');
    expect(postSpy).toHaveBeenNthCalledWith(1, API_ROUTES.SUPPORT.CLOSE('old-1'), {
      note: 'Người dùng tạo cuộc hội thoại mới',
    });
    expect(postSpy).toHaveBeenNthCalledWith(2, API_ROUTES.SUPPORT.CONVERSATIONS, {});
    expect(fresh.data.id).toBe('new-1');
  });

  it('falls back cleanly to local AI assistant when BE returns 404 or 403', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: false,
      statusCode: 403,
      data: null as never,
      message: 'Forbidden',
    });

    const started = await supportService.startOrGetOpen();
    expect(started.success).toBe(true);
    expect(started.data.id).toBe('local-fe-ai-support');

    const reply = await supportService.sendMessage('local-fe-ai-support', 'Quy trình duyệt Điều 44 và phát hành OTT');
    expect(reply.success).toBe(true);
    expect(reply.data.aiMessage?.content).toContain('Điều 44');
  });
});
