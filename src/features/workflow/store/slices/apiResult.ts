import type { ApiResponse } from '@/services/apiClient';
import { toast } from '@/components/ui/Toast';

/** Backend refusals the Creator can act on, reworded so they say what to do next. */
function describeFailure(message: string | undefined): string {
  if (!message) return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  const exceeded = /quota_exceeded: needs (\d+) tokens, (\d+) left/.exec(message);
  if (exceeded) {
    return `Cần ${exceeded[1]} token nhưng tập này chỉ còn ${exceeded[2]}. Vào tab Token của phim để xin thêm.`;
  }
  if (message.includes('no active AI quota allocation')) {
    return 'Tập này đã hết token được cấp. Vào tab Token của phim để xin thêm.';
  }
  return message;
}

/** Awaits a workflow API call; on failure shows the backend message and returns null. */
export async function apiResult<T>(call: Promise<ApiResponse<T>>, errorTitle: string): Promise<T | null> {
  const res = await call;
  if (!res.success) {
    toast.error(errorTitle, describeFailure(res.message));
    return null;
  }
  return res.data;
}
