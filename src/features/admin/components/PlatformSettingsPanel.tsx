'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coins, Clapperboard, Radio, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { PlatformSettings } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';

type Key = { [K in keyof PlatformSettings]-?: PlatformSettings[K] extends number ? K : never }[keyof PlatformSettings];

interface SettingField {
  key: Key;
  label: string;
  unit: string;
  hint: string;
  min: number;
}

const COIN_FIELDS: SettingField[] = [
  { key: 'coinRateVnd', label: 'Tỷ giá Coin', unit: '₫ / Coin', hint: 'Giá trị 1 Coin chính khi nạp tiền.', min: 1 },
  { key: 'coinTopUpMinVnd', label: 'Nạp tối thiểu mỗi lần', unit: '₫', hint: '', min: 1000 },
  { key: 'coinTopUpMaxVnd', label: 'Nạp tối đa mỗi lần', unit: '₫', hint: '', min: 1000 },
  { key: 'bonusCoinExpiryDays', label: 'Hạn Coin thưởng', unit: 'ngày', hint: 'Coin thưởng hết hạn sau số ngày này kể từ khi nhận.', min: 1 },
  { key: 'newMemberBonusCoins', label: 'Coin thưởng tài khoản mới', unit: 'Coin', hint: '0 = không tặng.', min: 0 },
];

const PRODUCTION_FIELDS: SettingField[] = [
  { key: 'tokenRateVnd', label: 'Tỷ giá Token', unit: '₫ / Token', hint: 'Giá trị 1 Token phí sản xuất; áp cho các lần ghi phí từ nay.', min: 1 },
  { key: 'episodeCoinPriceMin', label: 'Giá tập thấp nhất', unit: 'Coin', hint: 'Giá ngoài khoảng vẫn lưu được nhưng báo Admin.', min: 0 },
  { key: 'episodeCoinPriceMax', label: 'Giá tập cao nhất', unit: 'Coin', hint: '', min: 0 },
];

const STREAMING_FIELDS: SettingField[] = [
  { key: 'freeStarterEpisodeCount', label: 'Số tập xem miễn phí', unit: 'tập', hint: 'Các tập đầu Guest và Member Free xem được.', min: 0 },
  { key: 'playbackHeartbeatTimeoutSeconds', label: 'Hết phiên phát', unit: 'giây', hint: 'Trình phát không báo tín hiệu quá số giây này thì phiên xem bị đóng.', min: 10 },
  { key: 'subscriptionCancelWindowHours', label: 'Hạn tắt gia hạn', unit: 'giờ', hint: 'Member tắt tự gia hạn trước ngày gia hạn ít nhất ngần này giờ.', min: 0 },
  { key: 'planRenewalGraceHours', label: 'Thời gian chờ gia hạn lỗi', unit: 'giờ', hint: 'Gia hạn thiếu Coin được thử lại trong ngần này giờ, không có quyền xem; 0 = gói hết hạn ngay.', min: 0 },
];

const ALL_FIELDS = [...COIN_FIELDS, ...PRODUCTION_FIELDS, ...STREAMING_FIELDS];

type SettingsTab = 'all' | 'coin' | 'production' | 'streaming' | 'rewards';

const TABS: { key: SettingsTab; label: string; Icon?: typeof Coins }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'coin', label: 'COIN & Nạp tiền', Icon: Coins },
  { key: 'production', label: 'Sản xuất & Token', Icon: Clapperboard },
  { key: 'streaming', label: 'Phát sóng & Gói', Icon: Radio },
  { key: 'rewards', label: 'Điểm danh & Vòng quay', Icon: Gift },
];

