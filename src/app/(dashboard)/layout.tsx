export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-sidebar text-foreground">{children}</div>;
}
