import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAction } from '@/hooks/useAction';
import type { ApiResponse } from '@/services/apiClient';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe('useAction', () => {
  it('drops a second call while the first is still running', async () => {
    let finish: (value: ApiResponse<number>) => void = () => {};
    const call = vi.fn(() => new Promise<ApiResponse<number>>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useAction());
    let first: Promise<number | null> = Promise.resolve(null);
    let second: Promise<number | null> = Promise.resolve(null);
    act(() => {
      first = result.current.run(call);
      second = result.current.run(call);
    });
    await act(async () => finish({ success: true, data: 1 }));
    expect(call).toHaveBeenCalledTimes(1);
    await expect(first).resolves.toBe(1);
    await expect(second).resolves.toBeNull();
  });

  it('reloads the screen when the API answers 409', async () => {
    const onStale = vi.fn();
    const { result } = renderHook(() => useAction({ onStale }));
    await act(async () => {
      await result.current.run(() => Promise.resolve({ success: false, data: null, statusCode: 409, message: 'x' }));
    });
    expect(onStale).toHaveBeenCalledTimes(1);
  });
});
