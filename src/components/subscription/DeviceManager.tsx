'use client';

import { useAppStore } from '@/store/useAppStore';
import { useDeviceStore } from '@/store/useDeviceStore';

/** MF-4: signed-in devices of the member's plan; locked until the member has a plan. */
export default function DeviceManager() {
  const { subscription } = useAppStore();
  const { devices, revokeDevice, revokeAllOtherDevices } = useDeviceStore();

  return (
    <div className="pt-4">
      {subscription.plan ? (
        /* UNLOCKED DEVICE MANAGEMENT */
        <div className="glass-card p-6 border border-slate-200 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">
                  Quản Lý Thiết Bị Đăng Nhập
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Đã mở khóa theo gói
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-light mt-1">
                Gói <strong className="text-coin">{subscription.plan.name}</strong> cho phép sử dụng tối đa{' '}
                <strong>
                  {subscription.plan.id === 'basic' ? '1' : subscription.plan.id === 'premium' ? '4' : '5 (Không giới hạn)'}
                </strong>{' '}
                thiết bị đồng thời.
              </p>
            </div>

            {devices.filter((d) => !d.isCurrentDevice).length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?')) {
                    revokeAllOtherDevices();
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>🚪</span>
                <span>Đăng xuất tất cả thiết bị khác</span>
              </button>
            )}
          </div>

          {/* Devices Slot Progress */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-600 dark:text-zinc-400">
              Thiết bị đang hoạt động: <strong>{devices.length}</strong> /{' '}
              {subscription.plan.id === 'basic' ? '1' : subscription.plan.id === 'premium' ? '4' : '5'}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {devices.length <= (subscription.plan.id === 'basic' ? 1 : 4) ? 'Trong hạn mức cho phép' : 'Đã đạt tối đa'}
            </span>
          </div>

          {/* Device List */}
          <div className="space-y-3 pt-1">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  dev.isCurrentDevice
                    ? 'bg-slate-100/90 dark:bg-white/[0.06] border-emerald-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xl shrink-0">
                    {dev.deviceType === 'desktop' ? '💻' : dev.deviceType === 'tv' ? '📺' : dev.deviceType === 'tablet' ? '📱' : '📲'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {dev.deviceName}
                      </h4>
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
                      📍 {dev.location} ({dev.ipAddress}) • Hoạt động: <span className={dev.isCurrentDevice ? 'text-emerald-600 font-bold' : ''}>{dev.lastActive}</span>
                    </p>
                  </div>
                </div>

                {!dev.isCurrentDevice ? (
                  <button
                    onClick={() => revokeDevice(dev.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-danger hover:bg-danger/10 border border-transparent hover:border-danger/30 transition-all cursor-pointer self-end sm:self-center"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 self-end sm:self-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Đang xem
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* LOCKED DEVICE MANAGEMENT (NO PLAN) */
        <div className="glass-card p-6 border-2 border-dashed border-slate-300 dark:border-white/15 text-center space-y-3 bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center text-2xl">
            🔒
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Tính Năng Quản Lý Thiết Bị Bị Khóa
          </h3>
          <p className="text-xs text-slate-500 dark:text-muted-light max-w-md mx-auto leading-relaxed">
            Theo quy định hệ thống, bạn cần đăng ký một gói dịch vụ hội viên (Basic, Premium hoặc VIP) để mở quyền quản lý danh sách thiết bị đăng nhập, bảo mật phiên và xem phim đồng thời trên SmartTV, Mobile, Web.
          </p>
          <div className="pt-2">
            <span className="inline-block text-xs font-bold text-coin px-3 py-1 rounded-full bg-coin/10 border border-coin/30">
              💡 Đăng ký gói ở trên để mở khóa tính năng này ngay lập tức
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
