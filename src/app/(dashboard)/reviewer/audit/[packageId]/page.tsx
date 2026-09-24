'use client';

import { useParams } from 'next/navigation';
import { ReviewerAuditPage } from '@/features/workflow/components/reviewer/audit/ReviewerAuditPage';

export default function Page() {
  const params = useParams();
  const packageId = params?.packageId as string;
  return <ReviewerAuditPage packageId={packageId} />;
}
