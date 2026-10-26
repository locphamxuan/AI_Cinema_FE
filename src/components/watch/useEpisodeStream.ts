import { useEffect, useState } from 'react';
import { episodeAccessService } from '@/services/episodeAccessService';

interface EpisodeStream {
  /** The BE granted access to this caller: free starter, plan or purchase (MF-2). */
  accessGranted: boolean;
}

const NONE: EpisodeStream = { accessGranted: false };

/**
 * Asks the BE whether the episode can be watched (MF-2); the stream itself comes from the playback
 * session. `unlocked` re-asks once the unlock modal reports a purchase or plan.
 */
export function useEpisodeStream(episodeId: string | undefined, unlocked: boolean): EpisodeStream {
  const [result, setResult] = useState<{ episodeId: string; stream: EpisodeStream } | null>(null);

  useEffect(() => {
    if (!episodeId) return;
    let cancelled = false;
    episodeAccessService.checkAccess(episodeId).then((res) => {
      if (cancelled) return;
      const stream = res.success && res.data ? { accessGranted: res.data.accessGranted } : NONE;
      setResult({ episodeId, stream });
    });
    return () => {
      cancelled = true;
    };
  }, [episodeId, unlocked]);

  return result && result.episodeId === episodeId ? result.stream : NONE;
}
