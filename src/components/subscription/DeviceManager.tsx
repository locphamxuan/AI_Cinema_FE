'use client';

import { useAppStore } from '@/store/useAppStore';
import { useDeviceStore } from '@/store/useDeviceStore';

/** MF-4: signed-in devices of the member's plan; locked until the member has a plan. */
export default function DeviceManager() {
  const { subscription } = useAppStore();
  const { devices, revokeDevice, revokeAllOtherDevices } = useDeviceStore();

  return (
    <div className="pt-2">
      {subscription.plan ? (
        <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">Quản Lý Thiết Bị Đăng Nhập</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Đã mở khóa theo gói
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-light mt-1">
                Gói <strong className="text-purple-600 dark:text-purple-400">{subscription.plan.name}</strong> cho phép
                sử dụng tối đa{' '}
                <strong>
                  {subscription.plan.id === 'week_vip'
                    ? '2'
                    : subscription.plan.id === 'month_vip'
                      ? '4'
                      : 'Không giới hạn'}
                </strong>{' '}
                thiết bị đồng thời.
              </p>
            </div>

            {devices.filter((d) => !d.isCurrentDevice).length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?')) {
                    revokeAllOtherDevices();
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>🚪</span>
                <span>Đăng xuất tất cả thiết bị khác</span>
              </button>
            )}
          </div>

          {/* Device List */}
          <div className="space-y-3 pt-1">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  dev.isCurrentDevice
                    ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-500/40'
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xl shrink-0">
                    {dev.deviceType === 'desktop'
                      ? '💻'
                      : dev.deviceType === 'tv'
                        ? '📺'
                        : dev.deviceType === 'tablet'
                          ? '📱'
                          : '📲'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{dev.deviceName}</h4>
                      {dev.isCurrentDevice && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                          Thiết bị này
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {dev.browser} • {dev.os}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      📍 {dev.location} ({dev.ipAddress}) • Hoạt động:{' '}
                      <span className={dev.isCurrentDevice ? 'text-emerald-600 font-bold' : ''}>{dev.lastActive}</span>
                    </p>
                  </div>
                </div>

                {!dev.isCurrentDevice ? (
                  <button
                    type="button"
                    onClick={() => revokeDevice(dev.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer self-end sm:self-center"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 self-end sm:self-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Đang xem
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
