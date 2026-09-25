import { AreaGuard } from '@/components/auth/AreaGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AreaGuard area="admin">{children}</AreaGuard>;
}
