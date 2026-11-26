'use client';

import { Modal } from '@/components/ui/Modal';
import { ErrorNote, Loading } from '@/components/data/ui';
import { useResource } from '@/hooks/useResource';
import { formatNumber } from '@/lib/format';
import { billingAdminService } from '@/services/billingAdminService';

/** The Coin balance of one member, read only: a balance changes through payments, rewards and refunds only. */
export function WalletModal({
  userId,
  account,
  onClose,
}: {
  userId: string;
  /** Who the wallet belongs to, shown under the title. */
  account?: { fullName: string; email: string };
  onClose: () => void;
}) {
  const wallet = useResource(`admin:wallet:${userId}`, () => billingAdminService.wallet(userId));
  const w = wallet.data;

  return (
    <Modal open onClose={onClose} title="Ví Coin" subtitle={account ? `${account.fullName} · ${account.email}` : undefined} maxWidth="max-w-md">
      {wallet.error && <ErrorNote message={wallet.error} onRetry={wallet.reload} />}
      {wallet.loading && !w && <Loading />}
      {w && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-border p-3">
            <p className="text-muted-foreground">Coin chính</p>
            <p className="text-lg font-bold tabular-nums">{formatNumber(w.mainBalance)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-muted-foreground">Coin thưởng</p>
            <p className="text-lg font-bold tabular-nums">{formatNumber(w.bonusBalance)}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
