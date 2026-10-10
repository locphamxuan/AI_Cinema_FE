'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function TopUpGeneralContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'FAILED';
  const provider = searchParams.get('provider') || 'VNPAY';

  const isSuccess = status === 'PAID';

  return (
    <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
      <div className="mb-6 flex justify-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50'
              : 'bg-rose-500/20 text-rose-400 border-rose-400/50'
          }`}
        >
          {isSuccess ? '✓' : '✕'}
        </div>
      </div>

      <h1 className="text-xl font-black mb-2">
        {isSuccess ? 'Nạp Tiền Thành Công!' : 'Giao Dịch Bị Hủy'}
      </h1>
      <p className="text-xs text-slate-400 mb-6">
        {isSuccess
          ? 'Tài khoản của bạn đã được cộng Coin qua cổng thanh toán ' + provider
          : 'Giao dịch nạp Coin qua cổng thanh toán ' + provider + ' đã không hoàn tất.'}
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 text-center"
        >
          Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}

export default function TopUpGeneralReturnPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center text-slate-400 text-sm">
            Đang tải dữ liệu cổng thanh toán...
          </div>
        }
      >
        <TopUpGeneralContent />
      </Suspense>
    </div>
  );
}
