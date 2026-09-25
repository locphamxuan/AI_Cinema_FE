import { Minus, Plus, Trash2 } from 'lucide-react';
import { NumberField } from '@/features/workflow/components/shared/NumberField';
import { clamp, MAX_EPISODE_MINUTES, MAX_EPISODES_PER_SEASON, MAX_SEASONS, MIN_EPISODES_PER_SEASON } from '@/features/workflow/lib/limits';

export interface SeasonEpisodesEditorProps {
  /** One list per season, holding each episode's target duration in minutes. */
  seasons: number[][];
  onChange: (seasons: number[][]) => void;
}

const DEFAULT_MINUTES = 30;
const STEP_BUTTON =
  'w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);

/** Seasons of the project, each with its own episode count and a duration typed per episode. */
export function SeasonEpisodesEditor({ seasons, onChange }: SeasonEpisodesEditorProps) {
  const totalEpisodes = seasons.reduce((total, s) => total + s.length, 0);
  const totalMinutes = sum(seasons.flat());

  // A new season starts as a copy of the last one.
  const addSeason = () => onChange([...seasons, [...(seasons.at(-1) ?? Array(MIN_EPISODES_PER_SEASON).fill(DEFAULT_MINUTES))]]);
  const removeSeason = (seasonIndex: number) => onChange(seasons.filter((_, i) => i !== seasonIndex));

  const setEpisodeCount = (seasonIndex: number, count: number) =>
    onChange(
      seasons.map((durations, i) =>
        i !== seasonIndex ? durations : Array.from({ length: count }, (_, e) => durations[e] ?? durations.at(-1) ?? DEFAULT_MINUTES)
      )
    );

  const setDuration = (seasonIndex: number, episodeIndex: number, minutes: number) =>
    onChange(
      seasons.map((durations, i) =>
        i !== seasonIndex ? durations : durations.map((d, e) => (e === episodeIndex ? clamp(minutes, 1, MAX_EPISODE_MINUTES) : d))
      )
    );

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
          Mỗi mùa {MIN_EPISODES_PER_SEASON}–{MAX_EPISODES_PER_SEASON} tập, mỗi tập tối đa {MAX_EPISODE_MINUTES} phút. Creator sẽ lên kế hoạch
          theo thời lượng bạn giao cho từng tập.
        </p>
        <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md">
          {seasons.length} mùa · {totalEpisodes} tập · {totalMinutes} phút
        </span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {seasons.map((durations, seasonIndex) => (
          <fieldset
            key={seasonIndex}
            className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1118] space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <legend className="text-xs font-bold text-slate-800 dark:text-zinc-100">Mùa {seasonIndex + 1}</legend>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">{sum(durations)} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1" role="group" aria-label={`Số tập mùa ${seasonIndex + 1}`}>
                  <button
                    type="button"
                    aria-label={`Bớt 1 tập ở mùa ${seasonIndex + 1}`}
                    disabled={durations.length <= MIN_EPISODES_PER_SEASON}
                    onClick={() => setEpisodeCount(seasonIndex, durations.length - 1)}
                    className={STEP_BUTTON}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <NumberField
                    value={durations.length}
                    min={MIN_EPISODES_PER_SEASON}
                    max={MAX_EPISODES_PER_SEASON}
                    aria-label={`Số tập mùa ${seasonIndex + 1}`}
                    onCommit={(n) => setEpisodeCount(seasonIndex, n)}
                    className="w-12 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-center text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    aria-label={`Thêm 1 tập ở mùa ${seasonIndex + 1}`}
                    disabled={durations.length >= MAX_EPISODES_PER_SEASON}
                    onClick={() => setEpisodeCount(seasonIndex, durations.length + 1)}
                    className={STEP_BUTTON}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 ml-0.5">tập</span>
                </div>
                {seasons.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Xoá mùa ${seasonIndex + 1}`}
                    onClick={() => removeSeason(seasonIndex)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {durations.map((minutes, episodeIndex) => (
                <label
                  key={episodeIndex}
                  className="flex flex-col gap-1 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 focus-within:border-purple-500"
                >
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">Tập {episodeIndex + 1}</span>
                  <span className="flex items-baseline gap-1">
                    <NumberField
                      value={minutes}
                      min={1}
                      max={MAX_EPISODE_MINUTES}
                      aria-label={`Thời lượng mùa ${seasonIndex + 1} tập ${episodeIndex + 1} (phút)`}
                      onCommit={(n) => setDuration(seasonIndex, episodeIndex, n)}
                      className="w-full min-w-0 bg-transparent text-sm font-mono font-bold text-slate-800 dark:text-white focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">phút</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {seasons.length < MAX_SEASONS && (
        <button
          type="button"
          onClick={addSeason}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-white/15 text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm mùa {seasons.length + 1}
        </button>
      )}
    </div>
  );
}
