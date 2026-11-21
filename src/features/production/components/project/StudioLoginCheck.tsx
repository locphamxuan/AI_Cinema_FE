'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StudioAccountsModal } from '@/features/studio/components/StudioAccountsModal';
import { useResource } from '@/hooks/useResource';
import { studioService } from '@/services/studioService';
import type { Studio } from '@/types/production';

/**
 * Whether the studio about to receive the contract can open it: it signs on Studio Web, so the backend refuses a
 * studio with no active STUDIO login (STUDIO_HAS_NO_LOGIN). `ready` is null while the accounts load.
 */
export function useStudioLogin(studio: Pick<Studio, 'id'> | null) {
  const accounts = useResource(studio ? `studio-accounts:${studio.id}` : null, () => studioService.accounts(studio!.id));
  const ready = !studio ? null : accounts.data ? accounts.data.some((a) => a.isActive) : null;
  return { ready, reload: accounts.reload };
}

/** Says the studio cannot sign in yet and opens its login accounts right here, so the Admin need not leave. */
export function StudioLoginWarning({ studio, onCreated }: { studio: Studio; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div role="alert" className="flex flex-wrap items-start justify-between gap-3 rounded-lg bg-warning/10 px-3 py-2.5 text-xs text-foreground">
      <p className="min-w-0 flex-1 leading-relaxed">
        <span className="font-semibold">Studio &quot;{studio.name}&quot; chưa có tài khoản đăng nhập Studio Web.</span> Studio ký hợp đồng trên
        Studio Web, nên hệ thống chưa gửi hợp đồng được. Tạo tài khoản rồi gửi email và mật khẩu cho Studio.
      </p>
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <KeyRound className="size-3.5" aria-hidden="true" /> Tạo tài khoản đăng nhập
      </Button>
      {open && (
        <StudioAccountsModal
          studio={studio}
          onClose={() => {
            setOpen(false);
            onCreated();
          }}
        />
      )}
    </div>
  );
}
