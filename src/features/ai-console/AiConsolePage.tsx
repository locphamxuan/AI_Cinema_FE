'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/data/PageHeader';
import { AiHealthCard } from './AiHealthCard';
import { KnowledgeTab, type KnowledgeFocus } from './KnowledgeTab';
import { PlaygroundTab } from './PlaygroundTab';
import { AnswersTab } from './AnswersTab';

const TABS = [
  { key: 'knowledge', label: 'Bài kiến thức', hint: 'Nội dung AI đọc để trả lời Member: thêm, sửa, tạm ẩn hoặc xoá bài.' },
  { key: 'playground', label: 'Hỏi thử AI', hint: 'Tự hỏi AI một câu để xem AI trả lời ra sao trước khi Member hỏi.' },
  { key: 'answers', label: 'Câu trả lời của AI', hint: 'Xem AI đã trả lời Member những gì và đánh dấu câu tốt, câu chưa tốt.' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * MF-5 AI assistant console (Admin, `support:knowledge.manage`): what the AI knows, a sandbox to ask it, and
 * what it answered members. The tabs hand each other work: a weak answer becomes a new article, a cited source
 * opens its article.
 */
export function AiConsolePage() {
  const router = useRouter();
  const pathname = usePathname();
  const requested = useSearchParams().get('tab');
  const [tab, setTab] = useState<TabKey>(TABS.some((t) => t.key === requested) ? (requested as TabKey) : 'knowledge');
  const [focus, setFocus] = useState<KnowledgeFocus | null>(null);

  const open = (next: TabKey) => {
    setTab(next);
    setFocus(null);
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  };
  const toKnowledge = (next: KnowledgeFocus) => {
    open('knowledge');
    setFocus(next);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-6 py-6 lg:px-8">
      <PageHeader
        title="Trợ lý AI"
        description="Trợ lý AI trả lời câu hỏi của Member trong ứng dụng. Tại đây bạn quản lý nội dung AI dùng và kiểm tra cách AI trả lời."
      />
      <AiHealthCard />
      <nav aria-label="Trợ lý AI" className="grid max-w-xl grid-cols-3 gap-1 rounded-lg bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-current={t.key === tab ? 'page' : undefined}
            onClick={() => open(t.key)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
              t.key === tab ? 'bg-background font-medium text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <p className="-mt-2 text-sm text-muted-foreground">{TABS.find((t) => t.key === tab)?.hint}</p>
      {tab === 'knowledge' && <KnowledgeTab focus={focus} />}
      {tab === 'playground' && <PlaygroundTab onOpenArticle={(id) => toKnowledge({ kind: 'edit', id })} />}
      {tab === 'answers' && <AnswersTab onDraftArticle={(draft) => toKnowledge({ kind: 'new', draft })} />}
    </main>
  );
}
