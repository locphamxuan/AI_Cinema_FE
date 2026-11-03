import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiResponse } from '@/services/apiClient';

export interface Resource<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** Loads again; resolves once the new data is in. */
  reload: () => Promise<void>;
}

/**
 * One API read tied to a component: loads when `key` changes, keeps the last data while reloading.
 * `key` null skips the request (e.g. a version not chosen yet).
 */
export function useResource<T>(key: string | null, load: () => Promise<ApiResponse<T>>): Resource<T> {
  const [state, setState] = useState<{ key: string | null; data: T | null; error: string | null; loading: boolean }>({
    key: null,
    data: null,
    error: null,
    loading: key !== null,
  });

  // `load` is recreated every render; the key says when the request really changes,
  // so the latest `load` is read through a ref instead of being a dependency.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const run = useCallback(() => loadRef.current(), []);

  const reload = useCallback(async () => {
    if (key === null) return;
    setState((s) => ({ ...s, loading: true }));
    const res = await run();
    setState({
      key,
      data: res.success ? res.data : null,
      error: res.success ? null : (res.message ?? 'Không tải được dữ liệu.'),
      loading: false,
    });
  }, [key, run]);

  useEffect(() => {
    let active = true;
    if (key === null) return;
    void run().then((res) => {
      if (!active) return;
      setState({
        key,
        data: res.success ? res.data : null,
        error: res.success ? null : (res.message ?? 'Không tải được dữ liệu.'),
        loading: false,
      });
    });
    return () => {
      active = false;
    };
  }, [key, run]);

  const fresh = state.key === key;
  return {
    data: fresh ? state.data : null,
    error: fresh ? state.error : null,
    loading: key !== null && (!fresh || state.loading),
    reload,
  };
}
