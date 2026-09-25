'use client';

import { CreditCard, ShieldCheck, Zap } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription';

interface PaymentModalProps {
  plan: SubscriptionPlan;
  method: string;
  onMethodChange: (method: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

/** Step 2 of MF-2: confirm the chosen plan and payment method. */
export default function PaymentModal({ plan, method, onMethodChange, onClose, onConfirm }: PaymentModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#161922] w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Xác Nhận Thanh Toán & Kích Hoạt</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bước 2 trong quy trình Mainflow 2</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Plan Info Summary */}
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-purple-900 dark:text-purple-200">{plan.name}</h4>
              <p className="text-xs text-purple-700 dark:text-purple-300/80 mt-0.5">
                Thời hạn: {plan.duration} ngày • Tự động gia hạn khi hết hạn
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                {plan.price.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>
        </div>

        {/* Select Payment Method */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Chọn phương thức thanh toán
          </label>

          <label
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              method.includes('Visa')
                ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20'
                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Thẻ Visa / Mastercard</p>
                <p className="text-[11px] text-slate-400">Thẻ liên kết ****4242</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={method.includes('Visa')}
              onChange={() => onMethodChange('Thẻ Visa / Mastercard (****4242)')}
              className="accent-purple-600 w-4 h-4 cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              method.includes('Ví MoMo')
                ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20'
                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📱</span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Ví MoMo / ZaloPay</p>
                <p className="text-[11px] text-slate-400">Thanh toán qua mã QR tiện lợi</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={method.includes('Ví MoMo')}
              onChange={() => onMethodChange('Ví MoMo (090****123)')}
              className="accent-purple-600 w-4 h-4 cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              method.includes('Ví Coin')
                ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20'
                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🪙</span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Ví Coin AI Cinema</p>
                <p className="text-[11px] text-slate-400">Thanh toán trực tiếp bằng Coin</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={method.includes('Ví Coin')}
              onChange={() => onMethodChange('Ví Coin AI Cinema')}
              className="accent-purple-600 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Note on Auto-renewal rule */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-[11px] text-slate-500 dark:text-slate-400 mb-6 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Gói được cài đặt <strong>tự động gia hạn</strong>. Hệ thống sẽ theo dõi và gửi thông báo cảnh báo trước{' '}
            <strong>24h</strong>. Bạn có thể hủy gia hạn trước mốc 24h bất cứ lúc nào.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Thanh Toán & Mở Full Phim</span>
          </button>
        </div>
      </div>
    </div>
  );
}
