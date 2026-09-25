import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AreaGuard } from '@/components/auth/AreaGuard';
import { useAppStore } from '@/store/useAppStore';
import { canEnter, homeAreaOf } from '@/lib/permissions';
import { toUserProfile } from '@/services/authService';
import { signInAs } from '@/tests/support/signIn';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

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

  it('asks a visitor to sign in', () => {
    render(<AreaGuard area="staff">Vận hành</AreaGuard>);
    expect(screen.getByRole('heading', { name: 'Bạn cần đăng nhập' })).toBeInTheDocument();
  });
});
