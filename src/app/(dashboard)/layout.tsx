import { DashboardHeader } from '@/features/production/components/shell/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background text-foreground">
      {/* The projector beam: a soft violet-to-amber glow over the top of every back-office page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_80%_at_70%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%),radial-gradient(40%_60%_at_95%_0%,color-mix(in_oklab,var(--highlight)_14%,transparent),transparent_70%)]"
      />
      <DashboardHeader />
      {children}
    </div>
  );
}
