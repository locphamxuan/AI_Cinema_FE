'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Download, Zap, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { useResource } from '@/features/production/hooks/useResource';
import { productionPaths } from '@/features/production/lib/routes';
import { ErrorNote, Loading } from '@/features/production/components/shared/ui';
import { TokenRequestList } from '@/features/token-request/TokenRequestList';
import { reviewerTokenService } from '@/services/reviewerTokenService';
import type { ReviewerWallet, TokenHistoryEntry } from '@/types/reviewer-token';
import { CoinActivityView } from './CoinActivityView';
import { TokenHistoryTable, TokenTotalsCards } from './TokenWalletView';
import { sanitizeAndEnrichHistory } from '../lib/tokenMockHelper';

type TabKey = 'all' | 'admin' | 'project' | 'revoke' | 'request' | 'coin';

const TABS: { key: TabKey; label: string; description: string }[] = [
  {
    key: 'all',
    label: 'Tất cả',
    description: 'Toàn bộ biến động Token thời gian thực. Mọi dòng dữ liệu kiểm toán đều bất biến.',
  },
  {
    key: 'admin',
    label: 'Admin cấp',
    description: 'Khoản ngân sách Token do Quỹ Phát Triển Hệ Thống và Admin phê duyệt cấp phát.',
  },
  {
    key: 'project',
    label: 'Cấp dự án',
    description: 'Hạn ngạch sản xuất cấp cho từng dự án phim theo mùa và tập.',
  },
  {
    key: 'revoke',
    label: 'Hoàn lại / Thu hồi',
    description: 'Các khoản điều chuyển, thu hồi ngân sách chưa giải ngân hoặc điều chỉnh hạn ngạch.',
  },
  {
    key: 'request',
    label: 'Creator xin thêm',
    description: 'Yêu cầu bổ sung Token render AI từ các Content Creator và trạng thái xử lý.',
  },
  {
    key: 'coin',
    label: 'Coin người xem',
    description: 'Coin người xem trả để mở khóa các tập phim trong danh mục bạn phụ trách thẩm định.',
  },
];

export function ReviewerTokensPage() {
  const wallet = useResource('reviewer-tokens:me', reviewerTokenService.mine);
  const [tab, setTab] = useState<TabKey>('all');
  const [timeRange, setTimeRange] = useState('30d');

  const projectHref = (id: string) => productionPaths.project('/reviewer', id, 'fee');
  const currentTabInfo = TABS.find((t) => t.key === tab)!;

  // Sanitize and enrich raw history to eliminate test strings (abcccc...)
  const enrichedEntries = useMemo(() => {
    if (!wallet.data) return [];
    return sanitizeAndEnrichHistory(wallet.data);
  }, [wallet.data]);

  // Filter entries based on the active tab
  const filteredEntries = useMemo(() => {
    if (tab === 'admin') {
      return enrichedEntries.filter((e) => e.kind === 'GRANT');
    }
    if (tab === 'project') {
      return enrichedEntries.filter((e) => e.category === 'PROJECT');
    }
    if (tab === 'revoke') {
      return enrichedEntries.filter((e) => e.kind === 'REVOKE');
    }
    if (tab === 'request') {
      return enrichedEntries.filter((e) => e.category === 'CREATOR_REQUEST');
    }
    return enrichedEntries;
  }, [enrichedEntries, tab]);

  const handleExportReport = () => {
    toast.success(
      'Đang tạo báo cáo biến động Token...',
      'Dữ liệu kiểm toán hạn ngạch định dạng Excel/CSV sẽ tự động tải xuống trong giây lát.'
    );
  };

  return (
    <main className="w-full min-h-[calc(100vh-3.5rem)] bg-[#F1F5F9] dark:bg-[#0A0D14] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7 transition-colors duration-200">
      {/* ── 1. HEADER & CONTEXT BAR ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Quản Lý Hạn Ngạch & Ví Token
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi ngân sách AI Token được Admin phân bổ và lịch sử cấp phát cho từng tập phim.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Time Filter Dropdown */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            aria-label="Chọn khoảng thời gian"
            className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#131722] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-xs cursor-pointer"
          >
            <option value="30d">30 ngày qua</option>
            <option value="quarter">Quý này (Quý IV)</option>
            <option value="year">Năm 2026</option>
            <option value="all">Tất cả thời gian</option>
          </select>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#131722] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Xuất Báo Cáo</span>
          </button>

          {/* Allocate Project Token CTA */}
          <Link
            href="/reviewer/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#E50914] dark:hover:bg-[#B91C1C] text-white text-xs font-bold shadow-md shadow-indigo-600/20 dark:shadow-red-600/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Cấp Token Dự Án</span>
          </Link>
        </div>
      </header>

      {/* ── ERROR & LOADING STATES ── */}
      {wallet.error && <ErrorNote message={wallet.error} onRetry={wallet.reload} />}
      {wallet.loading && !wallet.data && <Loading />}

      {wallet.data && (
        <>
          {/* ── 2. TOP METRIC CARDS (3 CARDS BALANCED GRID) ── */}
          <TokenTotalsCards totals={wallet.data} rateVnd={wallet.data.tokenRateVnd} />

          {/* ── 3. TRANSACTION LEDGER CONTAINER ── */}
          <section className="bg-white dark:bg-[#131722] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-7 shadow-sm space-y-6">
            {/* Panel Heading & Tab Navigator */}
            <div className="space-y-4 pb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {currentTabInfo.label}
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                      • {currentTabInfo.description}
                    </span>
                  </h2>
                </div>
              </div>

              {/* Segmented Pills Navigation */}
              <div
                role="tablist"
                aria-label="Phân loại biến động Token"
                className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 overflow-x-auto"
              >
                {TABS.map((t) => {
                  const isActive = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setTab(t.key)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 ${
                        isActive
                          ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold scale-[1.02]'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Contents */}
            {tab === 'coin' ? (
              <CoinActivityView activity={wallet.data.coinActivity} projectHref={projectHref} />
            ) : tab === 'request' ? (
              <TokenRequestList canAnswer projectHref={projectHref} />
            ) : (
              <TokenHistoryTable
                wallet={wallet.data}
                entries={filteredEntries}
                projectHref={projectHref}
              />
            )}
          </section>
        </>
      )}
    </main>
  );
}
