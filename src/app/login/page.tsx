import AuthForm from '@/components/auth/AuthForm';
import AuthBrand from '@/components/auth/AuthBrand';
import ThemeToggle from '@/components/theme/ThemeToggle';

/** Sign-in for the internal back office: Reviewer, Creator, Staff and Admin accounts. */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4 py-12 text-slate-900 dark:bg-[#090B10] dark:text-slate-100 sm:px-6">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-white/[0.08] dark:bg-[#111420] sm:p-9">
        <AuthBrand />
        <AuthForm />
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-500 dark:text-slate-400">
        Tài khoản nội bộ do Admin cấp · Mọi thao tác tuân thủ quy trình sản xuất MF-1 &amp; Điều 44
      </p>
    </main>
  );
}
