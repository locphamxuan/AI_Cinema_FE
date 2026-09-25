'use client';

import { useAppStore } from '@/store/useAppStore';

/** Demo switch between the free tier and VIP. */
export default function VipPassToggle() {
  const { isVIPMode, toggleVIPMode } = useAppStore();

  return (
    <button
      onClick={toggleVIPMode}
      className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
        isVIPMode
          ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-neutral-950 shadow-[0_2px_10px_rgba(245,158,11,0.35)] border border-yellow-100/80 -rotate-1 hover:rotate-0 hover:scale-105 active:scale-95'
          : 'bg-slate-200 text-slate-700 dark:bg-neutral-800/90 dark:text-neutral-400 border border-slate-300 dark:border-neutral-700/80 hover:text-slate-900 dark:hover:text-neutral-200 hover:scale-105 active:scale-95 shadow-sm'
      }`}
      title="Bấm để chuyển đổi trạng thái VIP (Demo)"
    >
      {isVIPMode && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
      )}

      {isVIPMode ? (
        <>
          <svg className="w-3 h-3 fill-neutral-950 shrink-0" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="font-extrabold tracking-widest leading-none">VIP PASS</span>
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-500 group-hover:bg-slate-600 dark:group-hover:bg-neutral-300 transition-colors" />
          <span className="font-semibold tracking-wider leading-none text-[10px]">FREE TIER</span>
        </>
      )}
    </button>
  );
}
