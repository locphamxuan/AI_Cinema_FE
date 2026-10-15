'use client';

import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import type { AgeRating } from '@/types/production';
import { ATTACHMENT_ACCEPT, ATTACHMENT_HINT } from '../../lib/attachments';
import { FilePicker } from './FilePicker';

/** What viewers see of the movie, filled in when the project is created: summary (text + files), age, year. */
export interface ProjectInfoDraft {
  synopsis: string;
  synopsisFiles: File[];
  ideaFiles: File[];
  ageRating: AgeRating | '';
  releaseYear: string;
}

export const emptyProjectInfo = (): ProjectInfoDraft => ({
  synopsis: '',
  synopsisFiles: [],
  ideaFiles: [],
  ageRating: '',
  releaseYear: String(new Date().getFullYear()),
});

export function releaseYearValid(year: string): boolean {
  if (!year) return true;
  const n = Number(year);
  return Number.isInteger(n) && n >= 2000 && n <= 2100;
}

export function ProjectInfoFields({ value, onChange }: { value: ProjectInfoDraft; onChange: (next: ProjectInfoDraft) => void }) {
  const patch = (changes: Partial<ProjectInfoDraft>) => onChange({ ...value, ...changes });
  return (
    <div className="space-y-4">
      <FilePicker
        label="Tệp ý tưởng gửi Studio"
        accept={ATTACHMENT_ACCEPT}
        files={value.ideaFiles}
        onChange={(ideaFiles) => patch({ ideaFiles })}
        hint={`Đi kèm brief khi bàn giao. ${ATTACHMENT_HINT}`}
      />
      <FormField label="Tóm tắt cho người xem">
        <textarea
          rows={3}
          value={value.synopsis}
          onChange={(e) => patch({ synopsis: e.target.value })}
          maxLength={5000}
          placeholder="Hiển thị trên trang phim; có thể bổ sung sau, nhưng bắt buộc trước khi phát hành tập đầu."
          className={fieldTextareaClass}
        />
      </FormField>
      <FilePicker
        label="Tệp tóm tắt cho người xem"
        accept={ATTACHMENT_ACCEPT}
        files={value.synopsisFiles}
        onChange={(synopsisFiles) => patch({ synopsisFiles })}
        hint={ATTACHMENT_HINT}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Độ tuổi">
          <select value={value.ageRating} onChange={(e) => patch({ ageRating: e.target.value as AgeRating | '' })} className={fieldInputClass}>
            <option value="">Chưa đặt</option>
            <option value="T16">T16 — từ 16 tuổi</option>
            <option value="T18">T18 — từ 18 tuổi</option>
          </select>
        </FormField>
        <FormField label="Năm phát hành">
          <input
            type="number"
            min={2000}
            max={2100}
            value={value.releaseYear}
            onChange={(e) => patch({ releaseYear: e.target.value })}
            className={`${fieldInputClass} ${releaseYearValid(value.releaseYear) ? '' : 'border-rose-500'}`}
          />
        </FormField>
      </div>
    </div>
  );
}