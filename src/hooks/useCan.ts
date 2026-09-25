import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { PermissionKey } from '@/lib/permissions';

/**
 * `can(permission)` for the signed-in account. The backend enforces the same
 * permissions; this only hides what the account could not do anyway.
 */
export function useCan(): (permission: PermissionKey) => boolean {
  const permissions = useAppStore((state) => state.user?.permissions);
  return useCallback((permission) => permissions?.includes(permission) ?? false, [permissions]);
}
