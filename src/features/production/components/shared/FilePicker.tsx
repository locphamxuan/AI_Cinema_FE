'use client';

import { useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatBytes } from '../../lib/format';

/** Chooses one or several files; shows the chosen ones with a remove button. The parent keeps the list. */
export function FilePicker({
  label,
  accept,
  files,
  onChange,
  multiple = true,
  maxFiles = 10,
  hint,
}: {
  label: string;
  accept: string;
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const add = (picked: FileList | null) => {
    if (!picked?.length) return;
    onChange(multiple ? [...files, ...Array.from(picked)].slice(0, maxFiles) : [picked[0]]);
    if (input.current) input.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <input ref={input} type="file" accept={accept} multiple={multiple} className="hidden" aria-label={label} onChange={(e) => add(e.target.files)} />
        <Button type="button" size="sm" variant="secondary" disabled={multiple && files.length >= maxFiles} onClick={() => input.current?.click()}>
          Chọn tệp
        </Button>
      </div>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      {files.length > 0 && (
        <ul className="space-y-1 text-xs">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 dark:bg-white/5 px-2 py-1">
              <span className="min-w-0 truncate">
                {file.name} <span className="text-slate-400">· {formatBytes(file.size)}</span>
              </span>
              <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} aria-label={`Bỏ ${file.name}`} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
