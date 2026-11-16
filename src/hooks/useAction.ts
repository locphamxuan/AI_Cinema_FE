import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/Toast';
import type { ApiResponse } from '@/services/apiClient';

/**
 * Runs one write to the API: tracks `busy`, shows the backend's error as a toast,
 * and a success toast when `success` is given. Resolves to whether it worked.
 * `onError` may handle a refusal itself (e.g. open a dialog) by returning true, which skips the toast.
 */
export function useAction() {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async <T,>(
    call: () => Promise<ApiResponse<T>>,
    success?: string,
    onError?: (res: ApiResponse<T>) => boolean,
  ): Promise<T | null> => {
    setBusy(true);
    try {
      const res = await call();
      if (!res.success) {
        if (onError?.(res)) return null;
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
