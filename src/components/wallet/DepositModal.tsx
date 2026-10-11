'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { coinTopUpService } from '@/services/coinTopUpService';
import type { PaymentProvider, TopUpOptions } from '@/types/episodeAccess';
import { AmountGrid, MethodPicker, TOP_UP_AMOUNTS_VND } from './deposit/DepositOptions';
import { VnpaySandboxCard } from './deposit/VnpaySandboxCard';

/**
 * SF-B Top-up Coin: pick an amount and a gateway, the BE opens the order and answers where to pay.
 * The Coins shown come from the Admin's rate (GET /wallet/top-ups/options); the wallet is credited
 * by the gateway IPN, never by this screen.
 */
export default function DepositModal() {
  const { isDepositModalOpen, closeDepositModal, isAuthenticated, openAuthModal, wallet } = useAppStore();

  const [options, setOptions] = useState<TopUpOptions | null>(null);
  const [amountVnd, setAmountVnd] = useState(TOP_UP_AMOUNTS_VND[2]);
  const [provider, setProvider] = useState<PaymentProvider>('VNPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isDepositModalOpen || !isAuthenticated || options) return;
    coinTopUpService
      .getOptions()
      .then((res) => {
        if (res.success && res.data) setOptions(res.data);
      })
      .catch(() => setOptions(null));
  }, [isDepositModalOpen, isAuthenticated, options]);

  const amounts = useMemo(
    () => TOP_UP_AMOUNTS_VND.filter((vnd) => !options || (vnd >= options.minVnd && vnd <= options.maxVnd)),
    [options],
  );

  if (!isDepositModalOpen) return null;

  const rateVnd = options?.rateVnd ?? null;
  const coins = rateVnd ? Math.floor(amountVnd / rateVnd) : null;

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      closeDepositModal();
      openAuthModal('login');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    const res = await coinTopUpService.createTopUp(provider, amountVnd);
    if (res.success && res.data?.redirectUrl) {
      window.location.href = res.data.redirectUrl;
      return;
    }
    setErrorMessage(res.message || 'Không thể tạo đơn nạp Coin. Vui lòng thử lại sau.');
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#141824] to-[#0D1017] border border-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-5 sm:p-7 overflow-hidden text-white my-auto">
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-xs" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/20">
              <div className="w-full h-full rounded-2xl bg-[#141824] flex items-center justify-center text-2xl">🪙</div>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">Nạp Coin Vào Ví</h3>
              <p className="text-xs text-slate-400 mt-0.5">Coin dùng để mở khóa tập phim hoặc trả phí gói Tháng</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                <span className="text-slate-400">Số dư:</span>
                <span className="font-mono font-bold text-amber-400">
                  {(wallet.mainCoin + wallet.bonusCoin).toLocaleString('vi-VN')}
                </span>
                <span className="text-[10px] text-slate-500">Coin</span>
              </div>
            )}
            <button
              type="button"
              aria-label="Đóng"
              onClick={closeDepositModal}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-shake">
            <span>{errorMessage}</span>
            <button type="button" aria-label="Ẩn lỗi" onClick={() => setErrorMessage(null)} className="ml-2 font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Chọn số tiền nạp</p>
          <AmountGrid amounts={amounts} rateVnd={rateVnd} selected={amountVnd} onSelect={setAmountVnd} />
          {rateVnd && (
            <p className="text-[11px] text-slate-500 mt-2">Tỉ giá hiện tại: {rateVnd.toLocaleString('vi-VN')} ₫ = 1 Coin</p>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">2. Phương thức thanh toán trực tuyến</p>
          <MethodPicker selected={provider} onSelect={setProvider} />
        </div>

        {provider === 'VNPAY' && <VnpaySandboxCard />}

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 block">Nhận vào ví (Coin chính):</span>
            <span className="text-xl font-black text-amber-300 font-mono">
              {coins === null ? '…' : `+${coins.toLocaleString('vi-VN')} Coin`}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={closeDepositModal}
              className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={isProcessing || (isAuthenticated && !amounts.includes(amountVnd))}
              className="flex-1 sm:flex-initial py-3 px-8 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2 text-white">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang mở cổng thanh toán...
                </span>
              ) : (
                <span>Thanh Toán {amountVnd.toLocaleString('vi-VN')} ₫ ➔</span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Coin được cộng khi cổng thanh toán xác nhận giao dịch</span>
        </div>
      </div>
    </div>
  );
}
