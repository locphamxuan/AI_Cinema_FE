'use client';

import { useParams } from 'next/navigation';
import WatchPlayerSection from '@/components/watch/WatchPlayerSection';

export default function WatchPage() {
  const params = useParams();
  const episodeId = params.id as string;

  return (
    <div className="animate-fade-in">
      <WatchPlayerSection episodeId={episodeId} />
    </div>
  );
}
