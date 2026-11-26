'use client';

import { useState } from 'react';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { ErrorNote } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { PlatformSettings } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { formatDateTime, formatNumber } from '@/lib/format';
import { ContractPartySettingsForm } from './ContractPartySettingsForm';

type Key = { [K in keyof PlatformSettings]-?: PlatformSettings[K] extends number ? K : never }[keyof PlatformSettings];

interface SettingField {
  key: Key;
  label: string;
  unit: string;
  hint: string;
  min: number;
  /** The API's ceiling (UpdatePlatformSettingRequestDto), when it has one. */
  max?: number;
}

const COIN_FIELDS: SettingField[] = [
  { key: 'coinRateVnd', label: 'Tỷ giá Coin', unit: '₫ / Coin', hint: 'Giá trị 1 Coin chính khi nạp tiền.', min: 1 },
  { key: 'coinTopUpMinVnd', label: 'Nạp tối thiểu mỗi lần', unit: '₫', hint: '', min: 1000 },
  { key: 'coinTopUpMaxVnd', label: 'Nạp tối đa mỗi lần', unit: '₫', hint: '', min: 1000 },
  { key: 'newMemberBonusCoins', label: 'Coin thưởng tài khoản mới', unit: 'Coin', hint: '0 = không tặng.', min: 0, max: 1_000_000 },
];

const PRODUCTION_FIELDS: SettingField[] = [
  { key: 'episodeCoinPriceMin', label: 'Giá tập thấp nhất', unit: 'Coin', hint: 'Giá ngoài khoảng vẫn lưu được nhưng báo Admin.', min: 0 },
  { key: 'episodeCoinPriceMax', label: 'Giá tập cao nhất', unit: 'Coin', hint: '', min: 0 },
];

const STREAMING_FIELDS: SettingField[] = [
  { key: 'freeStarterEpisodeCount', label: 'Số tập xem miễn phí', unit: 'tập', hint: 'Số tập đầu mà khách chưa đăng nhập và Member gói Thường được xem miễn phí.', min: 0, max: 20 },
  { key: 'playbackHeartbeatTimeoutSeconds', label: 'Tự ngắt khi mất tín hiệu', unit: 'giây', hint: 'Trình phát không gửi tín hiệu quá số giây này thì lượt xem bị ngắt.', min: 10 },
  { key: 'subscriptionCancelWindowHours', label: 'Hạn tắt gia hạn', unit: 'giờ', hint: 'Member tắt tự gia hạn trước ngày gia hạn ít nhất ngần này giờ.', min: 0, max: 720 },
  { key: 'planRenewalGraceHours', label: 'Thời gian thử gia hạn lại', unit: 'giờ', hint: 'Gia hạn thiếu Coin được thử lại trong ngần này giờ, không có quyền xem; 0 = gói hết hạn ngay.', min: 0, max: 720 },
];

const ALL_FIELDS = [...COIN_FIELDS, ...PRODUCTION_FIELDS, ...STREAMING_FIELDS];

/** Why a typed setting would be refused, or null; an emptied box never goes out as 0. */
export function settingProblem(raw: string, { min, max }: Pick<SettingField, 'min' | 'max'>): string | null {
  const n = Number(raw);
  if (raw.trim() === '' || !Number.isInteger(n) || n < min || (max !== undefined && n > max)) {
    return max === undefined ? `Nhập số nguyên từ ${formatNumber(min)} trở lên.` : `Nhập số nguyên từ ${formatNumber(min)} đến ${formatNumber(max)}.`;
  }
  return null;
}

type SettingsTab = 'all' | 'coin' | 'production' | 'streaming' | 'contract';

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'coin', label: 'Coin & nạp tiền' },
  { key: 'production', label: 'Giá tập' },
  { key: 'streaming', label: 'Trình phát & gói' },
  { key: 'contract', label: 'Hợp đồng (Bên A)' },
];

