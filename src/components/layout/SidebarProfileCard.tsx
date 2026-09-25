'use client';

import { Crown, User } from 'lucide-react';
import type { UserProfile } from '@/store/slices/types';

/** Avatar, name and plan badge at the top of the member sidebar. */
export default function SidebarProfileCard({ user, isVIPMode }: { user: UserProfile; isVIPMode: boolean }) {
  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 relative overflow-hidden shadow-xl backdrop-blur-xl group">
      {/* Subtle ambient glow in background */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-ruby/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="relative shrink-0">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-ruby via-purple-500 to-amber-400 shadow-md">
            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover bg-slate-900" />
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 shadow-xs" />
        </div>

        <div className="overflow-hidden flex-1">
          <p className="text-sm font-black text-white truncate group-hover:text-ruby-light transition-colors">
            {user.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">{user.email || 'user@aicinema.vn'}</p>

          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                isVIPMode
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-white/10 text-slate-300 border-white/15'
              }`}
            >
              {isVIPMode ? (
                <>
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>VIP PASS</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-slate-400" />
                  <span>FREE TIER</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
