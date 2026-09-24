import { useState } from 'react';
import { Calendar, Minus, Plus } from 'lucide-react';
import { fieldInputClass } from '@/components/ui/FormField';
import { clamp, MAX_EPISODE_MINUTES, MAX_EPISODES_PER_SEASON, MAX_SEASONS, MIN_EPISODES_PER_SEASON } from '@/features/workflow/lib/limits';

export interface SeasonEpisodesEditorProps {
  /** One list per season, holding each episode's target duration in minutes. */
  seasons: number[][];
  onChange: (seasons: number[][]) => void;
}

const QUICK_SEASON_OPTIONS = [1, 2, 3];
const QUICK_EPISODE_OPTIONS = Array.from(
  { length: MAX_EPISODES_PER_SEASON - MIN_EPISODES_PER_SEASON + 1 },
  (_, i) => MIN_EPISODES_PER_SEASON + i
);
const DEFAULT_MINUTES = 30;

const STEP_BUTTON =
  'w-7 h-7 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/15 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
const CHIP = (active: boolean) =>
  `px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
    active ? 'bg-purple-600 text-white font-bold' : 'bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/15'
  }`;

interface NumberFieldProps {
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
  className: string;
  'aria-label'?: string;
}

/**
 * Number input the user can type into freely: the value is kept in range only
 * when typing produced a valid number within it, and snapped into range on blur.
 */
function NumberField({ value, min, max, onCommit, className, ...rest }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));
  // Follow outside changes (steppers, "apply to all") without an effect.
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setDraft(String(value));
  }

  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={draft}
      aria-label={rest['aria-label']}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value !== '' && Number.isInteger(n) && n >= min && n <= max) onCommit(n);
      }}
      onBlur={() => {
        const n = clamp(Number(draft), min, max);
        setDraft(String(n));
        if (n !== value) onCommit(n);
      }}
      className={className}
    />
  );
}

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function Stepper({ label, value, min, max, onChange }: StepperProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label={`Giảm ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={STEP_BUTTON}>
        <Minus className="w-3 h-3" />
      </button>
      <NumberField
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onCommit={onChange}
        className={`${fieldInputClass} w-16 text-center font-bold text-sm py-1`}
      />
      <button type="button" aria-label={`Tăng ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={STEP_BUTTON}>
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

/** Seasons of the project, each with its own episode count and a target duration per episode. */
export function SeasonEpisodesEditor({ seasons, onChange }: SeasonEpisodesEditorProps) {
  const [bulkMinutes, setBulkMinutes] = useState(DEFAULT_MINUTES);
  const totalEpisodes = seasons.reduce((sum, s) => sum + s.length, 0);

  const setSeasonCount = (value: number) => {
    const count = clamp(value, 1, MAX_SEASONS);
    // A new season starts as a copy of the last one.
    const template = seasons.at(-1) ?? Array(MIN_EPISODES_PER_SEASON).fill(DEFAULT_MINUTES);
    onChange(Array.from({ length: count }, (_, i) => seasons[i] ?? [...template]));
  };

  const setEpisodeCount = (seasonIndex: number, value: number) => {
    const count = clamp(value, MIN_EPISODES_PER_SEASON, MAX_EPISODES_PER_SEASON);
    onChange(
      seasons.map((durations, i) =>
        i !== seasonIndex ? durations : Array.from({ length: count }, (_, e) => durations[e] ?? durations.at(-1) ?? DEFAULT_MINUTES)
      )
    );
  };

  const setDuration = (seasonIndex: number, episodeIndex: number, minutes: number) => {
    onChange(
      seasons.map((durations, i) =>
        i !== seasonIndex ? durations : durations.map((d, e) => (e === episodeIndex ? clamp(minutes, 1, MAX_EPISODE_MINUTES) : d))
      )
    );
  };

  const applyToAll = (seasonIndex?: number) =>
    onChange(seasons.map((durations, i) => (seasonIndex === undefined || i === seasonIndex ? durations.map(() => bulkMinutes) : durations)));

  return (
    <div className="space-y-3 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-slate-200/80 dark:border-white/10">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Mùa, số tập và thời lượng từng tập
        </label>
        <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
          {seasons.length} mùa · {totalEpisodes} tập
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block">Số mùa:</span>
          <Stepper label="số mùa" value={seasons.length} min={1} max={MAX_SEASONS} onChange={setSeasonCount} />
          <div className="flex items-center gap-1 pt-0.5">
            {QUICK_SEASON_OPTIONS.map((n) => (
              <button key={n} type="button" onClick={() => setSeasonCount(n)} className={CHIP(seasons.length === n)}>
                {n} mùa
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block">Thời lượng chung (mốc so sánh khi duyệt):</span>
          <div className="flex items-center gap-1.5">
            <NumberField
              value={bulkMinutes}
              min={1}
              max={MAX_EPISODE_MINUTES}
              aria-label="Thời lượng chung (phút)"
              onCommit={setBulkMinutes}
              className={`${fieldInputClass} w-16 text-center py-1`}
            />
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">phút</span>
            <button
              type="button"
              onClick={() => applyToAll()}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/15 transition cursor-pointer"
            >
              Áp dụng cho mọi tập
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {seasons.map((durations, seasonIndex) => (
          <fieldset
            key={seasonIndex}
            className="space-y-2 bg-white dark:bg-[#0E1118] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <legend className="text-xs font-bold text-slate-800 dark:text-zinc-200">Mùa {seasonIndex + 1}</legend>
              <div className="flex flex-wrap items-center gap-2">
                <Stepper
                  label={`số tập mùa ${seasonIndex + 1}`}
                  value={durations.length}
                  min={MIN_EPISODES_PER_SEASON}
                  max={MAX_EPISODES_PER_SEASON}
                  onChange={(n) => setEpisodeCount(seasonIndex, n)}
                />
                <div className="flex items-center gap-1">
                  {QUICK_EPISODE_OPTIONS.map((n) => (
                    <button key={n} type="button" onClick={() => setEpisodeCount(seasonIndex, n)} className={CHIP(durations.length === n)}>
                      {n} tập
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => applyToAll(seasonIndex)}
                  className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Áp dụng {bulkMinutes} phút cho mùa này
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {durations.map((minutes, episodeIndex) => (
                <label
                  key={episodeIndex}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg border border-slate-200/80 dark:border-white/10"
                >
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">Tập {episodeIndex + 1}</span>
                  <span className="flex items-center gap-1">
                    <NumberField
                      value={minutes}
                      min={1}
                      max={MAX_EPISODE_MINUTES}
                      aria-label={`Thời lượng mùa ${seasonIndex + 1} tập ${episodeIndex + 1} (phút)`}
                      onCommit={(n) => setDuration(seasonIndex, episodeIndex, n)}
                      className="w-12 text-center py-0.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                    <span className="text-[10px] text-slate-400">phút</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
