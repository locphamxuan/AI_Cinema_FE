'use client';

import { useEffect, useState } from 'react';
import { fieldInputClass } from '@/components/ui/FormField';
import type { KnowledgeFilters } from '@/types/support';
import { TOPICS } from './aiLabels';

const SELECT = `${fieldInputClass} py-1.5 text-xs`;

/** The plain-word states an Admin filters by, mapped to the backend filters. */
const STATE_FILTERS: { key: string; label: string; filters: KnowledgeFilters }[] = [
  { key: '', label: 'Mọi tình trạng', filters: {} },
  { key: 'PUBLISHED', label: 'Đang dùng', filters: { status: 'PUBLISHED' } },
  { key: 'DRAFT', label: 'Bản nháp', filters: { status: 'DRAFT' } },
  { key: 'ARCHIVED', label: 'Tạm ẩn', filters: { status: 'ARCHIVED' } },
  { key: 'FAILED', label: 'AI chưa đọc được', filters: { failedOnly: true } },
];

const stateKeyOf = (f: KnowledgeFilters) => (f.failedOnly ? 'FAILED' : (f.status ?? ''));

/** Search by title, topic and state; the search is sent once typing pauses. */
export function KnowledgeFiltersBar({ value, onChange }: { value: KnowledgeFilters; onChange: (next: KnowledgeFilters) => void }) {
  const [text, setText] = useState(value.search ?? '');

  useEffect(() => {
    if ((value.search ?? '') === text.trim()) return;
    const timer = setTimeout(() => onChange({ ...value, search: text.trim() || undefined }), 350);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  const changeState = (key: string) => {
    const picked = STATE_FILTERS.find((s) => s.key === key) ?? STATE_FILTERS[0];
    onChange({ search: value.search, category: value.category, ...picked.filters });
  };

  return (
    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr]">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tìm theo tiêu đề" aria-label="Tìm bài kiến thức" className={SELECT} />
      <select aria-label="Lọc theo chủ đề" value={value.category ?? ''} onChange={(e) => onChange({ ...value, category: e.target.value || undefined })} className={SELECT}>
        <option value="">Mọi chủ đề</option>
        {TOPICS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select aria-label="Lọc theo tình trạng" value={stateKeyOf(value)} onChange={(e) => changeState(e.target.value)} className={SELECT}>
        {STATE_FILTERS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
