'use client';

interface QuotaGaugeBarProps {
  usedTokens: number;
  allocatedTokens: number;
  episodeTitle?: string;
  showDetails?: boolean;
}

export default function QuotaGaugeBar({
  usedTokens,
  allocatedTokens,
  episodeTitle,
  showDetails = true,
}: QuotaGaugeBarProps) {
  const percentage = allocatedTokens > 0 ? Math.min(100, Math.round((usedTokens / allocatedTokens) * 100)) : 0;
  const isExceeded = allocatedTokens > 0 && usedTokens >= allocatedTokens;
  const isWarning = percentage >= 80 && !isExceeded;

  const remainingTokens = Math.max(0, allocatedTokens - usedTokens);

  return (
    <div className="w-full bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              isExceeded
                ? 'bg-danger/15 text-danger border border-danger/30'
                : isWarning
                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
            }`}
          >
            AI
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Hạn Ngạch AI Token Quota</span>
              {isExceeded && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-danger/15 text-danger border border-danger/30 animate-pulse">
                  ĐÃ CHẠM GIỚI HẠN
                </span>
              )}
              {isWarning && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  GẦN HẾT TOKEN ({percentage}%)
                </span>
              )}
            </h4>
            {episodeTitle && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{episodeTitle}</p>
            )}
          </div>
        </div>

        {/* Numeric stats */}
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1.5">
            <span
              className={`text-lg sm:text-xl font-black font-mono ${
                isExceeded
                  ? 'text-danger'
                  : isWarning
                  ? 'text-amber-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {usedTokens.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
              / {allocatedTokens.toLocaleString()} Tokens
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Còn lại: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{remainingTokens.toLocaleString()} Tokens</strong>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 relative ${
            isExceeded
              ? 'bg-gradient-to-r from-red-500 to-danger shadow-md shadow-danger/30'
              : isWarning
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/30'
              : 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-md shadow-emerald-500/30'
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-white/25 animate-shimmer" />
        </div>
      </div>

      {/* Warning/Exceeded Lock Message */}
      {isExceeded && (
        <div className="mt-3 p-2.5 rounded-xl bg-danger/10 border border-danger/30 flex items-center gap-2.5 text-xs text-danger font-medium animate-bounce-in">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Đã chạm giới hạn ngân sách được cấp. Các chức năng sinh video/audio AI tạm thời bị khóa.</span>
        </div>
      )}
    </div>
  );
}