/** Segmented platform policies: Coin, Production, Playback & Rewards */
export function PlatformSettingsPanel() {
  const settings = useResource('settings', productionService.getPlatformSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('all');
  const [draft, setDraft] = useState<Partial<Record<Key, string>>>({});
  const [refund, setRefund] = useState<boolean | null>(null);
  const { busy, run } = useAction();

  if (settings.loading && !settings.data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Đang tải tham số cài đặt nền tảng…
      </div>
    );
  }
  if (!settings.data) return <p className="text-xs text-rose-600">{settings.error ?? 'Không tải được cài đặt.'}</p>;
  const current = settings.data;

  const value = (k: Key) => draft[k] ?? String(current[k]);
  const changed = ALL_FIELDS.filter((f) => draft[f.key] !== undefined && Number(draft[f.key]) !== current[f.key]);
  const refundChanged = refund !== null && refund !== current.refundOnRemoval;
  const invalid = ALL_FIELDS.some((f) => {
    const n = Number(value(f.key));
    return !Number.isInteger(n) || n < f.min;
  });
  const rangeInvalid = Number(value('episodeCoinPriceMin')) > Number(value('episodeCoinPriceMax'));
  const topUpInvalid = Number(value('coinTopUpMinVnd')) > Number(value('coinTopUpMaxVnd'));
  const changes = changed.length + (refundChanged ? 1 : 0);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch = Object.fromEntries(changed.map((f) => [f.key, Number(value(f.key))])) as Partial<PlatformSettings>;
    if (refundChanged) patch.refundOnRemoval = refund ?? current.refundOnRemoval;
    if (await run(() => productionService.updatePlatformSettings(patch), 'Đã lưu cài đặt')) {
      setDraft({});
      setRefund(null);
      await settings.reload();
    }
  };

  const renderFieldGroup = (fields: SettingField[]) => (
    <div className="space-y-3 text-xs">
      {fields.map((f) => (
        <label
          key={f.key}
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-4 items-center p-3 rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-sky-200 dark:hover:border-sky-500/20 transition-colors"
        >
          <span>
            <span className="block font-semibold text-slate-800 dark:text-slate-200">{f.label}</span>
            {f.hint && <span className="block text-slate-500 dark:text-slate-400">{f.hint}</span>}
          </span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={f.min}
              step={1}
              value={value(f.key)}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              className={`${fieldInputClass} w-28 py-1.5 text-right tabular-nums`}
            />
            <span className="w-20 text-slate-500">{f.unit}</span>
          </span>
        </label>
      ))}
    </div>
  );

  const refundToggle = (
    <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-500/5 border border-sky-200/50 dark:border-sky-500/10">
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={refund ?? current.refundOnRemoval}
          onChange={(e) => setRefund(e.target.checked)}
          className="mt-0.5 accent-sky-600"
        />
        <span>
          <span className="block font-semibold text-slate-800 dark:text-slate-200">Hoàn Coin khi gỡ hẳn tập</span>
          <span className="block text-slate-500 dark:text-slate-400">Người đã mua tập bị gỡ hẳn được hoàn đúng Coin đã trả.</span>
        </span>
      </label>
    </div>
  );

  return (
    <section className="bg-white dark:bg-card rounded-3xl border border-sky-100 dark:border-white/10 p-6 sm:p-8 space-y-6 max-w-3xl shadow-sm">
      <div className="border-b border-slate-100 dark:border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Cài đặt nền tảng</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cập nhật lần cuối: <span className="tabular-nums text-slate-700 dark:text-slate-300">{formatDateTime(current.updatedAt)}</span>
          </p>
        </div>
        {changes > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
            {changes} thay đổi chưa lưu
          </span>
        )}
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-white/5 pb-3">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={save} className="space-y-5 text-xs">
        {/* Tab All: show all sections grouped */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-2.5 flex items-center gap-1.5">
                Phân khúc COIN & Nạp tiền
              </h3>
              {renderFieldGroup(COIN_FIELDS)}
              <div className="mt-3">{refundToggle}</div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-2.5 flex items-center gap-1.5">
                Phân khúc Sản xuất & Token
              </h3>
              {renderFieldGroup(PRODUCTION_FIELDS)}
            </div>

            <div>
              <h3 className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-2.5 flex items-center gap-1.5">
                Phân khúc Phát sóng & Gia hạn gói
              </h3>
              {renderFieldGroup(STREAMING_FIELDS)}
            </div>
          </div>
        )}

        {/* Tab 1: Coin */}
        {activeTab === 'coin' && (
          <div className="space-y-4">
            {renderFieldGroup(COIN_FIELDS)}
            {refundToggle}
            {topUpInvalid && <p className="text-rose-600">Mức nạp tối thiểu không được lớn hơn mức tối đa.</p>}
          </div>
        )}

        {/* Tab 2: Production */}
        {activeTab === 'production' && (
          <div className="space-y-4">
            {renderFieldGroup(PRODUCTION_FIELDS)}
            {rangeInvalid && <p className="text-rose-600">Giá thấp nhất không được lớn hơn giá cao nhất.</p>}
          </div>
        )}

        {/* Tab 3: Streaming */}
        {activeTab === 'streaming' && (
          <div className="space-y-4">
            {renderFieldGroup(STREAMING_FIELDS)}
          </div>
        )}

        {/* Tab 4: Rewards Guide & Quick Link */}
        {activeTab === 'rewards' && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quy tắc thưởng & Vòng quay may mắn</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cấu hình phần thưởng đăng nhập chuỗi 7 ngày và danh mục giải thưởng vòng quay Coin.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Các quy tắc lũy tiến bậc thang điểm danh (Reward Ladder) và xác suất trọng số của vòng quay (Reward Wheel) được quản lý độc lập tại phân hệ Thưởng.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/rewards"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
              >
                <span>Mở trang Quản lý Điểm danh & Vòng quay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {rangeInvalid && <p className="text-rose-600">Giá thấp nhất không được lớn hơn giá cao nhất.</p>}
        {topUpInvalid && <p className="text-rose-600">Mức nạp tối thiểu không được lớn hơn mức tối đa.</p>}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          {changes > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraft({});
                setRefund(null);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl"
            >
              Hủy thay đổi
            </Button>
          )}
          <Button
            type="submit"
            disabled={busy || changes === 0 || invalid || rangeInvalid || topUpInvalid}
            className="px-6 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-sky-500/10 cursor-pointer"
          >
            {busy ? 'Đang lưu…' : `Lưu ${changes > 0 ? `(${changes})` : ''}`}
          </Button>
        </div>
      </form>
    </section>
  );
}
