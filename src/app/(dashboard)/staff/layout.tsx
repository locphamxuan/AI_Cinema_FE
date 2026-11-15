import { AreaGuard } from '@/components/auth/AreaGuard';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <AreaGuard area="staff">{children}</AreaGuard>;
}
