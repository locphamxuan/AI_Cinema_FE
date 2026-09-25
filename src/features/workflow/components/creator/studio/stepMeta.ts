import { Video, Mic, Volume2, Image as ImageIcon, Plus } from 'lucide-react';
import type { GenerationFunctionType, GenerationStep } from '@/types/workflow';

export const FUNCTION_TYPE_META: Record<GenerationFunctionType, { label: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }> = {
  VIDEO: {
    label: 'Video',
    icon: Video,
    placeholder: 'Mô tả góc máy, bối cảnh và ánh sáng. Ví dụ: toàn cảnh phòng thí nghiệm, ánh đèn xanh lạnh…',
  },
  IMAGE: {
    label: 'Hình ảnh',
    icon: ImageIcon,
    placeholder: 'Mô tả hình ảnh cần tạo. Ví dụ: poster nhân vật chính, tranh phác thảo bối cảnh…',
  },
  SCRIPT_VOICE: {
    label: 'Lời thoại',
    icon: Mic,
    placeholder: 'Nhập lời thoại và ngữ điệu. Ví dụ: Minh Anh: "Hệ thống đang tự viết lại nhận thức."',
  },
  AUDIO_MUSIC: {
    label: 'Âm thanh',
    icon: Volume2,
    placeholder: 'Mô tả âm thanh hoặc nhạc nền. Ví dụ: tiếng bước chân trên sàn kim loại, còi báo động xa…',
  },
  CUSTOM: {
    label: 'Khác',
    icon: Plus,
    placeholder: 'Mô tả kết quả bạn muốn nhận được…',
  },
};

export const STEP_STATUS: Record<GenerationStep['status'], { label: string; dot: string }> = {
  pending: { label: 'Đang chờ', dot: 'bg-slate-300 dark:bg-slate-600' },
  processing: { label: 'Đang tạo', dot: 'bg-purple-500 animate-pulse' },
  completed: { label: 'Đã tạo', dot: 'bg-emerald-500' },
  failed: { label: 'Thất bại', dot: 'bg-rose-500' },
};

export const ICON_BUTTON_CLASS =
  'p-1.5 rounded-md text-slate-400 transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2';

export const SMALL_BUTTON_CLASS =
  'px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2';

export const INPUT_CLASS =
  'w-full bg-white dark:bg-[#101218] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition';
