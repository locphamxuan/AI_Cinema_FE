import { useEffect, useState } from 'react';
import type { ApiResponse } from '@/services/apiClient';

export type KeyedRequestState<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T };

/**
 * Loads `load()` whenever `key` changes (or `refresh` is called) and drops answers to
 * an older key, so a slow reply never overwrites a newer one. A null key loads nothing.
 */
export function useKeyedRequest<T>(key: string | null, load: () => Promise<ApiResponse<T>>) {
  const [attempt, setAttempt] = useState(0);
  const requestKey = key === null ? null : `${key}|${attempt}`;
  const [answer, setAnswer] = useState<{ key: string; state: Exclude<KeyedRequestState<T>, { status: 'loading' }> }>();
  const state: KeyedRequestState<T> = answer && answer.key === requestKey ? answer.state : { status: 'loading' };

  useEffect(() => {
    if (requestKey === null) return;
    let cancelled = false;
    load().then((res) => {
      if (cancelled) return;
      setAnswer({
        key: requestKey,
        state: res.success ? { status: 'ready', data: res.data } : { status: 'error', message: res.message ?? 'Không tải được dữ liệu.' },
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the key says when to load again
  }, [requestKey]);

  return { state, refresh: () => setAttempt((n) => n + 1) };
}
