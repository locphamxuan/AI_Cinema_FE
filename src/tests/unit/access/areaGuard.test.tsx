import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AreaGuard } from '@/components/auth/AreaGuard';
import { useAppStore } from '@/store/useAppStore';
import { canEnter, homeAreaOf, isMemberRole } from '@/lib/permissions';
import { toUserProfile } from '@/services/authService';
import { signInAs } from '@/tests/support/signIn';

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

describe('Areas of the web portal', () => {
  it.each([
    ['creator', ['creator'], 'creator'],
    ['reviewer', ['reviewer'], 'reviewer'],
    ['staff', ['staff'], 'staff'],
    ['admin', ['reviewer', 'staff', 'admin'], 'admin'],
    ['user', [], null],
  ] as const)('lets a %s into %j and lands them on %s', (role, allowed, home) => {
    for (const area of ['creator', 'reviewer', 'staff', 'admin'] as const) {
      expect(canEnter(area, role)).toBe((allowed as readonly string[]).includes(area));
    }
    expect(homeAreaOf(role)).toBe(home);
  });

  it('keeps the viewer site for members: every other role has an area of its own', () => {
    for (const role of ['user', 'vip'] as const) {
      expect(isMemberRole(role)).toBe(true);
      expect(homeAreaOf(role)).toBeNull();
    }
    for (const role of ['creator', 'reviewer', 'staff', 'admin'] as const) {
      expect(isMemberRole(role)).toBe(false);
      expect(homeAreaOf(role)).not.toBeNull();
    }
  });

  it('keeps STAFF apart from ADMIN and carries the permissions the backend sent', () => {
    const profile = toUserProfile({ id: 'u', email: 's@x.vn', fullName: 'S', role: 'STAFF', isActive: true, permissions: ['member:ops.read'] });
    expect(profile.role).toBe('staff');
    expect(profile.permissions).toEqual(['member:ops.read']);
  });
});

describe('AreaGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({ isAuthenticated: false, user: null });
  });

  it('renders the area for an allowed role', () => {
    signInAs('admin');
    render(<AreaGuard area="reviewer">Nội dung kiểm duyệt</AreaGuard>);
    expect(screen.getByText('Nội dung kiểm duyệt')).toBeInTheDocument();
  });

  it('turns a creator away from the admin area and offers their own', () => {
    signInAs('creator');
    render(<AreaGuard area="admin">Bí mật</AreaGuard>);
    expect(screen.queryByText('Bí mật')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bạn không có quyền vào trang này' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đến trang Sản xuất nội dung/ })).toBeInTheDocument();
  });

  it('sends a visitor straight to the sign-in screen', () => {
    render(<AreaGuard area="staff">Vận hành</AreaGuard>);
    expect(screen.queryByText('Vận hành')).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('signs a turned-away account out and opens the sign-in screen for another one', () => {
    signInAs('creator');
    render(<AreaGuard area="admin">Bí mật</AreaGuard>);
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập bằng tài khoản khác/ }));
    expect(router.push).toHaveBeenCalledWith('/login');
    expect(useAppStore.getState().user).toBeNull();
  });
});
