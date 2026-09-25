'use client';

import { RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export interface SubscriptionNotice {
  type: 'success' | 'warning' | 'info';
  text: string;
}

/** Demo controls that move the renewal date so the 24h rules can be shown live. */
export default function SubscriptionSimulator({ onNotify }: { onNotify: (notice: SubscriptionNotice) => void }) {
  const { simulateExpiryTime, renewSubscription } = useAppStore();

  return (
    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-dashed border-purple-300 dark:border-purple-500/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h4 className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300">
            Công Cụ Mô Phỏng Mốc Thời Gian (Demo & Kiểm Thử Mainflow 2)
          </h4>
        </div>
        <span className="text-[10px] text-slate-400">Kiểm thử trực tiếp trên FE</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Sử dụng các phím tắt bên dưới để mô phỏng các trạng thái thời gian khác nhau trong Mainflow 2 mà không cần đợi
        nhiều ngày:
      </p>
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => simulateExpiryTime(20)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
        >
          <span>⚠️</span>
          <span>Đặt còn 20h (&lt; 24h: Hiện cảnh báo)</span>
        </button>

        <button
          type="button"
          onClick={() => simulateExpiryTime(72)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition cursor-pointer flex items-center gap-1.5"
        >
          <span>📅</span>
          <span>Đặt còn 3 ngày (≥ 24h: Cho phép hủy trước hạn)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const res = renewSubscription();
            onNotify({ type: 'success', text: res.message });
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Mô phỏng tự động thu phí & gia hạn</span>
        </button>
      </div>
    </div>
  );
}
