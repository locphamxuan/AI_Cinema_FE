import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '@/components/auth/AuthForm';
import AuthBrand from '@/components/auth/AuthBrand';
import { useToastStore } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

describe('AuthForm sign-in', () => {
  const login = vi.fn();

  beforeEach(() => {
    push.mockReset();
    login.mockReset().mockResolvedValue({ success: true, redirectUrl: '/reviewer' });
    localStorage.clear();
    useToastStore.setState({ toasts: [] });
    useAppStore.setState({ login });
  });

  it('offers email and password only: no sign-up and no Google', () => {
    render(<AuthForm />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument();
    expect(screen.queryByText(/Đăng Ký|Tạo tài khoản/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Google/)).not.toBeInTheDocument();
  });

  it('goes to the area of the role after signing in', async () => {
    render(<AuthForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'reviewer@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'matkhau123');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng Nhập' }));

    expect(login).toHaveBeenCalledWith('reviewer@example.com', 'matkhau123');
    expect(push).toHaveBeenCalledWith('/reviewer');
  });

  it('shows why a sign-in was refused and stays on the form', async () => {
    login.mockResolvedValue({ success: false, error: 'Tài khoản thành viên chỉ dùng được trên ứng dụng di động AI Cinema.' });
    render(<AuthForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'member@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'matkhau123');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng Nhập' }));

    expect(screen.getByRole('alert')).toHaveTextContent('ứng dụng di động');
    expect(push).not.toHaveBeenCalled();
  });

  it('offers a direct Studio Web link when a studio account signs in', async () => {
    login.mockResolvedValue({
      success: false,
      error: 'Tài khoản Studio đăng nhập tại Studio Web dành cho đối tác, không dùng trang quản trị nội bộ.',
    });
    render(<AuthForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'studio@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'matkhau123');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng Nhập' }));

    expect(screen.getByRole('link', { name: /Mở cổng đăng nhập Studio Web/ })).toBeInTheDocument();
  });

  it('displays back-office internal branding instead of viewer platform copy', () => {
    render(<AuthBrand />);

    expect(screen.getByText('Cổng Quản Trị & Sản Xuất Nội Bộ')).toBeInTheDocument();
    expect(screen.queryByText(/Nền tảng xem phim/)).not.toBeInTheDocument();
  });
});
