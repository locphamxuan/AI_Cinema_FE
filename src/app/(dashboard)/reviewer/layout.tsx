import { AreaGuard } from '@/components/auth/AreaGuard';

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return <AreaGuard area="reviewer">{children}</AreaGuard>;
}
