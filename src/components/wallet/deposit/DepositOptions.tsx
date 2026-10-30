'use client';

import type { ReactNode } from 'react';
import { CreditCard, Smartphone } from 'lucide-react';
import type { PaymentProvider } from '@/types/episodeAccess';

/** Amounts offered as one-tap choices; those outside the Admin's range are hidden. */
export const TOP_UP_AMOUNTS_VND = [20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000];

export interface PaymentMethod {
  id: PaymentProvider;
  name: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'VNPAY',
    name: 'Cổng VNPAY Sandbox',
    subtitle: 'Thẻ ATM nội địa NCB / QR Code / Visa',
    badge: 'Khuyên Dùng Test',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: <CreditCard className="w-5 h-5 text-indigo-400" />,
  },
  {
    id: 'MOMO',
    name: 'Ví Điện Tử MoMo',
    subtitle: 'Quét mã MoMo QR tức thì',
    badge: 'Ví Điện Tử',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    icon: <Smartphone className="w-5 h-5 text-pink-400" />,
  },
];

interface AmountGridProps {
  amounts: number[];
  rateVnd: number | null;
  selected: number;
  onSelect: (amountVnd: number) => void;
}

/** Coins granted = floor(VND / rate), exactly as the BE computes them; top-ups carry no bonus. */
export function AmountGrid({ amounts, rateVnd, selected, onSelect }: Readonly<AmountGridProps>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {amounts.map((amountVnd) => {
        const isSelected = selected === amountVnd;
        return (
          <button
            type="button"
            key={amountVnd}
            onClick={() => onSelect(amountVnd)}
            className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'border-amber-400 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent shadow-lg shadow-amber-500/15 ring-1 ring-amber-400'
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20'
            }`}
          >
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-amber-300 tracking-tight">
                  {rateVnd ? Math.floor(amountVnd / rateVnd).toLocaleString('vi-VN') : '…'}
                </span>
                <span className="text-[11px] font-bold text-amber-400/80">Coin</span>
              </div>
              {isSelected && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-white/5">
              <span className="text-xs sm:text-sm font-extrabold text-white">{amountVnd.toLocaleString('vi-VN')} ₫</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface MethodPickerProps {
  selected: PaymentProvider;
  onSelect: (provider: PaymentProvider) => void;
}

export function MethodPicker({ selected, onSelect }: Readonly<MethodPickerProps>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {PAYMENT_METHODS.map((m) => {
        const isSelected = selected === m.id;
        return (
          <button
            type="button"
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              isSelected
                ? 'border-indigo-400 bg-indigo-500/15 ring-1 ring-indigo-400/80 shadow-md shadow-indigo-500/10'
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-indigo-500/20 border border-indigo-400/40' : 'bg-white/5 border border-white/10'
              }`}
            >
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-white truncate">{m.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${m.badgeColor}`}>{m.badge}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{m.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
