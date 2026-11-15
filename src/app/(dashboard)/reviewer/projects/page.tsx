import { Suspense } from 'react';
import { ReviewerProjectQueuePage } from '@/features/reviewer/components/ReviewerProjectQueuePage';

export default function ReviewerProjectsPage() {
  // Read from the query string, which needs a Suspense boundary.
  return (
    <Suspense>
      <ReviewerProjectQueuePage />
    </Suspense>
  );
}
