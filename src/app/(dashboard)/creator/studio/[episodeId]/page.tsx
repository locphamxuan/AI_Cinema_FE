'use client';

import { useParams } from 'next/navigation';
import { CreatorStudioPage } from '@/features/workflow/components/creator/studio/CreatorStudioPage';

export default function Page() {
  const params = useParams();
  const episodeId = (params?.episodeId as string) || 'pkg-ep-03';
  return <CreatorStudioPage episodeId={episodeId} />;
}
