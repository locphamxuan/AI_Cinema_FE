import { Captions, Check } from 'lucide-react';
import { SUBTITLE_LANGUAGES } from '@/constants/languages';

export interface SubtitleLanguagePickerProps {
  /** Selected BCP-47 codes; the first one is the language subtitles are written in, the rest are translations. */
  selected: string[];
  onChange: (selected: string[]) => void;
}

/** Languages every episode of the project must ship subtitles in — at least one. */
export function SubtitleLanguagePicker({ selected, onChange }: SubtitleLanguagePickerProps) {
  const toggle = (code: string) => {
    if (!selected.includes(code)) return onChange([...selected, code]);
    if (selected.length > 1) onChange(selected.filter((c) => c !== code));
  };

  return (
    <fieldset className="space-y-2.5 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
      <legend className="sr-only">Ngôn ngữ phụ đề</legend>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Captions className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Ngôn ngữ phụ đề
        </span>
        <span className="text-[11px] text-slate-500 dark:text-zinc-400">Mỗi tập được xuất bản kèm phụ đề các ngôn ngữ này</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SUBTITLE_LANGUAGES.map(({ code, label }) => {
          const isSelected = selected.includes(code);
          const isLastOne = isSelected && selected.length === 1;
          return (
            <button
              key={code}
              type="button"
              aria-pressed={isSelected}
              disabled={isLastOne}
              title={isLastOne ? 'Cần ít nhất một ngôn ngữ phụ đề' : undefined}
              onClick={() => toggle(code)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
                isSelected
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white dark:bg-[#0E1118] border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:border-purple-400'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" aria-hidden />}
              {label}
              <span className={`font-mono text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>{code}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
