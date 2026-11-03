export interface QualityLevel {
  /** Index of the rendition in hls.js' level list. */
  index: number;
  height: number;
}

export interface QualitySelectProps {
  levels: QualityLevel[];
  /** Selected level index; -1 lets hls.js pick by bandwidth. */
  value: number;
  onChange: (index: number) => void;
}

/** Rendition picker for the HLS player: "Tự động" plus every height in the master playlist. */
export function QualitySelect({ levels, value, onChange }: QualitySelectProps) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-light">
      <span className="sr-only sm:not-sr-only">Chất lượng</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-ruby/50"
      >
        <option value={-1}>Tự động</option>
        {levels.map((level) => (
          <option key={level.index} value={level.index}>
            {level.height}p
          </option>
        ))}
      </select>
    </label>
  );
}
