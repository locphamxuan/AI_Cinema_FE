import { Suspense } from 'react';
import { AdminPage } from '@/features/admin/components/AdminPage';

export default function Page() {
  // The open tab is read from ?tab=, which needs a Suspense boundary.
  return (
    <Suspense>
      <AdminPage />
    </Suspense>
  );
}
