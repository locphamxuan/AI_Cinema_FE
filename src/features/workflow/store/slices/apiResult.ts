import type { ApiResponse } from '@/services/apiClient';
import { toast } from '@/components/ui/Toast';

/** Awaits a workflow API call; on failure shows the backend message and returns null. */
export async function apiResult<T>(call: Promise<ApiResponse<T>>, errorTitle: string): Promise<T | null> {
  const res = await call;
  if (!res.success) {
    toast.error(errorTitle, res.message ?? 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.');
    return null;
  }
  return res.data;
}
