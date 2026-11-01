'use client';

import { useAppStore } from '@/store/useAppStore';

const BUTTON =
  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/30 text-xs font-bold transition shadow-sm cursor-pointer';

/**
 * Header entries of the member's rewards: the reward wheel is always reachable (it shows how many spins
 * are left, even none); `withCheckIn` adds the daily check-in where the header has no wallet capsule.
 */
export default function RewardShortcuts({ withCheckIn = false, light = false }: { withCheckIn?: boolean; light?: boolean }) {
  const { availableSpins, checkInStreak, openRewardSpinModal, setCheckInModalOpen } = useAppStore();
  const text = light ? 'text-slate-900 dark:text-white' : 'text-white';

  return (
    <div className="flex items-center gap-1.5">
      {withCheckIn && (
        <button
          type="button"
          onClick={() => setCheckInModalOpen(true)}
          className={BUTTON}
          title="Điểm danh nhận Coin thưởng mỗi ngày"
        >
          <span className={`hidden md:inline ${text}`}>Điểm danh</span>
          {!checkInStreak.todayClaimed && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-purple-500 ring-2 ring-white dark:ring-background" />
          )}
        </button>
      )}
      <button
        type="button"
        onClick={openRewardSpinModal}
        className={BUTTON}
        title={`Vòng quay may mắn • Bạn còn ${availableSpins} lượt`}
      >
        <span className={`hidden md:inline ${text}`}>Vòng quay</span>
        <span
          aria-label={`Còn ${availableSpins} lượt quay`}
          className={`min-w-5 px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none text-center ${
            availableSpins > 0 ? 'bg-highlight text-highlight-foreground' : light ? 'bg-muted text-muted-foreground' : 'bg-white/15 text-slate-300'
          }`}
        >
          {availableSpins}
        </span>
      </button>
    </div>
  );
}