/** Segmented platform policies: Coin, Production, Playback and the contract's party A. */
export function PlatformSettingsPanel() {
  const settings = useResource('settings', productionService.getPlatformSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('all');
  const [draft, setDraft] = useState<Partial<Record<Key, string>>>({});
  const [refund, setRefund] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { busy, run } = useAction({ onStale: () => settings.reload() });

  if (settings.loading && !settings.data) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Đang tải tham số cài đặt nền tảng…
      </div>
    );
  }
  if (!settings.data) return <ErrorNote message={settings.error ?? 'Không tải được cài đặt.'} onRetry={settings.reload} />;
  const current = settings.data;

  const value = (k: Key) => draft[k] ?? String(current[k]);
  const changed = ALL_FIELDS.filter((f) => draft[f.key] !== undefined && Number(draft[f.key]) !== current[f.key]);
  const refundChanged = refund !== null && refund !== current.refundOnRemoval;
  const invalid = ALL_FIELDS.some((f) => settingProblem(value(f.key), f));
  const rangeInvalid = Number(value('episodeCoinPriceMin')) > Number(value('episodeCoinPriceMax'));
  const topUpInvalid = Number(value('coinTopUpMinVnd')) > Number(value('coinTopUpMaxVnd'));
  const changes = changed.length + (refundChanged ? 1 : 0);

  const save = async () => {
    setConfirming(false);
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
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-4 items-center p-3 rounded-2xl bg-muted/60 border border-border hover:border-sky-200 dark:hover:border-sky-500/20 transition-colors"
        >
          <span>
            <span className="block font-semibold text-foreground">{f.label}</span>
            {f.hint && <span className="block text-muted-foreground">{f.hint}</span>}
          </span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={f.min}
              max={f.max}
              step={1}
              aria-label={f.label}
              value={value(f.key)}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              className={`${fieldInputClass} w-28 py-1.5 text-right tabular-nums`}
            />
            <span className="w-20 text-muted-foreground">{f.unit}</span>
          </span>
          {settingProblem(value(f.key), f) && (
            <span role="alert" className="sm:col-span-2 text-rose-600">
              {settingProblem(value(f.key), f)}
            </span>
          )}
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
          <span className="block font-semibold text-foreground">Hoàn Coin khi gỡ hẳn tập</span>
          <span className="block text-muted-foreground">Người đã mua tập bị gỡ hẳn được hoàn đúng Coin đã trả.</span>
        </span>
      </label>
    </div>
  );

  return (
    <section className="bg-card rounded-3xl border border-sky-100 dark:border-white/10 p-6 sm:p-8 space-y-6 max-w-3xl shadow-sm">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Cài đặt nền tảng</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cập nhật lần cuối: <span className="tabular-nums text-secondary-foreground">{formatDateTime(current.updatedAt)}</span>
          </p>
        </div>
        {changes > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
            {changes} thay đổi chưa lưu
          </span>
        )}
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'contract' && <ContractPartySettingsForm current={current} onSaved={settings.reload} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setConfirming(true);
        }}
        className={`space-y-5 text-xs ${activeTab === 'contract' ? 'hidden' : ''}`}>
        {/* Tab All: show all sections grouped */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-2.5 flex items-center gap-1.5">
                Coin & nạp tiền
              </h3>
              {renderFieldGroup(COIN_FIELDS)}
              <div className="mt-3">{refundToggle}</div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-2.5 flex items-center gap-1.5">
                Khoảng giá tập
              </h3>
              {renderFieldGroup(PRODUCTION_FIELDS)}
            </div>

            <div>
              <h3 className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-2.5 flex items-center gap-1.5">
                Trình phát & gia hạn gói
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
          </div>
        )}

        {/* Tab 2: Production */}
        {activeTab === 'production' && (
          <div className="space-y-4">
            {renderFieldGroup(PRODUCTION_FIELDS)}
          </div>
        )}

        {/* Tab 3: Streaming */}
        {activeTab === 'streaming' && (
          <div className="space-y-4">
            {renderFieldGroup(STREAMING_FIELDS)}
          </div>
        )}

        {rangeInvalid && <p className="text-rose-600">Giá thấp nhất không được lớn hơn giá cao nhất.</p>}
        {topUpInvalid && <p className="text-rose-600">Mức nạp tối thiểu không được lớn hơn mức tối đa.</p>}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
              Huỷ thay đổi
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
      <ConfirmModal
        open={confirming}
        tone="warning"
        title="Lưu cài đặt nền tảng"
        description="Cài đặt áp dụng ngay cho toàn bộ nền tảng."
        details={[
          ...changed.map((f): [string, string] => [f.label, `${formatNumber(current[f.key])} → ${formatNumber(Number(value(f.key)))} ${f.unit}`]),
          ...(refundChanged ? [['Hoàn Coin khi gỡ hẳn tập', refund ? 'Bật' : 'Tắt'] as [string, string]] : []),
        ]}
        confirmLabel="Lưu cài đặt"
        busy={busy}
        onClose={() => setConfirming(false)}
        onConfirm={save}
      />
    </section>
  );
}
