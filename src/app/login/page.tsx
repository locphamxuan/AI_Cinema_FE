import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import AuthBrand from '@/components/auth/AuthBrand';
import ThemeToggle from '@/components/theme/ThemeToggle';

/**
 * Sign-in for the internal back office (Reviewer, Creator, Staff, Admin), after the two-column login of
 * arhamkhnz/next-shadcn-admin-dashboard: the form on the left, the brand panel on the right from lg up.
 */
export default function LoginPage() {
  return (
    <main className="grid min-h-dvh bg-background p-2 text-foreground lg:grid-cols-2">
      <AuthBrand />
      <div className="relative order-1 flex min-h-[calc(100dvh-1rem)] items-center justify-center px-4 py-10">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">Tài khoản nội bộ do Admin cấp.</p>
          </div>
          <Suspense>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
