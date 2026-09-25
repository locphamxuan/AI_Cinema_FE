'use client';

import type { Transaction, TransactionType } from '@/types/transaction';

const typeColors: Record<TransactionType, string> = {
  deposit: 'bg-verified/20 text-verified',
  checkin: 'bg-neon/20 text-neon',
  episode_purchase: 'bg-ruby/20 text-ruby',
  subscription: 'bg-coin/20 text-coin',
  refund: 'bg-info/20 text-info',
};

const statusColors: Record<string, string> = {
  success: 'bg-verified/20 text-verified',
  pending: 'bg-warning/20 text-warning',
  failed: 'bg-danger/20 text-danger',
  review: 'bg-warning/20 text-warning',
};

/** Wallet transactions: a table on desktop, cards on mobile. */
export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="glass-card overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.02]">
              <th className="text-left px-4 py-3 text-[10px] text-slate-500 dark:text-muted-light uppercase tracking-wider font-bold">
                Mã GD
              </th>
              <th className="text-left px-4 py-3 text-[10px] text-slate-500 dark:text-muted-light uppercase tracking-wider font-bold">
                Loại
              </th>
              <th className="text-left px-4 py-3 text-[10px] text-slate-500 dark:text-muted-light uppercase tracking-wider font-bold">
                Mô tả
              </th>
              <th className="text-right px-4 py-3 text-[10px] text-slate-500 dark:text-muted-light uppercase tracking-wider font-bold">
                Coin chính
              </th>
              <th className="text-right px-4 py-3 text-[10px] text-slate-500 dark:text-muted-light uppercase tracking-wider font-bold">
                Coin thưởng
              </th>
              <th className="text-center px-4 py-3 text-[10px] text-slate-500 dark:text-muted-light uppercase tracking-wider font-bold">
                Trạng thái
              </th>
              <th className="text-right px-4 py-3 text-[10px] text-slate-500 dark:text-muted-light uppercase tracking-wider font-bold">
                Thời gian
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={tx.id}
                className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                  i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-white/[0.02]'
                }`}
              >
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-600 dark:text-muted-light font-mono font-semibold">{tx.id}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[tx.type]}`}
                  >
                    {tx.typeLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-foreground">{tx.description}</p>
                  {tx.episodeInfo && (
                    <p className="text-[10px] text-slate-500 dark:text-muted mt-0.5">🎬 {tx.episodeInfo}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {tx.mainCoinDelta !== 0 && (
                    <span
                      className={`text-sm font-bold ${
                        tx.mainCoinDelta > 0 ? 'text-verified' : 'text-ruby'
                      }`}
                    >
                      {tx.mainCoinDelta > 0 ? '+' : ''}
                      {tx.mainCoinDelta}
                    </span>
                  )}
                  {tx.mainCoinDelta === 0 && <span className="text-xs text-slate-400 dark:text-muted">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  {tx.bonusCoinDelta !== 0 && (
                    <span
                      className={`text-sm font-bold ${
                        tx.bonusCoinDelta > 0 ? 'text-neon' : 'text-ruby'
                      }`}
                    >
                      {tx.bonusCoinDelta > 0 ? '+' : ''}
                      {tx.bonusCoinDelta}
                    </span>
                  )}
                  {tx.bonusCoinDelta === 0 && <span className="text-xs text-slate-400 dark:text-muted">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[tx.status]}`}
                  >
                    {tx.status === 'success'
                      ? '✅ Thành công'
                      : tx.status === 'review'
                        ? '⚠️ Cần kiểm tra'
                        : tx.status === 'pending'
                          ? '⏳ Đang xử lý'
                          : '❌ Thất bại'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-slate-600 dark:text-muted-light font-medium">
                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <br />
                  <span className="text-[10px] text-slate-400 dark:text-muted">
                    {new Date(tx.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden divide-y divide-slate-200 dark:divide-white/5">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[tx.type]}`}
              >
                {tx.typeLabel}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[tx.status]}`}
              >
                {tx.statusLabel}
              </span>
            </div>
            <p className="text-sm text-foreground">{tx.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                {tx.mainCoinDelta !== 0 && (
                  <span
                    className={`text-xs font-bold ${
                      tx.mainCoinDelta > 0 ? 'text-verified' : 'text-ruby'
                    }`}
                  >
                    🟡 {tx.mainCoinDelta > 0 ? '+' : ''}
                    {tx.mainCoinDelta}
                  </span>
                )}
                {tx.bonusCoinDelta !== 0 && (
                  <span
                    className={`text-xs font-bold ${
                      tx.bonusCoinDelta > 0 ? 'text-neon' : 'text-ruby'
                    }`}
                  >
                    🎁 {tx.bonusCoinDelta > 0 ? '+' : ''}
                    {tx.bonusCoinDelta}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted">
                {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <p className="text-[10px] text-muted font-mono">{tx.id}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-foreground font-medium">Không tìm thấy giao dịch</p>
          <p className="text-muted-light text-sm mt-1">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      )}
    </div>
  );
}
