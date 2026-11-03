'use client';

import Link from 'next/link';
import { Coins, Film, Play, PlusCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Movie } from '@/types/movie';

/** Wallet shortcut and the "continue watching" card at the bottom of the member sidebar. */
export default function SidebarFooter({ movie }: { movie: Movie | null }) {
  const { wallet, openDepositModal, closeRightSidebar } = useAppStore();

  return (
    <div className="space-y-3.5 pt-4 mt-4 border-t border-white/10">
      {/* Wallet Quick Action Box */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-purple-950/30 border border-amber-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Ví AI Cinema</span>
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
            <span>+{wallet.bonusCoin} Bonus</span>
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-3 relative z-10">
          <span className="text-2xl font-black text-amber-400 font-mono tracking-tight drop-shadow-sm">
            {wallet.mainCoin.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">Main Coin</span>
        </div>

        <button
          onClick={() => {
            closeRightSidebar();
            openDepositModal();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 relative z-10"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Nạp Coin Ngay</span>
        </button>
      </div>

      {/* Continue Watching Widget */}
      {movie && (
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Film className="w-3 h-3 text-slate-400" />
              <span>Đang Xem Dở</span>
            </p>
            <span className="text-[10px] font-bold text-ruby">Tập 1</span>
          </div>

          <Link
            href={`/watch/${movie.episodes[0]?.id ?? ''}`}
            onClick={closeRightSidebar}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-slate-800 shadow-md">
              <img
                src={movie.bannerUrl || movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to high quality poster if URL fails
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <div className="w-6 h-6 rounded-full bg-white/80 group-hover:bg-ruby text-slate-950 group-hover:text-white flex items-center justify-center shadow-md transition-colors">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
              </div>

              {/* Progress bar overlay at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-black/50">
                <div className="h-full bg-ruby w-3/5" />
              </div>
            </div>

            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate group-hover:text-ruby transition-colors">
                {movie.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-slate-400">45 phút</span>
                <span className="text-[10px] text-slate-600">•</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Đã xem 60%</span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
