'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { walletService } from '@/services/walletService';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

function VNPayReturnContent() {
  const searchParams = useSearchParams();
  const { setWalletBalance } = useAppStore();

  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef');
  const amountStr = searchParams.get('vnp_Amount');
  const amountVnd = amountStr ? parseInt(amountStr, 10) / 100 : 0;

  const isSuccess = responseCode === '00';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshWallet = async () => {
      if (isSuccess) {
        try {
          const res = await walletService.getBalance();
          if (res.success && res.data) {
            setWalletBalance(res.data.mainCoin, res.data.bonusCoin);
          }
        } catch {
          // Ignore
        }
      }
      setLoading(false);
    };

    refreshWallet();
  }, [isSuccess, setWalletBalance]);

  return (
    <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
      <div className="relative mb-6 flex justify-center">
        {loading ? (
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : isSuccess ? (
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 text-4xl shadow-lg shadow-emerald-500/20">
            ✓
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400/50 flex items-center justify-center text-rose-400 text-4xl shadow-lg shadow-rose-500/20">
            ✕
          </div>
        )}
      </div>

      <h1 className="text-2xl font-black mb-2">
        {isSuccess ? 'Thanh Toán VNPay Thành Công!' : 'Giao Dịch Thất Bại Hoặc Bị Hủy'}
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        {isSuccess
          ? 'Đơn nạp Coin của bạn đã được ghi nhận. Số dư ví đã được cập nhật tự động.'
          : 'Giao dịch qua cổng VNPay Sandbox không thành công. Mã phản hồi: ' + (responseCode || 'N/A')}
      </p>

      {txnRef && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Mã giao dịch:</span>
            <span className="font-mono text-slate-200">{txnRef}</span>
          </div>
          {amountVnd > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Số tiền:</span>
              <span className="font-bold text-white">{amountVnd.toLocaleString('vi-VN')} đ</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Cổng:</span>
            <span className="font-bold text-indigo-400">VNPay Gateway</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 text-center"
        >
          Quay Lại Trang Chủ & Xem Phim
        </Link>
      </div>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center text-slate-400 text-sm">
            Đang tải dữ liệu cổng thanh toán...
          </div>
        }
      >
        <VNPayReturnContent />
      </Suspense>
    </div>
  );
}
