'use client';

import { useEffect, useState, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { coinTopUpService } from '@/services/coinTopUpService';
import type { CoinTopUp } from '@/types/episodeAccess';
import { walletService } from '@/services/walletService';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

interface ContentProps {
  topUpId: string;
}

function TopUpResultContent({ topUpId }: ContentProps) {
  const searchParams = useSearchParams();
  const queryStatus = searchParams.get('status');
  const provider = searchParams.get('provider') || 'VNPAY';

  const router = useRouter();
  const { setWalletBalance } = useAppStore();

  const [order, setOrder] = useState<CoinTopUp | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchOrder = async () => {
      try {
        const res = await coinTopUpService.getOrder(topUpId);
        if (res.success && res.data) {
          setOrder(res.data);

          // If settled PAID, update wallet balance in store
          if (res.data.status === 'PAID') {
            const balanceRes = await walletService.getBalance();
            if (balanceRes.success && balanceRes.data) {
              setWalletBalance(balanceRes.data.mainCoin, balanceRes.data.bonusCoin);
            }
            setLoading(false);
            return;
          }

          // If still PENDING, poll a few times because IPN might settle in background
          if (res.data.status === 'PENDING' && pollCount < 5) {
            timer = setTimeout(() => {
              setPollCount((prev) => prev + 1);
            }, 2000);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    fetchOrder().catch(() => setLoading(false));

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [topUpId, pollCount, setWalletBalance]);

  const status = order?.status || queryStatus || 'PENDING';
  const isSuccess = status === 'PAID';
  const isFailed = status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED';

  return (
    <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl overflow-hidden text-center">
      {/* Glow ambient background */}
      <div
        className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-30 ${
          isSuccess ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-30 ${
          isSuccess ? 'bg-amber-500' : isFailed ? 'bg-purple-500' : 'bg-blue-500'
        }`}
      />

      {/* Status Icon */}
      <div className="relative mb-6 flex justify-center">
        {loading && status === 'PENDING' ? (
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : isSuccess ? (
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 text-4xl shadow-lg shadow-emerald-500/20 animate-scale-in">
            ✓
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400/50 flex items-center justify-center text-rose-400 text-4xl shadow-lg shadow-rose-500/20 animate-scale-in">
            ✕
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="font-heading text-2xl font-semibold mb-2 tracking-tight">
        {isSuccess
          ? 'Nạp Coin Thành Công!'
          : isFailed
          ? 'Giao Dịch Không Thành Công'
          : 'Đang Xử Lý Giao Dịch...'}
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        {isSuccess
          ? 'Tài khoản của bạn đã được cộng Coin. Bạn có thể mở khóa tập phim yêu thích ngay bây giờ.'
          : isFailed
          ? 'Giao dịch qua cổng thanh toán đã bị hủy hoặc thất bại. Vui lòng thử lại.'
          : 'Hệ thống đang kiểm tra trạng thái từ cổng thanh toán, vui lòng đợi trong giây lát...'}
      </p>

      {/* Details Card */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 mb-6 text-left space-y-3 font-sans text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
          <span className="text-slate-400">Mã đơn hàng:</span>
          <span className="tabular-nums text-slate-200 text-[11px] truncate max-w-[200px]" title={topUpId}>
            {topUpId}
          </span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
          <span className="text-slate-400">Cổng thanh toán:</span>
          <span className="font-bold text-indigo-400">{order?.provider ?? provider}</span>
        </div>

        {order && (
          <>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Số tiền:</span>
              <span className="font-bold text-white text-sm">
                {order.amountVnd.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Coin nhận được:</span>
              <span className="font-black text-amber-400 text-sm flex items-center gap-1">
                <span></span>+{order.coinsGranted} Coin
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Trạng thái:</span>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isFailed
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all text-center"
        >
          Về Trang Chủ & Xem Phim
        </Link>
        <button
          type="button"
          onClick={() => router.back()}
          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
        >
          Quay Lại
        </button>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ topUpId: string }>;
}

export default function TopUpResultPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const topUpId = resolvedParams.topUpId;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center text-slate-400 text-sm">
            Đang tải dữ liệu đơn nạp Coin...
          </div>
        }
      >
        <TopUpResultContent topUpId={topUpId} />
      </Suspense>
    </div>
  );
}
