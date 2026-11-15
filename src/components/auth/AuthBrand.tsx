import { Clapperboard } from 'lucide-react';

/** Internal back-office brand header above the sign-in form. */
export default function AuthBrand() {
  return (
    <div className="mb-7 space-y-3 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#121212] text-white shadow-sm dark:bg-white dark:text-slate-900">
        <Clapperboard className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">AI CINEMA</span>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200">
            Studio Back-Office
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Cổng Quản Trị &amp; Sản Xuất Nội Bộ
        </h1>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Dành cho Admin, Reviewer thẩm định, Biên kịch Creator và Nhân viên vận hành.
        </p>
      </div>
    </div>
  );
}
