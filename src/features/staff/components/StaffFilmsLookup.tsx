'use client';

import { useEffect, useState } from 'react';
import { movieService, type CatalogMovie } from '@/services/movieService';
import { Panel, Empty, Loading } from '@/components/data/ui';

/** Read-only film lookup for Staff: released movies only, no sensitive fields. */
export function StaffFilmsLookup() {
  const [movies, setMovies] = useState<CatalogMovie[] | null>(null);

  useEffect(() => {
    void movieService.getMovies().then((res) => setMovies(res.success ? res.data : []));
  }, []);

  return (
    <Panel title="Phim đang phát" description="Danh sách phim đã phát hành. Chi tiết quản lý do Admin làm ở màn Quản lý phim.">
      {movies === null && <Loading label="Đang tải danh sách phim…" />}
      {movies?.length === 0 && <Empty>Chưa có phim nào phát hành.</Empty>}
      {movies && movies.length > 0 && (
        <ul className="divide-y divide-border text-xs">
          {movies.map((movie) => (
            <li key={movie.id} className="px-6 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-medium text-foreground">{movie.title}</span>
                <p className="text-[11px] text-muted-foreground">
                  {movie.episodeCount} tập · {movie.genres.join(', ') || 'Chưa có thể loại'}
                </p>
              </div>
              <span className="text-muted-foreground text-right">{movie.episodeCount} tập</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
