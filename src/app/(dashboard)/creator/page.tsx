import { Suspense } from 'react';
import { CreatorStudioPortal } from '@/features/production/components/creator/CreatorStudioPortal';

export default function CreatorPage() {
  // Read from the query string, which needs a Suspense boundary.
  return (
    <Suspense>
      <CreatorStudioPortal />
    </Suspense>
  );
}
