import { useState } from 'react';
import { Plus, Tag, X } from 'lucide-react';
import { fieldInputClass } from '@/components/ui/FormField';
import type { ApiGenre } from '@/types/workflow-api';

export interface GenrePickerProps {
  genres: ApiGenre[];
  /** Selected genre ids. */
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Adds a genre the list does not have; resolves to it, or null when it could not be saved. */
  onCreate: (name: string) => Promise<ApiGenre | null>;
}

/** Lowercase without Vietnamese diacritics, so "kinh di" finds "Kinh dị". */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();

/** Pick the project's genres from the system list, or add one the list is missing. */
export function GenrePicker({ genres, selected, onChange, onCreate }: GenrePickerProps) {
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const needle = normalize(query);
  const visible = needle ? genres.filter((g) => normalize(g.name).includes(needle)) : genres;
  const exact = genres.find((g) => normalize(g.name) === needle);
  const canCreate = needle.length > 0 && !exact;

  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id]);

  const handleCreate = async () => {
    if (!canCreate || isCreating) return;
    setIsCreating(true);
    const created = await onCreate(query.trim());
    setIsCreating(false);
    if (!created) return;
    if (!selected.includes(created.id)) onChange([...selected, created.id]);
    setQuery('');
  };

  return (
    <div className="space-y-2.5 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
      <div className="flex items-center justify-between">
        <label htmlFor="genre-search" className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Thể loại phim
        </label>
        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded-full">
          Đã chọn {selected.length} thể loại
        </span>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-white dark:bg-[#0E1118] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-inner">
          {selected.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-600/30"
            >
              {genres.find((g) => g.id === id)?.name ?? id}
              <button
                type="button"
                onClick={() => toggle(id)}
                aria-label="Bỏ thể loại này"
                className="w-3.5 h-3.5 rounded-full hover:bg-purple-600 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="genre-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            if (exact) toggle(exact.id);
            else void handleCreate();
          }}
          placeholder="Tìm hoặc nhập thể loại mới…"
          autoComplete="off"
          className={`${fieldInputClass} py-1.5 text-xs`}
        />
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={!canCreate || isCreating}
          className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-white/15 hover:bg-slate-900 dark:hover:bg-white/20 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" /> {isCreating ? 'Đang thêm…' : 'Thêm mới'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
        {visible.map((genre) => {
          const isSelected = selected.includes(genre.id);
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggle(genre.id)}
              aria-pressed={isSelected}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer font-semibold border ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-white/10 hover:border-purple-600/40 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {isSelected ? `✓ ${genre.name}` : `+ ${genre.name}`}
            </button>
          );
        })}
        {visible.length === 0 && (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Chưa có &quot;{query.trim()}&quot;. Bấm &quot;Thêm mới&quot; để tạo.
          </p>
        )}
      </div>
    </div>
  );
}
