import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@/components/ui/Toast';
import type { ApiResponse } from '@/services/apiClient';

/**
 * Runs one write to the API: tracks `busy`, shows the backend's error as a toast,
 * and a success toast when `success` is given. Resolves to whether it worked.
 * `onError` may handle a refusal itself (e.g. open a dialog) by returning true, which skips the toast.
 * A second call while one is still running is dropped, so a double click never sends the write twice.
 * `onStale` reloads the screen when the API answers 409: someone else changed the record meanwhile.
 */
export function useAction(options: { onStale?: () => unknown } = {}) {
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const onStale = useRef(options.onStale);
  useEffect(() => {
    onStale.current = options.onStale;
  });

  const run = useCallback(async <T,>(
    call: () => Promise<ApiResponse<T>>,
    success?: string,
    onError?: (res: ApiResponse<T>) => boolean,
  ): Promise<T | null> => {
    if (running.current) return null;
    running.current = true;
    setBusy(true);
    try {
      const res = await call();
      if (!res.success) {
        if (onError?.(res)) return null;
        const stale = res.statusCode === 409 && onStale.current;
        toast.error('Không thực hiện được', `${res.message ?? 'Vui lòng thử lại.'}${stale ? ' Màn hình đã được tải lại.' : ''}`);
        if (stale) await onStale.current?.();
        return null;
      }
      if (success) toast.success(success);
      return res.data ?? ({} as T);
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, run };
}
