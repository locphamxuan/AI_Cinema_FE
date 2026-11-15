import { Suspense } from 'react';
import { StaffPage } from '@/features/staff/components/StaffPage';

export default function Page() {
  return (
    <Suspense>
      <StaffPage />
    </Suspense>
  );
}
