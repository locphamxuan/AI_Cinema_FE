'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface AccountMenuProps {
  name: string;
  roleLabel: string;
  onLogout: () => void;
  /** The account's own profile page in the current area. */
  profileHref: string;
}

const ITEM_CLASS =
  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left text-secondary-foreground hover:bg-muted transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50';

/** Avatar button that opens the account actions (profile, sign out), keeping the header itself uncluttered. */
export function AccountMenu({ name, roleLabel, onLogout, profileHref }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Tài khoản ${name}`}
        className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-primary/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-card"
      >
        {name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-xl bg-card border border-border shadow-lg z-40">
          <div className="px-3 py-2 mb-1 border-b border-border">
            <p className="text-xs font-semibold text-foreground truncate">{name}</p>
            <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
          </div>
          <Link href={profileHref} role="menuitem" onClick={() => setOpen(false)} className={ITEM_CLASS}>
            Hồ sơ tài khoản
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className={`${ITEM_CLASS} hover:!bg-rose-50 dark:hover:!bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400`}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
