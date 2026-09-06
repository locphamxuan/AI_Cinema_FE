'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useMemo } from 'react';
import { TransactionType } from '@/types/transaction';

const typeFilters: { value: TransactionType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'Tất cả', icon: '📋' },
  { value: 'deposit', label: 'Nạp tiền', icon: '💰' },
  { value: 'checkin', label: 'Điểm danh', icon: '🎁' },
  { value: 'episode_purchase', label: 'Mua tập', icon: '🎬' },
  { value: 'subscription', label: 'Gói dịch vụ', icon: '👑' },
  { value: 'refund', label: 'Hoàn tiền', icon: '🔄' },
];

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

export default function TransactionsPage() {
  const { transactions } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (activeFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.type === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          tx.typeLabel.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [transactions, activeFilter, searchQuery]);

  const totalDeposited = transactions
    .filter((tx) => tx.type === 'deposit' && tx.status === 'success')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const totalSpent = transactions
    .filter(
      (tx) =>
        (tx.type === 'episode_purchase' || tx.type === 'subscription') &&
        tx.status === 'success'
    )
    .reduce((sum, tx) => sum + Math.abs(tx.totalAmount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">📋 Lịch Sử Giao Dịch</h1>
        <p className="text-muted-light text-sm mt-1">
          Theo dõi tất cả giao dịch và dòng tiền trong tài khoản
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card-sm p-4">
          <p className="text-[10px] text-muted-light uppercase tracking-wider">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-foreground mt-1">{transactions.length}</p>
        </div>
        <div className="glass-card-sm p-4">
          <p className="text-[10px] text-muted-light uppercase tracking-wider">Đã nạp</p>
          <p className="text-2xl font-bold text-verified mt-1">+{totalDeposited}</p>
        </div>
        <div className="glass-card-sm p-4">
          <p className="text-[10px] text-muted-light uppercase tracking-wider">Đã chi</p>
          <p className="text-2xl font-bold text-ruby mt-1">-{totalSpent}</p>
        </div>
        <div className="glass-card-sm p-4">
          <p className="text-[10px] text-muted-light uppercase tracking-wider">Cần kiểm tra</p>
          <p className="text-2xl font-bold text-warning mt-1">
            {transactions.filter((tx) => tx.status === 'review').length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type Filter */}
        <div className="flex flex-wrap gap-2 flex-1">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === filter.value
                  ? 'bg-neon/20 text-neon border border-neon/30'
                  : 'bg-white/5 text-muted-light hover:bg-white/10'
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm giao dịch..."
            className="w-full sm:w-60 bg-white/10 rounded-xl px-4 py-2 pl-9 text-sm text-foreground placeholder-muted outline-none focus:ring-1 focus:ring-neon/50 transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-[10px] text-muted-light uppercase tracking-wider font-medium">
                  Mã GD
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-light uppercase tracking-wider font-medium">
                  Loại
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-light uppercase tracking-wider font-medium">
                  Mô tả
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-muted-light uppercase tracking-wider font-medium">
                  Coin chính
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-muted-light uppercase tracking-wider font-medium">
                  Coin thưởng
                </th>
                <th className="text-center px-4 py-3 text-[10px] text-muted-light uppercase tracking-wider font-medium">
                  Trạng thái
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-muted-light uppercase tracking-wider font-medium">
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, i) => (
                <tr
                  key={tx.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-white/[0.02]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-light font-mono">{tx.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[tx.type]}`}
                    >
                      {tx.typeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{tx.description}</p>
                    {tx.episodeInfo && (
                      <p className="text-[10px] text-muted mt-0.5">🎬 {tx.episodeInfo}</p>
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
                    {tx.mainCoinDelta === 0 && <span className="text-xs text-muted">—</span>}
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
                    {tx.bonusCoinDelta === 0 && <span className="text-xs text-muted">—</span>}
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
                    <span className="text-xs text-muted-light">
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <br />
                    <span className="text-[10px] text-muted">
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
        <div className="sm:hidden divide-y divide-white/5">
          {filteredTransactions.map((tx) => (
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
        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-foreground font-medium">Không tìm thấy giao dịch</p>
            <p className="text-muted-light text-sm mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
