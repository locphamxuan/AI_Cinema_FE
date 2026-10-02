import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/Toast';
import type { ApiResponse } from '@/services/apiClient';

/**
 * Runs one write to the API: tracks `busy`, shows the backend's error as a toast,
 * and a success toast when `success` is given. Resolves to whether it worked.
 */
export function useAction() {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async <T,>(call: () => Promise<ApiResponse<T>>, success?: string): Promise<T | null> => {
    setBusy(true);
    try {
      const res = await call();
      if (!res.success) {
        toast.error('Không thực hiện được', res.message ?? 'Vui lòng thử lại.');
        return null;
      }
      if (success) toast.success(success);
      return res.data ?? ({} as T);
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, run };
}
