'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Home, LayoutGrid, LogOut, RotateCcw } from 'lucide-react';

export interface AccountMenuProps {
  name: string;
  roleLabel: string;
  onResetWorkspace: () => void;
  onLogout: () => void;
  /** Other internal areas this account may enter. */
  links?: { href: string; label: string }[];
}

const ITEM_CLASS =
  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50';

/** Avatar button that opens the few account-level actions, keeping the header itself uncluttered. */
export function AccountMenu({ name, roleLabel, onResetWorkspace, onLogout, links = [] }: AccountMenuProps) {
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
        className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-purple-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#12141A]"
      >
        {name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-xl bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 shadow-lg z-40">
          <div className="px-3 py-2 mb-1 border-b border-slate-100 dark:border-white/5">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{roleLabel}</p>
          </div>
          <Link href="/" role="menuitem" onClick={() => setOpen(false)} className={ITEM_CLASS}>
            <Home className="w-3.5 h-3.5" aria-hidden="true" /> Trang chủ
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onResetWorkspace();
            }}
            className={ITEM_CLASS}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Tải lại dữ liệu
          </button>
          {links.map((link) => (
            <Link key={link.href} href={link.href} role="menuitem" onClick={() => setOpen(false)} className={ITEM_CLASS}>
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" /> {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className={`${ITEM_CLASS} hover:!bg-rose-50 dark:hover:!bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400`}
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
