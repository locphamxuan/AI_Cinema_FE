import { describe, it, expect, beforeEach } from 'vitest';
import { authService, mapBERoleToFE, mapBEUserToFEProfile } from '@/services/authService';
import { storage, STORAGE_KEYS } from '@/lib/storage';

describe('Auth Service (src/services/authService.ts)', () => {
  beforeEach(() => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_DATA);
  });

  describe('Role & Profile Mapping', () => {
    it('maps BE roles correctly to FE roles', () => {
      expect(mapBERoleToFE('CONTENT_CREATOR')).toBe('creator');
      expect(mapBERoleToFE('CONTENT_REVIEWER')).toBe('reviewer');
      expect(mapBERoleToFE('ADMIN')).toBe('admin');
      expect(mapBERoleToFE('STAFF')).toBe('admin');
      expect(mapBERoleToFE('MEMBER')).toBe('user');
      expect(mapBERoleToFE(undefined)).toBe('user');
    });

    it('transforms BE user response into FE UserProfile', () => {
      const beUser = {
        id: 'uuid-1234',
        email: 'creator@aicinema.vn',
        fullName: 'Đạo Diễn Test',
        role: 'CONTENT_CREATOR',
        isActive: true,
      };

      const profile = mapBEUserToFEProfile(beUser);
      expect(profile.id).toBe('uuid-1234');
      expect(profile.name).toBe('Đạo Diễn Test');
      expect(profile.email).toBe('creator@aicinema.vn');
      expect(profile.role).toBe('creator');
      expect(profile.isVIP).toBe(true);
      expect(profile.avatarUrl).toBeDefined();
    });
  });

  describe('Login & Demo Fallback', () => {
    it('supports demo login for creator@gmail.com with password 1', async () => {
      const res = await authService.login({
        email: 'creator@gmail.com',
        password: '1',
      });

      expect(res.success).toBe(true);
      expect(res.data.user.role).toBe('creator');
      expect(res.data.redirectUrl).toBe('/creator/projects');
      expect(storage.getString(STORAGE_KEYS.AUTH_TOKEN)).toBeDefined();
    });

    it('supports demo login for reviewer@gmail.com with password 1', async () => {
      const res = await authService.login({
        email: 'reviewer@gmail.com',
        password: '1',
      });

      expect(res.success).toBe(true);
      expect(res.data.user.role).toBe('reviewer');
      expect(res.data.redirectUrl).toBe('/reviewer');
    });

    it('fails on invalid password without demo fallback', async () => {
      const res = await authService.login({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(res.success).toBe(false);
      expect(res.message).toBeDefined();
    });
  });

  describe('Logout', () => {
    it('clears stored token and user data on logout', async () => {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, 'test_token');
      storage.set(STORAGE_KEYS.USER_DATA, { id: '1', name: 'Test' });

      const res = await authService.logout();
      expect(res.success).toBe(true);
      expect(storage.getString(STORAGE_KEYS.AUTH_TOKEN)).toBe('');
      expect(storage.get(STORAGE_KEYS.USER_DATA, null)).toBeNull();
    });
  });
});
