'use client';

import { useAppStore } from '@/store/useAppStore';
import { LoginCredentials, RegisterCredentials } from '@/types/auth';
import { useState } from 'react';

export function useAuth() {
  const { user, isAuthenticated, isVIPMode, login: storeLogin, register: storeRegister, logout: storeLogout, toggleVIPMode } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = storeLogin(credentials.email, credentials.password);
      if (res.success) {
        return true;
      } else {
        setError(res.error || 'Đăng nhập không thành công');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = storeRegister(credentials.name, credentials.email, credentials.password);
      if (res.success) {
        return true;
      } else {
        setError(res.error || 'Đăng ký không thành công');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
  };

  return {
    user,
    isAuthenticated,
    isVIPMode,
    loading,
    error,
    login,
    register,
    logout,
    toggleVIPMode,
  };
}
