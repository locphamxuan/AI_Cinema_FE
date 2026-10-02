'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import AuthBrand from '@/components/auth/AuthBrand';

/** /login, or /login?mode=register to open on the sign-up form. */
function LoginCard() {
  const mode = useSearchParams().get('mode') === 'register' ? 'register' : 'login';
  return (
    <div className="max-w-md w-full bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ruby via-neon to-coin" />
      <AuthBrand />
      <AuthForm key={mode} initialMode={mode} fallbackUrl="/" />
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-muted-light border-t border-slate-200 dark:border-white/10 pt-4">
        <Link href="/" className="text-ruby font-bold hover:underline">
          Về trang Khám Phá
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4 sm:px-6">
      <Suspense>
        <LoginCard />
      </Suspense>
    </div>
  );
}
