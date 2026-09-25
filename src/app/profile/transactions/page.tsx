'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useMemo } from 'react';
import { TransactionType } from '@/types/transaction';
import TransactionList from '@/components/wallet/TransactionList';

const typeFilters: { value: TransactionType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'Tất cả', icon: '📋' },
  { value: 'deposit', label: 'Nạp tiền', icon: '💰' },
  { value: 'checkin', label: 'Điểm danh', icon: '🎁' },
  { value: 'episode_purchase', label: 'Mua tập', icon: '🎬' },
  { value: 'subscription', label: 'Gói dịch vụ', icon: '👑' },
  { value: 'refund', label: 'Hoàn tiền', icon: '🔄' },
];

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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === filter.value
                  ? 'bg-neon/20 text-neon border border-neon/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:text-muted-light dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
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
            className="w-full sm:w-60 bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2 pl-9 text-sm text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-muted outline-none focus:ring-1 focus:ring-neon/50 transition-all font-medium"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted"
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

      <TransactionList transactions={filteredTransactions} />
    </div>
  );
}
