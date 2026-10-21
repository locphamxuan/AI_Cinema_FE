'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Coins, Headphones, Megaphone, Users, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react';
import { useCan } from '@/hooks/useCan';
import { PERMISSION, type PermissionKey } from '@/lib/permissions';
import { movieService } from '@/services/movieService';
import { adminService, type AccountRow } from '@/services/adminService';
import type { Movie } from '@/types/movie';

interface Module {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  /** None: open to every Staff account (public data). */
  permission?: PermissionKey;
  /** Built in MF-5; shown as a placeholder until then, the backend has no permission for it yet. */
  comingSoon?: boolean;
}

const MODULES: Module[] = [
  {
    key: 'films',
    title: 'Theo dõi phim',
    description: 'Phim đang phát và số tập (chỉ đọc).',
    icon: BarChart3,
    gradient: 'from-purple-600 to-violet-600',
  },
  {
    key: 'members',
    title: 'Thông tin member',
    description: 'Tài khoản member (chỉ đọc).',
    icon: Users,
    gradient: 'from-blue-600 to-cyan-500',
    permission: PERMISSION.MEMBER_OPS_READ,
  },
  {
    key: 'billing',
    title: 'Coin & Giao dịch',
    description: 'Số dư Coin, giao dịch, gói thành viên (chỉ đọc).',
    icon: Coins,
    gradient: 'from-amber-500 to-orange-500',
    comingSoon: true,
  },
  {
    key: 'support',
    title: 'Hỗ trợ khách hàng',
    description: 'Yêu cầu hỗ trợ do AI Chatbot chuyển sang.',
    icon: Headphones,
    gradient: 'from-rose-500 to-pink-600',
    comingSoon: true,
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description: 'Chiến dịch cho phim sắp và đã phát hành.',
    icon: Megaphone,
    gradient: 'from-emerald-500 to-teal-600',
    comingSoon: true,
  },
];

/** Staff operations dashboard (MF-5): only the modules this role holds a permission for (BR-21). */
export function StaffPage() {
  const can = useCan();
  const modules = MODULES.filter((m) => !m.permission || can(m.permission));
  const comingSoon = modules.filter((m) => m.comingSoon);
  const available = modules.filter((m) => !m.comingSoon);

  return (
    <main className="w-full">
      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 24px, white 24px, white 26px)`,
          }}
        />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-32 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Staff</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vận hành</h1>
          <p className="text-white/65 text-sm mt-1">
            Các mục bạn được cấp quyền. Dữ liệu ở đây chỉ để xem, không sửa được.
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {modules.length === 0 && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151822] p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            Vai trò của bạn chưa được cấp mục vận hành nào. Liên hệ Admin để được cấp quyền.
          </div>
        )}

        {/* Available modules summary cards */}
        {available.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map(({ key, title, description, icon: Icon, gradient }) => (
              <div key={key} className="group rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#151822] p-4 hover:shadow-lg transition-shadow duration-200 overflow-hidden relative">
                <div className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${gradient} opacity-10 rounded-full group-hover:opacity-20 transition-opacity`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Sắp ra mắt
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {comingSoon.map(({ key, title, description, icon: Icon, gradient }) => (
                <div key={key} className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-4 bg-slate-50/60 dark:bg-white/[0.02] space-y-2 opacity-70">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} opacity-60 flex items-center justify-center`}>
                    <Icon className="w-4.5 h-4.5 text-white" aria-hidden="true" />
                  </div>
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Đang xây dựng (MF-5)</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <FilmsSection />
        {can(PERMISSION.MEMBER_OPS_READ) && <MembersSection />}
      </div>
    </main>
  );
}

function FilmsSection() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  useEffect(() => {
    void movieService.getMovies().then((res) => setMovies(res.success ? res.data : []));
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#151822] overflow-hidden" aria-label="Theo dõi phim">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Theo dõi phim</h2>
      </div>
      {movies === null && <p className="p-5 text-xs text-slate-500">Đang tải…</p>}
      {movies?.length === 0 && <p className="p-5 text-xs text-slate-500 dark:text-slate-400">Chưa có phim nào phát hành.</p>}
      <ul className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
        {movies?.map((movie) => (
          <li key={movie.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{movie.title}</span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {movie.totalEpisodes} tập · {movie.genre.join(', ') || 'Chưa có thể loại'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MembersSection() {
  const [members, setMembers] = useState<AccountRow[] | null>(null);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    void adminService.listAccounts({ role: 'MEMBER', limit: 50 }).then((res) => {
      setMembers(res.success ? res.data.data : []);
      setTotal(res.success ? res.data.meta.totalItems : 0);
    });
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#151822] overflow-hidden" aria-label="Thông tin member">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Thông tin member{' '}
          <span className="text-slate-400 font-normal">({total})</span>
        </h2>
      </div>
      {members === null && <p className="p-5 text-xs text-slate-500">Đang tải…</p>}
      {members?.length === 0 && <p className="p-5 text-xs text-slate-500 dark:text-slate-400">Chưa có member nào.</p>}
      <ul className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
        {members?.map((member) => (
          <li key={member.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{member.fullName}</span>
              <span className="text-slate-500 dark:text-slate-400"> · {member.email}</span>
            </span>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              member.isActive
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
            }`}>
              {member.isActive ? 'Đang hoạt động' : 'Đã khoá'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
