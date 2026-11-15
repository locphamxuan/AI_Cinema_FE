import { Suspense } from 'react';
import { ConsentPage } from '@/features/oauth/ConsentPage';

export const metadata = { title: 'Cấp quyền cho Studio Web · AI Cinema' };

/** Public route (outside the dashboard): the consent step of Studio Web's OAuth login. */
export default function OAuthAuthorizePage() {
  return (
    <Suspense>
      <ConsentPage />
    </Suspense>
  );
}
