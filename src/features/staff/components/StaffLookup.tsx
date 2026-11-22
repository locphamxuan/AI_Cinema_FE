'use client';

import { useState } from 'react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { Film, Users, Wallet, Coins } from 'lucide-react';
import { StaffFilmsLookup } from './StaffFilmsLookup';
import { StaffMembersLookup } from './StaffMembersLookup';
import { StaffSubscriptionsLookup } from './StaffSubscriptionsLookup';
import { StaffCoinLedgerLookup } from './StaffCoinLedgerLookup';

type LookupTab = 'films' | 'members' | 'subscriptions' | 'coin';

const TABS: { key: LookupTab; label: string; icon: React.ElementType }[] = [
  { key: 'films', label: 'Phim', icon: Film },
  { key: 'members', label: 'Member', icon: Users },
  { key: 'subscriptions', label: 'Gói thành viên', icon: Wallet },
  { key: 'coin', label: 'Giao dịch Coin', icon: Coins },
];

/** Staff read-only lookups: a slim sub-sidebar on the left, one read-only panel per tab. */
export function StaffLookup() {
  const can = useCan();
  const [tab, setTab] = useState<LookupTab>('films');

  const tabs = TABS.filter((t) => {
    if (t.key === 'members') return can(PERMISSION.MEMBER_OPS_READ);
    if (t.key === 'subscriptions') return can(PERMISSION.BILLING_SUBSCRIPTION_READ);
    if (t.key === 'coin') return can(PERMISSION.COIN_TRANSACTION_READ);
    return true;
  });
  if (!tabs.includes(tabs.find((t) => t.key === tab)!)) {
    setTab(tabs[0]?.key ?? 'films');
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Slim left sub-sidebar: one small entry per lookup panel. */}
        <nav className="lg:w-64 shrink-0 flex flex-col gap-1.5 rounded-xl bg-card ring-1 ring-foreground/10 p-3">
          <h2 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tra cứu
          </h2>
          <div className="flex flex-col gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  tab === t.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                aria-pressed={tab === t.key}
              >
                <t.icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <main className="flex-1 min-w-0 space-y-5">
          {tab === 'films' && <StaffFilmsLookup />}
          {tab === 'members' && <StaffMembersLookup />}
          {tab === 'subscriptions' && can(PERMISSION.BILLING_SUBSCRIPTION_READ) && <StaffSubscriptionsLookup />}
          {tab === 'coin' && can(PERMISSION.COIN_TRANSACTION_READ) && <StaffCoinLedgerLookup />}
        </main>
      </div>
    </div>
  );
}
