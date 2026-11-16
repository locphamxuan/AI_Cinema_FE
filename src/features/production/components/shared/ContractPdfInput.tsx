'use client';

import { useId } from 'react';
import { contractPdfProblem } from '@/services/contractService';
import { formatBytes } from '@/lib/format';

/**
 * The signed contract PDF the Admin attaches to "sign" or "propose another cost": PDF only, at most 10 MB,
 * checked here before sending (the backend checks again and its refusal is still shown).
 */
export function ContractPdfInput({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const id = useId();
  const problem = file ? contractPdfProblem(file) : null;
  return (
    <div className="space-y-1.5 text-xs">
      <label htmlFor={id} className="font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-xs text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
      />
      {file && !problem && (
        <p className="flex items-center gap-1.5 text-muted-foreground">
          {file.name} · {formatBytes(file.size)}
        </p>
      )}
      {problem && (
        <p role="alert" className="text-destructive">
          {problem}
        </p>
      )}
      {!file && <p className="text-muted-foreground">Bắt buộc: một file PDF đã ký, tối đa 10 MB.</p>}
    </div>
  );
}
