import { Suspense } from 'react';
import { Film } from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';
import { PosterWall } from '@/components/auth/PosterWall';
import ThemeToggle from '@/components/theme/ThemeToggle';

/**
 * Sign-in for the internal back office (Reviewer, Creator, Staff, Admin): one card in the middle of a wall of
 * the AI films the platform publishes.
 */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 py-10 text-foreground">
      <PosterWall />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card/95 p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
        <div className="space-y-4 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Film className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">Trang quản trị AI Cinema</p>
          </div>
        </div>
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
