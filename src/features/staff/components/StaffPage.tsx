'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Coins, Headphones, Megaphone, Users, type LucideIcon } from 'lucide-react';
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
  permission: PermissionKey;
  /** Built in MF-5; shown as a placeholder until then. */
  comingSoon?: boolean;
}

const MODULES: Module[] = [
  { key: 'films', title: 'Theo dõi phim', description: 'Phim đang phát và số tập (chỉ đọc).', icon: BarChart3, permission: PERMISSION.FILM_ANALYTICS_READ },
  { key: 'members', title: 'Thông tin member', description: 'Tài khoản member (chỉ đọc).', icon: Users, permission: PERMISSION.MEMBER_OPS_READ },
  { key: 'billing', title: 'Coin và giao dịch', description: 'Số dư Coin, giao dịch, gói thành viên (chỉ đọc).', icon: Coins, permission: PERMISSION.BILLING_READ, comingSoon: true },
  { key: 'support', title: 'Hỗ trợ khách hàng', description: 'Yêu cầu hỗ trợ do AI Chatbot chuyển sang.', icon: Headphones, permission: PERMISSION.SUPPORT_MANAGE, comingSoon: true },
  { key: 'marketing', title: 'Marketing', description: 'Chiến dịch cho phim sắp và đã phát hành.', icon: Megaphone, permission: PERMISSION.MARKETING_MANAGE, comingSoon: true },
];

const CARD = 'bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10';

/** Staff operations dashboard (MF-5): only the modules this role holds a permission for (BR-21). */
export function StaffPage() {
  const can = useCan();
  const modules = MODULES.filter((m) => can(m.permission));

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vận hành</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Các mục bạn được cấp quyền. Dữ liệu ở đây chỉ để xem, không sửa được.</p>
      </div>

      {modules.length === 0 && <p className={`${CARD} p-5 text-xs text-slate-500 dark:text-slate-400`}>Vai trò của bạn chưa được cấp mục vận hành nào. Liên hệ Admin để được cấp quyền.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modules
          .filter((m) => m.comingSoon)
          .map(({ key, title, description, icon: Icon }) => (
            <div key={key} className={`${CARD} p-4 space-y-1.5`}>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" /> {title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Đang xây dựng (MF-5)</p>
            </div>
          ))}
      </div>

      {can(PERMISSION.FILM_ANALYTICS_READ) && <FilmsSection />}
      {can(PERMISSION.MEMBER_OPS_READ) && <MembersSection />}
    </main>
  );
}

function FilmsSection() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  useEffect(() => {
    void movieService.getMovies().then((res) => setMovies(res.success ? res.data : []));
  }, []);

  return (
    <section className={`${CARD} overflow-hidden`} aria-label="Theo dõi phim">
      <h2 className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5">Theo dõi phim</h2>
      {movies === null && <p className="p-5 text-xs text-slate-500">Đang tải…</p>}
      {movies?.length === 0 && <p className="p-5 text-xs text-slate-500 dark:text-slate-400">Chưa có phim nào phát hành.</p>}
      <ul className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
        {movies?.map((movie) => (
          <li key={movie.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
            <span className="font-medium text-slate-800 dark:text-slate-200">{movie.title}</span>
            <span className="text-slate-500 dark:text-slate-400">
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
    <section className={`${CARD} overflow-hidden`} aria-label="Thông tin member">
      <h2 className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5">
        Thông tin member <span className="text-slate-400 font-normal">({total})</span>
      </h2>
      {members === null && <p className="p-5 text-xs text-slate-500">Đang tải…</p>}
      {members?.length === 0 && <p className="p-5 text-xs text-slate-500 dark:text-slate-400">Chưa có member nào.</p>}
      <ul className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
        {members?.map((member) => (
          <li key={member.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
            <span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{member.fullName}</span>
              <span className="text-slate-500 dark:text-slate-400"> · {member.email}</span>
            </span>
            <span className={member.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {member.isActive ? 'Đang hoạt động' : 'Đã khoá'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
