'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Laptop, Smartphone, Monitor, ShieldCheck, Tv, Trash2, StopCircle, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { deviceService } from '@/services/deviceService';
import type { DeviceOverview, LiveStream, RegisteredDevice } from '@/types/device';
import { toast } from '@/components/ui/Toast';

function platformIcon(platform: string) {
  const p = platform.toUpperCase();
  if (p === 'WEB') return <Laptop className="w-5 h-5 text-sky-500" />;
  if (p === 'ANDROID' || p === 'IOS') return <Smartphone className="w-5 h-5 text-emerald-500" />;
  if (p === 'TV') return <Tv className="w-5 h-5 text-purple-500" />;
  return <Monitor className="w-5 h-5 text-slate-400" />;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function DevicesPage() {
  const { isAuthenticated, openAuthModal } = useAppStore();
  const [data, setData] = useState<DeviceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const fetchOverview = () =>
    deviceService
      .overview()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
          setError(null);
        } else {
          setError(res.message || 'Không thể tải danh sách thiết bị.');
        }
      })
      .catch(() => setError('Lỗi kết nối khi tải thiết bị.'))
      .finally(() => setLoading(false));

  const load = () => {
    setLoading(true);
    fetchOverview();
  };

  useEffect(() => {
    if (isAuthenticated) fetchOverview();
  }, [isAuthenticated]);

  const handleRemoveDevice = async (device: RegisteredDevice) => {
    if (
      !confirm(
        device.current
          ? 'Đây là thiết bị bạn đang dùng. Lần xem phim tới, thiết bị này sẽ được đăng ký lại nếu gói còn chỗ trống. Tiếp tục?'
          : `Gỡ thiết bị "${device.name}"? Thiết bị này sẽ bị dừng phát ngay lập tức.`,
      )
    ) {
      return;
    }

    setActionBusy(device.id);
    const res = await deviceService.remove(device.id);
    setActionBusy(null);

    if (res.success) {
      toast.success('Đã gỡ thiết bị', `Thiết bị "${device.name}" đã được gỡ khỏi tài khoản.`);
      load();
    } else {
      toast.error('Không thể gỡ thiết bị', res.message || 'Vui lòng thử lại sau.');
    }
  };

  const handleEndStream = async (stream: LiveStream) => {
    if (!confirm(`Dừng luồng phát "${stream.episode.movieTitle}" trên thiết bị đó để giải phóng chỗ xem?`)) {
      return;
    }

    setActionBusy(stream.id);
    const res = await deviceService.endStream(stream.id);
    setActionBusy(null);

    if (res.success) {
      toast.success('Đã dừng phát luồng', 'Đã giải phóng slot phát cho thiết bị khác.');
      load();
    } else {
      toast.error('Không thể dừng luồng', res.message || 'Vui lòng thử lại.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
          <Monitor className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Đăng nhập để quản lý thiết bị</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Theo dõi các máy đang đăng nhập tài khoản của bạn và quản lý số luồng xem phim đồng thời.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-ruby hover:bg-ruby-light text-white font-bold text-xs shadow-lg shadow-ruby/20 transition-all cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const devices = data?.devices ?? [];
  const streams = data?.activeSessions ?? [];
  const limits = data?.limits;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12 px-4 sm:px-0">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 text-sm">
              <Laptop className="w-4 h-4" />
            </span>
            Quản Lý Thiết Bị
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kiểm soát các máy đã đăng nhập và giới hạn luồng phát trực tiếp theo quy định của gói (MF-4).
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-ruby bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors w-fit cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Quota Summary Cards ── */}
      {limits && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Thiết bị đã đăng ký
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {devices.length} / {limits.maxRegisteredDevices} <span className="text-xs font-medium text-slate-400">máy</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Tối đa số máy được phép lưu trữ theo gói tài khoản</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <Laptop className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Luồng phát đồng thời
              </p>
              <p className="text-2xl font-black text-ruby mt-1">
                {streams.length} / {limits.maxConcurrentStreams} <span className="text-xs font-medium text-slate-400">luồng</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Số máy đang xem phim cùng lúc trên tài khoản này</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-ruby/10 border border-ruby/20 flex items-center justify-center text-ruby">
              <Tv className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* ── Active Live Streams Section ── */}
      {streams.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang phát trực tiếp ({streams.length})
          </h2>

          <div className="space-y-2.5">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="p-4 rounded-2xl bg-ruby/5 border border-ruby/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {stream.episode.movieTitle} - {stream.episode.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Bắt đầu phát lúc {formatDate(stream.startedAt)}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={actionBusy === stream.id}
                  onClick={() => handleEndStream(stream)}
                  className="px-3.5 py-1.5 rounded-xl bg-danger/10 hover:bg-danger text-danger hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 w-fit cursor-pointer disabled:opacity-50"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>{actionBusy === stream.id ? 'Đang dừng…' : 'Dừng phát'}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Registered Devices List ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Danh sách thiết bị ({devices.length})
        </h2>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-18 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && devices.length === 0 && (
          <p className="text-xs text-slate-500 py-6 text-center">Chưa có thiết bị nào được ghi nhận.</p>
        )}

        {!loading && devices.length > 0 && (
          <div className="space-y-2.5">
            {devices.map((device) => (
              <div
                key={device.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  device.current
                    ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    {platformIcon(device.platform)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{device.name}</p>
                      {device.current && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold border border-sky-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Thiết bị này
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      Hoạt động lần cuối: {formatDate(device.lastSeenAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={actionBusy === device.id}
                  onClick={() => handleRemoveDevice(device)}
                  title="Gỡ thiết bị này"
                  aria-label={`Gỡ thiết bị ${device.name}`}
                  className="p-2.5 rounded-xl hover:bg-danger/10 text-slate-400 hover:text-danger transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
