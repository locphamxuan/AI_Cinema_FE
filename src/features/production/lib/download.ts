import { toast } from '@/components/ui/Toast';
import { saveBlob } from './format';

/** Fetches a file behind auth and saves it; says so when it cannot be read instead of failing silently. */
export async function downloadFile(load: () => Promise<Blob | null>, fileName: string): Promise<boolean> {
  const blob = await load();
  if (!blob) {
    toast.error('Không tải được file', 'File không còn trên máy chủ hoặc bạn không có quyền xem. Vui lòng thử lại.');
    return false;
  }
  saveBlob(blob, fileName);
  return true;
}