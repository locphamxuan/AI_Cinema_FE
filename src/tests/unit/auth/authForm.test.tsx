import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '@/components/auth/AuthForm';
import { useAppStore } from '@/store/useAppStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('AuthForm sign-up', () => {
  const register = vi.fn();

  beforeEach(() => {
    register.mockReset().mockResolvedValue({ success: true });
    localStorage.clear();
    useAppStore.setState({ register });
  });

  it('asks for every field of the account and sends them to the backend', async () => {
    render(<AuthForm initialMode="register" />);

    await userEvent.type(screen.getByLabelText('Họ và tên'), 'Nguyễn Minh Anh');
    await userEvent.type(screen.getByLabelText(/Ngày sinh/), '2000-05-14');
    await userEvent.type(screen.getByLabelText('Email'), 'anh@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'matkhau123');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu'), 'matkhau123');
    await userEvent.click(screen.getByRole('button', { name: 'Tạo Tài Khoản' }));

    expect(register).toHaveBeenCalledWith('Nguyễn Minh Anh', 'anh@example.com', 'matkhau123', '2000-05-14');
  });

  it('stops when the two passwords differ', async () => {
    render(<AuthForm initialMode="register" />);

    await userEvent.type(screen.getByLabelText('Họ và tên'), 'Nguyễn Minh Anh');
    await userEvent.type(screen.getByLabelText(/Ngày sinh/), '2000-05-14');
    await userEvent.type(screen.getByLabelText('Email'), 'anh@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'matkhau123');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu'), 'matkhau124');
    await userEvent.click(screen.getByRole('button', { name: 'Tạo Tài Khoản' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Mật khẩu nhập lại không khớp.');
    expect(register).not.toHaveBeenCalled();
  });
});
