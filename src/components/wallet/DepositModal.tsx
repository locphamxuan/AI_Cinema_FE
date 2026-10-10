'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { coinTopUpService } from '@/services/coinTopUpService';
import { Sparkles, ShieldCheck, Check, Copy, CreditCard, Smartphone, X } from 'lucide-react';

const depositPackages = [
  { id: 'p1', amountVND: 20000, mainCoin: 40, bonusCoin: 5, popular: false, tag: null },
  { id: 'p2', amountVND: 50000, mainCoin: 100, bonusCoin: 20, popular: false, tag: '+20% Thưởng' },
  { id: 'p3', amountVND: 100000, mainCoin: 220, bonusCoin: 50, popular: true, tag: 'Bán chạy nhất' },
  { id: 'p4', amountVND: 200000, mainCoin: 480, bonusCoin: 120, popular: false, tag: '+25% Thưởng' },
  { id: 'p5', amountVND: 500000, mainCoin: 1300, bonusCoin: 350, popular: false, tag: '+27% Thưởng' },
  { id: 'p6', amountVND: 1000000, mainCoin: 2800, bonusCoin: 800, popular: false, tag: 'VIP Master' },
];

const paymentMethods = [
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

export default function DepositModal() {
  const { isDepositModalOpen, closeDepositModal, isAuthenticated, openAuthModal, wallet } = useAppStore();

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
      openAuthModal('login');
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

  const totalCoins = selectedPkg.mainCoin + selectedPkg.bonusCoin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#141824] to-[#0D1017] border border-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-5 sm:p-7 overflow-hidden text-white my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-xs" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/20">
              <div className="w-full h-full rounded-2xl bg-[#141824] flex items-center justify-center text-2xl">
                🪙
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight text-white">Nạp Coin Vào Ví</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Cinema VIP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mở khóa phim 4K Ultra HD & nhận đặc quyền thành viên VIP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Current Balance Display */}
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
              onClick={closeDepositModal}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-shake">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-2 font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Package Grid (Symmetric 3x2 on desktop, 2x3 on mobile) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>1.</span> Chọn gói nạp ưu đãi
            </label>
            <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tặng thêm đến 30% Coin thưởng
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {depositPackages.map((pkg) => {
              const isSelected = selectedPkg.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent shadow-lg shadow-amber-500/15 ring-1 ring-amber-400'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                >
                  {/* Tag / Badge */}
                  {pkg.popular ? (
                    <span className="absolute -top-2.5 right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                      Hot Nhất
                    </span>
                  ) : pkg.tag ? (
                    <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[9px] font-bold">
                      {pkg.tag}
                    </span>
                  ) : null}

                  {/* Top: Main Coins */}
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🪙</span>
                        <span className="text-base sm:text-lg font-black text-amber-300 tracking-tight">
                          {pkg.mainCoin}
                        </span>
                        <span className="text-[11px] font-bold text-amber-400/80">Main</span>
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Middle: Bonus Coin */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25 text-[10px] font-bold mb-2">
                      <span>🎁</span>
                      <span>+{pkg.bonusCoin} Bonus Coin</span>
                    </div>
                  </div>

                  {/* Bottom: VND Price */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      {pkg.amountVND.toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {Math.round((pkg.mainCoin + pkg.bonusCoin) / (pkg.amountVND / 1000))}x giá trị
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Gateways Selection */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            <span>2.</span> Phương thức thanh toán trực tuyến
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {paymentMethods.map((m) => {
              const isSelected = selectedMethod.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-500/15 ring-1 ring-indigo-400/80 shadow-md shadow-indigo-500/10'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-indigo-500/20 border border-indigo-400/40' : 'bg-white/5 border border-white/10'
                  }`}>
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">{m.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${m.badgeColor}`}>
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{m.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* VNPay Sandbox Virtual Test Card Helper */}
        {selectedMethod.id === 'VNPAY' && (
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-blue-950/40 border border-indigo-500/30 p-3.5 sm:p-4 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-indigo-500/20">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <span className="text-sm">💳</span>
                <span>Thẻ Thanh Toán Test Sandbox (Ngân hàng NCB)</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('9704198526191432198', 'card')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 border border-indigo-500/40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'card' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép số thẻ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép số thẻ</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Ngân hàng:</span>
                <span className="font-bold text-white text-xs">NCB</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px]">Số thẻ:</span>
                <span className="font-bold text-amber-400 text-xs tracking-wider">
                  9704 1985 2619 1432
                </span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Tên chủ thẻ:</span>
                <span className="font-bold text-white text-xs">NGUYEN VAN A</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Phát hành / OTP:</span>
                <span className="font-bold text-emerald-400 text-xs">07/15 • 123456</span>
              </div>
            </div>
          </div>
        )}

        {/* Summary & Confirm Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 block">Tổng nhận vào ví:</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-amber-300 font-mono">
                +{totalCoins.toLocaleString('vi-VN')} Coins
              </span>
              <span className="text-[11px] text-slate-400">
                ({selectedPkg.mainCoin} Main + {selectedPkg.bonusCoin} Bonus)
              </span>
            </div>
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
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial py-3 px-8 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2 text-white">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang mở cổng thanh toán...
                </span>
              ) : (
                <>
                  <span>Thanh Toán {selectedPkg.amountVND.toLocaleString('vi-VN')} ₫</span>
                  <span>➔</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Trust Footnote */}
        <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Mã hóa bảo mật 256-bit • Tự động cộng Coin vào tài khoản ngay sau khi thanh toán</span>
        </div>
      </div>
    </div>
  );
}
