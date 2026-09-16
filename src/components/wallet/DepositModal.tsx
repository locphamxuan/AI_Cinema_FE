'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

const depositPackages = [
  { id: 'p1', amountVND: 20000, mainCoin: 40, bonusCoin: 5, popular: false },
  { id: 'p2', amountVND: 50000, mainCoin: 100, bonusCoin: 20, popular: false },
  { id: 'p3', amountVND: 100000, mainCoin: 220, bonusCoin: 50, popular: true },
  { id: 'p4', amountVND: 200000, mainCoin: 480, bonusCoin: 120, popular: false },
  { id: 'p5', amountVND: 500000, mainCoin: 1300, bonusCoin: 350, popular: false },
];

const paymentMethods = [
  { id: 'momo', name: 'Ví MoMo', icon: '📱' },
  { id: 'vietqr', name: 'Chuyển khoản VietQR', icon: '🏦' },
  { id: 'card', name: 'Thẻ Quốc tế (Visa/Master)', icon: '💳' },
  { id: 'zalopay', name: 'Ví ZaloPay', icon: '⚡' },
];

export default function DepositModal() {
  const { isDepositModalOpen, closeDepositModal, depositCoins } = useAppStore();

  const [selectedPkg, setSelectedPkg] = useState(depositPackages[2]);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isDepositModalOpen) return null;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      depositCoins(
        selectedPkg.amountVND,
        selectedPkg.mainCoin,
        selectedPkg.bonusCoin,
        selectedMethod.name
      );
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl p-6 overflow-hidden animate-scale-in">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-lg">
              💰
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Nạp Coin Vào Ví</h3>
              <p className="text-xs text-slate-500 dark:text-muted-light">Mở khóa phim 4K & Đặc quyền VIP Cinema</p>
            </div>
          </div>

          <button
            onClick={closeDepositModal}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-white/70 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Successful Deposit Toast Banner */}
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-bounce-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl font-black shadow-lg">
              ✓
            </div>
            <h4 className="text-xl font-black text-emerald-400">Nạp Coin Thành Công!</h4>
            <p className="text-sm text-slate-300">
              Bạn vừa nhận được <strong className="text-amber-400">+{selectedPkg.mainCoin} Main Coin</strong> và{' '}
              <strong className="text-purple-400">+{selectedPkg.bonusCoin} Bonus Coin</strong>!
            </p>
          </div>
        ) : (
          <>
            {/* Packages Selection */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-muted-light mb-2.5">
                Chọn gói nạp Coin:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {depositPackages.map((pkg) => {
                  const isSelected = selectedPkg.id === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 ring-2 ring-amber-500/40'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-ruby text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                          Hot nhất
                        </span>
                      )}
                      <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {pkg.mainCoin} Main Coin
                      </p>
                      <p className="text-[11px] font-bold text-purple-600 dark:text-purple-300">
                        +{pkg.bonusCoin} Bonus Coin
                      </p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                        {pkg.amountVND.toLocaleString('vi-VN')} đ
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-muted-light mb-2.5">
                Phương thức thanh toán:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((m) => {
                  const isSelected = selectedMethod.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-ruby bg-ruby/10 text-ruby dark:text-white ring-1 ring-ruby/40'
                          : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base">{m.icon}</span>
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                onClick={closeDepositModal}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Đang xử lý thanh toán...</span>
                ) : (
                  <>
                    <span>Thanh toán</span>
                    <span className="font-mono">({selectedPkg.amountVND.toLocaleString('vi-VN')} đ)</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
