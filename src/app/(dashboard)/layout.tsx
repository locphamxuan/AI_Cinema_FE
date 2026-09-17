import { RoleNavHeader } from '@/features/workflow/components/shared/RoleNavHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0C10] text-slate-900 dark:text-white flex flex-col font-sans transition-colors">
      <RoleNavHeader />
      {children}
    </div>
  );
}
