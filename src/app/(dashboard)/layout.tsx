import { DashboardHeader } from '@/features/production/components/shell/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader />
      {children}
    </div>
  );
}
