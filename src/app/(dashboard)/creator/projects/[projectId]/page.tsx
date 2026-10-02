import { Suspense } from 'react';
import { ProjectDetailPage } from '@/features/production/components/project/ProjectDetailPage';

export default function Page() {
  // The open tab is read from ?tab=, which needs a Suspense boundary.
  return (
    <Suspense>
      <ProjectDetailPage />
    </Suspense>
  );
}
