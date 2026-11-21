'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fieldInputClass } from '@/components/ui/FormField';
import type { KnowledgeArticleStatus, KnowledgeFilters, SupportAudience } from '@/types/support';
import { ARTICLE_STATUS, AUDIENCE, CATEGORY_SUGGESTIONS } from './aiLabels';

const SELECT = `${fieldInputClass} py-1.5 text-xs`;

/** Search (title, slug, category) and the backend filters; the search is sent once typing pauses. */
export function KnowledgeFiltersBar({ value, onChange }: { value: KnowledgeFilters; onChange: (next: KnowledgeFilters) => void }) {
  const [text, setText] = useState(value.search ?? '');

  useEffect(() => {
    if ((value.search ?? '') === text.trim()) return;
    const timer = setTimeout(() => onChange({ ...value, search: text.trim() || undefined }), 350);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tìm theo tiêu đề, slug, danh mục"
          aria-label="Tìm bài tri thức"
          className={`${SELECT} pl-8`}
        />
      </div>
      <select aria-label="Lọc theo danh mục" value={value.category ?? ''} onChange={(e) => onChange({ ...value, category: e.target.value || undefined })} className={SELECT}>
        <option value="">Mọi danh mục</option>
        {CATEGORY_SUGGESTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        aria-label="Lọc theo trạng thái"
        value={value.status ?? ''}
        onChange={(e) => onChange({ ...value, status: (e.target.value || undefined) as KnowledgeArticleStatus | undefined })}
        className={SELECT}
      >
        <option value="">Mọi trạng thái</option>
        {(Object.keys(ARTICLE_STATUS) as KnowledgeArticleStatus[]).map((s) => (
          <option key={s} value={s}>
            {ARTICLE_STATUS[s].label}
          </option>
        ))}
      </select>
      <select
        aria-label="Lọc theo đối tượng"
        value={value.audience ?? ''}
        onChange={(e) => onChange({ ...value, audience: (e.target.value || undefined) as SupportAudience | undefined })}
        className={SELECT}
      >
        <option value="">Mọi đối tượng</option>
        {(Object.keys(AUDIENCE) as SupportAudience[]).map((a) => (
          <option key={a} value={a}>
            {AUDIENCE[a]}
          </option>
        ))}
      </select>
      <label className="flex cursor-pointer items-center gap-2 px-1 text-xs whitespace-nowrap">
        <input
          type="checkbox"
          checked={!!value.failedOnly}
          onChange={(e) => onChange({ ...value, failedOnly: e.target.checked || undefined })}
          className="size-4 accent-primary"
        />
        Chỉ bài lỗi lập chỉ mục
      </label>
    </div>
  );
}
