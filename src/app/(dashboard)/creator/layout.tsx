import { AreaGuard } from '@/components/auth/AreaGuard';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <AreaGuard area="creator">{children}</AreaGuard>;
}
