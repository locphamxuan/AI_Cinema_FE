import { RoleGuard } from '@/features/workflow/components/shared/RoleGuard';

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="reviewer">{children}</RoleGuard>;
}
