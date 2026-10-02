'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { productionService } from '@/services/productionService';
import { useAction } from '../../hooks/useAction';
import { useResource } from '../../hooks/useResource';

export const MAX_GENRES = 5;

/** Toggle chips over the genre catalog; at most MAX_GENRES (BR-12). */
export function GenrePicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const genres = useResource('genres', productionService.listGenres);
  const canAdd = useCan()(PERMISSION.GENRE_MANAGE);
  const [newName, setNewName] = useState('');
  const { busy, run } = useAction();

  if (genres.loading && !genres.data) return <p className="text-xs text-slate-500">Đang tải thể loại…</p>;

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : value.length < MAX_GENRES ? [...value, id] : value);

  const add = async () => {
    const genre = await run(() => productionService.createGenre(newName.trim()));
    if (!genre) return;
    setNewName('');
    await genres.reload();
    if (!value.includes(genre.id) && value.length < MAX_GENRES) onChange([...value, genre.id]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Thể loại">
        {!genres.data?.length && <span className="text-xs text-slate-500">Chưa có thể loại nào.</span>}
        {genres.data?.map((g) => {
          const on = value.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(g.id)}
              disabled={!on && value.length >= MAX_GENRES}
              className={`px-2.5 py-1 rounded-full text-xs border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                on
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-purple-400'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>
      {canAdd && (
        <div className="flex items-center gap-2 max-w-sm">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newName.trim()) void add();
              }
            }}
            placeholder="Thể loại chưa có trong danh sách…"
            aria-label="Tên thể loại mới"
            maxLength={100}
            className={`${fieldInputClass} py-1.5`}
          />
          <Button type="button" size="sm" variant="secondary" disabled={!newName.trim() || busy} onClick={add}>
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Thêm
          </Button>
        </div>
      )}
    </div>
  );
}
