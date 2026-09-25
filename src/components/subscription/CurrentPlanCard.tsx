'use client';

import { useAppStore } from '@/store/useAppStore';

/** The member's active plan, its renewal countdown and the auto-renew and cancel controls. */
export default function CurrentPlanCard({ countdown, onCancel }: { countdown: string; onCancel: () => void }) {
  const { subscription, toggleAutoRenew } = useAppStore();

  return (
    <>
      {subscription.plan ? (
        <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-600/30 shrink-0">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">{subscription.plan.name}</h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      subscription.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {subscription.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-muted-light mt-0.5">
                  Đã mở khóa toàn bộ quyền xem phim OTT AI và quản lý đa thiết bị
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {subscription.plan.price.toLocaleString('vi-VN')}₫
              </p>
              <p className="text-xs text-slate-500 dark:text-muted-light">Chu kỳ: {subscription.plan.duration} ngày</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold tracking-wider">
                Ngày bắt đầu
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground mt-0.5">
                {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold tracking-wider">
                Ngày hết hạn
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground mt-0.5">
                {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold tracking-wider">
                Phương thức
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-foreground mt-0.5 truncate">
                {subscription.paymentMethod || 'Thẻ Visa'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold tracking-wider">
                Thời gian còn lại
              </p>
              <p className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                {countdown || '—'}
              </p>
            </div>
          </div>

          {/* Auto-Renew Switch Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Tự động gia hạn (Auto-renewal)</span>
                {subscription.autoRenew ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                    Bật
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">
                    Dừng khi hết hạn
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                {subscription.autoRenew
                  ? 'Gói sẽ tự động trừ phí gia hạn tiếp theo khi đến hạn. Hệ thống sẽ cảnh báo trước 24 giờ.'
                  : `Bạn đã hủy gia hạn trước hạn. Gói sẽ tự động dừng khi hết hạn vào ngày ${new Date(subscription.endDate!).toLocaleDateString('vi-VN')}, không tự động thu phí tiếp.`}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {subscription.autoRenew ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
                >
                  Hủy gia hạn tự động
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleAutoRenew}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition cursor-pointer"
                >
                  Bật lại gia hạn tự động
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty Plan State */
        <div className="bg-white dark:bg-[#161922] p-8 rounded-3xl border border-slate-200 dark:border-white/10 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center text-3xl mb-3">
            🎬
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bạn chưa có gói hội viên</h2>
          <p className="text-slate-500 dark:text-muted-light text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Đăng ký gói thành viên theo Tuần, Tháng hoặc Năm để mở quyền xem toàn bộ phim không giới hạn!
          </p>
        </div>
      )}
    </>
  );
}
