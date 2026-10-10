'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { coinTopUpService } from '@/services/coinTopUpService';

const depositPackages = [
  { id: 'p1', amountVND: 20000, mainCoin: 40, bonusCoin: 5, popular: false },
  { id: 'p2', amountVND: 50000, mainCoin: 100, bonusCoin: 20, popular: false },
  { id: 'p3', amountVND: 100000, mainCoin: 220, bonusCoin: 50, popular: true },
  { id: 'p4', amountVND: 200000, mainCoin: 480, bonusCoin: 120, popular: false },
  { id: 'p5', amountVND: 500000, mainCoin: 1300, bonusCoin: 350, popular: false },
];

const paymentMethods = [
  {
    id: 'VNPAY',
    name: 'Cổng VNPAY (Thẻ ATM / QR / Visa)',
    badge: 'Khuyên Dùng Sandbox',
    icon: '💳',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'MOMO',
    name: 'Ví Điện Tử MoMo',
    badge: 'MoMo QR',
    icon: '📱',
    color: 'from-pink-600 to-rose-700',
  },
];

export default function DepositModal() {
  const { isDepositModalOpen, closeDepositModal, isAuthenticated, openAuthModal } = useAppStore();

  const [selectedPkg, setSelectedPkg] = useState(depositPackages[2]);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isDepositModalOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      closeDepositModal();
      openAuthModal();
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await coinTopUpService.createTopUp(
        selectedMethod.id as 'VNPAY' | 'MOMO',
        selectedPkg.amountVND
      );

      if (res.success && res.data?.payment?.redirectUrl) {
        // Redirect to gateway payment checkout
        window.location.href = res.data.payment.redirectUrl;
      } else {
        setErrorMessage(res.message || 'Không thể tạo đơn nạp Coin. Vui lòng thử lại sau.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra trong quá trình kết nối cổng thanh toán.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 overflow-hidden animate-scale-in text-white">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shadow-inner shadow-amber-500/20">
              🪙
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide text-white">Nạp Coin Vào Ví</h3>
              <p className="text-xs text-slate-400">Mở khóa phim 4K & Đặc quyền VIP Cinema</p>
            </div>
          </div>

          <button
            onClick={closeDepositModal}
            className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-2 font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Packages Selection */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
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
                      ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                      Phổ biến
                    </span>
                  )}
                  <p className="text-sm font-black text-amber-400 flex items-center gap-1">
                    <span>🪙</span> {pkg.mainCoin} Main Coin
                  </p>
                  <p className="text-[11px] font-bold text-purple-300">
                    +{pkg.bonusCoin} Bonus Coin
                  </p>
                  <p className="text-xs font-semibold text-slate-300 mt-1">
                    {pkg.amountVND.toLocaleString('vi-VN')} đ
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Cổng thanh toán trực tuyến:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {paymentMethods.map((m) => {
              const isSelected = selectedMethod.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m)}
                  className={`flex flex-col p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base">{m.icon}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {m.badge}
                    </span>
                  </div>
                  <span className="text-white text-xs">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* VNPay Sandbox Test Credentials Helper Box */}
        {selectedMethod.id === 'VNPAY' && (
          <div className="mb-5 p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <span>ℹ️</span> Thông tin thẻ Test VNPay Sandbox:
              </span>
              <button
                onClick={() => copyToClipboard('9704198526191432198', 'card')}
                className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors cursor-pointer border border-blue-500/40"
              >
                {copiedField === 'card' ? '✓ Đã chép' : 'Chép số thẻ'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-300 font-mono text-[11px]">
              <div>Ngân hàng: <span className="text-white font-bold">NCB</span></div>
              <div>Số thẻ: <span className="text-amber-400 font-bold">9704198526191432198</span></div>
              <div>Tên chủ thẻ: <span className="text-white font-bold">NGUYEN VAN A</span></div>
              <div>Ngày phát hành: <span className="text-white font-bold">07/15</span></div>
              <div className="col-span-2 text-emerald-400">Mã OTP: <span className="font-bold">123456</span></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={closeDepositModal}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang chuyển tới cổng...
              </span>
            ) : (
              <>
                <span>Nạp ngay</span>
                <span className="font-mono">({selectedPkg.amountVND.toLocaleString('vi-VN')} đ)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
