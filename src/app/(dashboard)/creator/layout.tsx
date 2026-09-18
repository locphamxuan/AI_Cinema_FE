import { RoleGuard } from '@/features/workflow/components/shared/RoleGuard';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="creator">{children}</RoleGuard>;
}
