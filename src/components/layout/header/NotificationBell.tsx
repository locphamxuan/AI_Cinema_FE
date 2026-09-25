'use client';

import { useCallback, useState } from 'react';
import { useClickOutside } from './useClickOutside';

const mockNotifications = [
  { id: 'n1', title: 'Tập 6 - Điểm Kỳ Dị vừa ra mắt!', time: '10 phút trước', isNew: true },
  { id: 'n2', title: 'Bạn nhận được 20 Bonus Coin từ điểm danh', time: '1 giờ trước', isNew: true },
  { id: 'n3', title: 'Gói VIP của bạn sẽ gia hạn sau 20 giờ', time: '5 giờ trước', isNew: false },
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(useCallback(() => setIsOpen(false), []));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-colors cursor-pointer"
        title="Thông báo"
      >
        <span className="text-base">🔔</span>
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ruby animate-pulse" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-3 z-50 animate-scale-in space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Thông Báo Mới</h4>
            <span className="text-[10px] text-ruby font-bold">
              {mockNotifications.filter((n) => n.isNew).length} chưa đọc
            </span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {mockNotifications.map((n) => (
              <div
                key={n.id}
                className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-xs space-y-0.5 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
              >
                <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                <p className="text-[10px] text-slate-500 dark:text-muted-light">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
