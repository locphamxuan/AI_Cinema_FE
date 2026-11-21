import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginUrlFor, safeNext } from '@/lib/safeNext';
import { authService } from '@/services/authService';
import { refusalOf } from '@/store/slices/authSlice';
import { useAppStore } from '@/store/useAppStore';
import type { UserProfile } from '@/types/auth';

const profile = (role: UserProfile['role']) => ({ id: 'u1', name: 'Người dùng', email: 'u@x.vn', role }) as UserProfile;

beforeEach(() => useAppStore.setState({ isAuthenticated: false, user: null }));
afterEach(() => vi.restoreAllMocks());

describe('refusalOf', () => {
  it('lets internal roles in and sends members and studios to their own apps', () => {
    expect(refusalOf('admin')).toBeNull();
    expect(refusalOf('user')).toContain('ứng dụng di động');
    expect(refusalOf('vip')).toContain('ứng dụng di động');
    expect(refusalOf('studio')).toContain('Studio Web');
  });
});

describe('restoreSession', () => {
  it('does nothing without a stored session or a stored user', () => {
    const me = vi.spyOn(authService, 'me');
    vi.spyOn(authService, 'hasSession').mockReturnValue(false);
    useAppStore.getState().restoreSession();
    vi.spyOn(authService, 'hasSession').mockReturnValue(true);
    vi.spyOn(authService, 'getStoredUser').mockReturnValue(null);
    useAppStore.getState().restoreSession();
    expect(me).not.toHaveBeenCalled();
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('ends a stored studio session at once: studios work on Studio Web', () => {
    vi.spyOn(authService, 'hasSession').mockReturnValue(true);
    vi.spyOn(authService, 'getStoredUser').mockReturnValue(profile('studio'));
    const logout = vi.spyOn(authService, 'logout');
    useAppStore.getState().restoreSession();
    expect(logout).toHaveBeenCalled();
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('restores an internal session and follows a role the Admin changed since', async () => {
    vi.spyOn(authService, 'hasSession').mockReturnValue(true);
    vi.spyOn(authService, 'getStoredUser').mockReturnValue(profile('reviewer'));
    const me = vi.spyOn(authService, 'me').mockResolvedValue({ success: true, data: profile('admin') } as never);
    useAppStore.getState().restoreSession();
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    await vi.waitFor(() => expect(useAppStore.getState().user?.role).toBe('admin'));

    me.mockResolvedValue({ success: true, data: profile('studio') } as never);
    const logout = vi.spyOn(authService, 'logout');
    useAppStore.getState().restoreSession();
    await vi.waitFor(() => expect(useAppStore.getState().isAuthenticated).toBe(false));
    expect(logout).toHaveBeenCalled();

    me.mockResolvedValue({ success: false, data: null } as never);
    useAppStore.getState().restoreSession();
    await vi.waitFor(() => expect(useAppStore.getState().user?.role).toBe('reviewer'));
  });
});

describe('login', () => {
  it('refuses a studio account on the back office and ends its session', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({ success: true, data: profile('studio') } as never);
    const logout = vi.spyOn(authService, 'logout');
    const res = await useAppStore.getState().login('studio@aicinema.com', 'pw');
    expect(res).toEqual({ success: false, error: refusalOf('studio') });
    expect(logout).toHaveBeenCalled();
  });

  it('opens the session of an internal account on its own area, and logout ends it', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({ success: true, data: profile('reviewer') } as never);
    const res = await useAppStore.getState().login('rev@aicinema.vn', 'pw');
    expect(res).toEqual({ success: true, redirectUrl: '/reviewer' });
    expect(useAppStore.getState().user?.role).toBe('reviewer');
    vi.spyOn(authService, 'login').mockResolvedValue({ success: true, data: { ...profile('admin'), role: undefined } } as never);
    // A profile without a role is sent to the default area rather than refused.
    expect((await useAppStore.getState().login('x@aicinema.vn', 'pw')).success).toBe(true);
    const logout = vi.spyOn(authService, 'logout');
    useAppStore.getState().logout();
    expect(logout).toHaveBeenCalled();
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('translates a wrong password and keeps any other message', async () => {
    const login = vi.spyOn(authService, 'login');
    login.mockResolvedValue({ success: false, message: 'Incorrect email or password', data: null } as never);
    expect((await useAppStore.getState().login('a@x.vn', 'pw')).error).toBe('Email hoặc mật khẩu không chính xác.');
    login.mockResolvedValue({ success: false, message: 'Tài khoản bị khoá', data: null } as never);
    expect((await useAppStore.getState().login('a@x.vn', 'pw')).error).toBe('Tài khoản bị khoá');
    login.mockResolvedValue({ success: false, data: null } as never);
    expect((await useAppStore.getState().login('a@x.vn', 'pw')).error).toBe('Email hoặc mật khẩu không chính xác.');
  });
});

describe('safeNext', () => {
  it('keeps a path of this site only and builds the login link back to a page', () => {
    expect(safeNext('/admin/projects?tab=1')).toBe('/admin/projects?tab=1');
    expect(safeNext(null)).toBeNull();
    expect(safeNext('https://evil.example')).toBeNull();
    expect(safeNext('//evil.example')).toBeNull();
    expect(safeNext('/\\evil.example')).toBeNull();
    expect(loginUrlFor('/admin?x=1')).toBe('/login?next=%2Fadmin%3Fx%3D1');
  });
});
