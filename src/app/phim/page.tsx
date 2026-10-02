import { Suspense } from 'react';
import { BrowseMoviesPage } from '@/components/browse/BrowseMoviesPage';

export default function Page() {
  // The filters are read from the query string, which needs a Suspense boundary.
  return (
    <Suspense>
      <BrowseMoviesPage />
    </Suspense>
  );
}
