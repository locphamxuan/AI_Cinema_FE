import { useEffect, useState } from 'react';
import { episodeAccessService } from '@/services/episodeAccessService';

interface EpisodeStream {
  /** The BE granted access to this caller: free starter, plan or purchase (MF-2). */
  accessGranted: boolean;
  streamUrl?: string;
}

const NONE: EpisodeStream = { accessGranted: false };

/**
 * Asks the BE whether the episode can be watched and, if so, which stream to play. The catalog never
 * carries the stream; `unlocked` re-asks once the unlock modal reports a purchase or plan.
 */
export function useEpisodeStream(episodeId: string | undefined, unlocked: boolean): EpisodeStream {
  const [result, setResult] = useState<{ episodeId: string; stream: EpisodeStream } | null>(null);

  useEffect(() => {
    if (!episodeId) return;
    let cancelled = false;
    episodeAccessService.checkAccess(episodeId).then((res) => {
      if (cancelled) return;
      const stream = res.success && res.data ? { accessGranted: res.data.accessGranted, streamUrl: res.data.streamUrl } : NONE;
      setResult({ episodeId, stream });
    });
    return () => {
      cancelled = true;
    };
  }, [episodeId, unlocked]);

  return result && result.episodeId === episodeId ? result.stream : NONE;
}
