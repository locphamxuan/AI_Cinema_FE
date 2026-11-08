import { Suspense } from 'react';
import { ReviewerAuditWorkspace } from '@/features/reviewer/components/ReviewerAuditWorkspace';

export default function ReviewerPage() {
  // Read from the query string, which needs a Suspense boundary.
  return (
    <Suspense>
      <ReviewerAuditWorkspace />
    </Suspense>
  );
}
