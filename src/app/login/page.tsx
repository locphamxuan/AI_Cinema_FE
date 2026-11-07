import AuthForm from '@/components/auth/AuthForm';
import AuthBrand from '@/components/auth/AuthBrand';

/** Sign-in for the back office: Reviewer, Creator, Staff and Admin accounts, created by the Admin. */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 relative bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-background dark:via-[#0A0C12] dark:to-background">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-ruby/10 dark:bg-ruby/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-md w-full bg-white dark:bg-card border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Top subtle ambient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-rose-500 to-amber-500" />
        <AuthBrand />
        <AuthForm />
      </div>
    </div>
  );
}
