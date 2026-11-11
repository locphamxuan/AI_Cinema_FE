import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AiSupportChatWidget } from '@/components/chat/AiSupportChatWidget';
import { apiClient } from '@/services/apiClient';
import { supportService } from '@/services/supportService';
import { useAppStore } from '@/store/useAppStore';

describe('AiSupportChatWidget (Web FE)', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    useAppStore.setState({ isAuthenticated: false, user: null });
    await supportService.resetLocalConversation();
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: false,
      statusCode: 404,
      data: null as never,
      message: 'Not found',
    });
  });

  it('opens the draggable AI chatbox, sends a question, and resets with Hội thoại mới', async () => {
    render(<AiSupportChatWidget />);

    const launcher = screen.getByRole('button', { name: /Mở Trợ lý AI/i });
    expect(launcher).toBeInTheDocument();

    fireEvent.pointerUp(launcher);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Chatbox Trợ lý AI' })).toBeInTheDocument();
    });
    expect(screen.getByText('Tôi có thể giúp gì cho bạn?')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Hỏi Trợ lý AI bất kỳ điều gì...');
    fireEvent.change(input, { target: { value: 'Làm sao để nạp Coin qua VNPay?' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/nạp Coin qua cổng VNPay/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Hội thoại mới/i }));

    await waitFor(() => {
      expect(screen.getByText('Tôi có thể giúp gì cho bạn?')).toBeInTheDocument();
    });
  });
});
