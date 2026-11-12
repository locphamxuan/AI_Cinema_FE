import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AiSupportChatWidget } from '@/components/chat/AiSupportChatWidget';
import { apiClient } from '@/services/apiClient';
import { supportService } from '@/services/supportService';
import { useAppStore } from '@/store/useAppStore';

let mockPathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const memberUser = {
  id: 'u1',
  name: 'Huy',
  email: 'huy@mail.com',
  avatarUrl: '',
  role: 'user' as const,
  isVIP: false,
};

describe('AiSupportChatWidget (Web FE)', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    localStorage.clear();
    mockPathname = '/';
    useAppStore.setState({ isAuthenticated: true, user: memberUser });
    await supportService.resetLocalConversation();
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: false,
      statusCode: 404,
      data: null as never,
      message: 'Not found',
    });
  });

  it('hides the AI chatbox for creator, reviewer, admin, staff, and unauthenticated backoffice screens', () => {
    useAppStore.setState({ isAuthenticated: false, user: null });
    const { rerender } = render(<AiSupportChatWidget />);
    expect(screen.queryByRole('button', { name: /Mở Trợ lý AI/i })).not.toBeInTheDocument();

    for (const role of ['creator', 'reviewer', 'admin', 'staff'] as const) {
      useAppStore.setState({
        isAuthenticated: true,
        user: { ...memberUser, role },
      });
      rerender(<AiSupportChatWidget />);
      expect(screen.queryByRole('button', { name: /Mở Trợ lý AI/i })).not.toBeInTheDocument();
    }

    mockPathname = '/creator/projects';
    useAppStore.setState({ isAuthenticated: true, user: memberUser });
    rerender(<AiSupportChatWidget />);
    expect(screen.queryByRole('button', { name: /Mở Trợ lý AI/i })).not.toBeInTheDocument();
  });

  it('opens the draggable AI chatbox for user/member, toggles dark/light color, sends a question, and resets with Hội thoại mới', async () => {
    render(<AiSupportChatWidget />);

    const launcher = screen.getByRole('button', { name: /Mở Trợ lý AI/i });
    expect(launcher).toBeInTheDocument();

    fireEvent.pointerUp(launcher);

    const dialog = await screen.findByRole('region', { name: 'Chatbox Trợ lý AI' });
    expect(dialog).toHaveAttribute('data-chat-theme', 'light');
    expect(screen.getByText('Tôi có thể giúp gì cho bạn?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Chuyển khung chat sang màu đen/i }));
    expect(dialog).toHaveAttribute('data-chat-theme', 'dark');

    fireEvent.click(screen.getByRole('button', { name: /Chuyển khung chat sang màu trắng/i }));
    expect(dialog).toHaveAttribute('data-chat-theme', 'light');

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
