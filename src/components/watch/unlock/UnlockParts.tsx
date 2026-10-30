'use client';

interface CoinBreakdownProps {
  price: number;
  mainBalance: number;
  bonusBalance: number;
  afterLabel: string;
}

/** What paying `price` takes from the wallet: main Coins first, then bonus Coins (BR-27). */
export function CoinBreakdown({ price, mainBalance, bonusBalance, afterLabel }: Readonly<CoinBreakdownProps>) {
  const total = mainBalance + bonusBalance;
  const mainDeduct = Math.min(mainBalance, price);
  const bonusDeduct = Math.min(bonusBalance, price - mainDeduct);

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
      <div className="flex justify-between items-center text-slate-400">
        <span>Số dư ví của bạn:</span>
        <div className="flex gap-2 tabular-nums">
          <span className="text-amber-400">🟡 {mainBalance} Chính</span>
          <span className="text-purple-400">🎁 {bonusBalance} Thưởng</span>
        </div>
      </div>

      {total >= price ? (
        <div className="pt-2 border-t border-slate-800/80 space-y-1 tabular-nums text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span>Trừ Coin chính:</span>
            <span className="text-amber-400 font-bold">-{mainDeduct}</span>
          </div>
          {bonusDeduct > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>Trừ Coin thưởng:</span>
              <span className="text-purple-400 font-bold">-{bonusDeduct}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 border-t border-slate-800/40 text-emerald-400">
            <span>{afterLabel}</span>
            <span>{total - price} Coin</span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <p className="font-bold">⚠️ Số dư không đủ</p>
          <p className="text-[11px] mt-0.5 text-slate-300">
            Bạn đang có <strong className="text-white">{total} Coin</strong>, còn thiếu{' '}
            <strong className="text-rose-400">{price - total} Coin</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

interface ObtainCoinActionsProps {
  onTopUp: () => void;
  onCheckIn: () => void;
}

/** Obtain Coin (SF-B top-up, SF-C check-in), offered when the wallet is short. */
export function ObtainCoinActions({ onTopUp, onCheckIn }: Readonly<ObtainCoinActionsProps>) {
  return (
    <div className="space-y-2 pt-1">
      <p className="text-[11px] font-bold text-slate-400 text-center">Nạp hoặc nhận thêm Coin:</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onTopUp}
          className="py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
        >
          💳 Nạp Coin
        </button>
        <button
          type="button"
          onClick={onCheckIn}
          className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors cursor-pointer"
        >
          🎁 Điểm Danh Nhận Coin
        </button>
      </div>
    </div>
  );
}

interface PayButtonProps {
  label: string;
  busyLabel: string;
  busy: boolean;
  tone: 'amber' | 'purple';
  onClick: () => void;
}

const TONE = {
  amber: 'from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-amber-500/30',
  purple: 'from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30',
};

export function PayButton({ label, busyLabel, busy, tone, onClick }: Readonly<PayButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${TONE[tone]} text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50`}
    >
      {busy ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {busyLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

export interface PaidInfo {
  title: string;
  description: string;
  paidCoins: number;
  chargedMain: number;
  chargedBonus: number;
}

export function PaidNotice({ info }: Readonly<{ info: PaidInfo }>) {
  return (
    <div className="py-8 text-center animate-bounce-in space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20">
        ✓
      </div>
      <div>
        <h3 className="text-xl font-black text-emerald-400">{info.title}</h3>
        <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">{info.description}</p>
      </div>
      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs tabular-nums max-w-xs mx-auto space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400">Đã thanh toán:</span>
          <span className="font-bold text-amber-400">{info.paidCoins} Coin</span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Coin chính: -{info.chargedMain}</span>
          <span>Coin thưởng: -{info.chargedBonus}</span>
        </div>
      </div>
    </div>
  );
}

interface GuestPromptProps {
  onLogin: () => void;
  onRegister: () => void;
}

/** BR-07: an episode past the free starters needs an account. */
export function GuestPrompt({ onLogin, onRegister }: Readonly<GuestPromptProps>) {
  return (
    <div className="py-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-2xl mx-auto">
        👤
      </div>
      <div>
        <h4 className="text-base font-bold text-white">Đăng nhập để xem tiếp</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Bạn đã xem hết các tập miễn phí. Đăng nhập hoặc tạo tài khoản để mở khóa tập này bằng Coin hoặc đăng ký gói Tháng.
        </p>
      </div>
      <div className="flex gap-3 max-w-xs mx-auto pt-2">
        <button
          type="button"
          onClick={onLogin}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          Đăng Nhập
        </button>
        <button
          type="button"
          onClick={onRegister}
          className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          Đăng Ký
        </button>
      </div>
    </div>
  );
}
