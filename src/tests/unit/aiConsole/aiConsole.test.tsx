import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KnowledgeTab } from '@/features/ai-console/KnowledgeTab';
import { PlaygroundTab, historyOf } from '@/features/ai-console/PlaygroundTab';
import { AnswersTab } from '@/features/ai-console/AnswersTab';
import { AiHealthCard } from '@/features/ai-console/AiHealthCard';
import { apiClient } from '@/services/apiClient';
import { answersQuery, knowledgeQuery } from '@/services/aiConsoleService';
import { fakeResponse } from '@/tests/support/fakeResponse';
import { routeFetch } from '@/tests/support/routeFetch';
import type { PlaygroundAnswer } from '@/types/support';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });
const ARTICLE = {
  id: 'a1', title: 'Huỷ gói Tháng', slug: 'huy-goi-thang', category: 'Gói thành viên', audience: 'MEMBER', locale: 'vi', status: 'PUBLISHED',
  source: 'POLICY', sourceRef: null, version: 2, indexStatus: 'INDEXED', indexError: null, indexedAt: '2026-11-14T00:00:00Z',
  createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-14T00:00:00Z',
};

describe('AI console queries', () => {
  it('sends the knowledge filters in the backend pagination dialect', () => {
    const q = new URLSearchParams(knowledgeQuery(2, 20, { search: ' huỷ ', status: 'PUBLISHED', category: 'Gói cước', audience: 'MEMBER', failedOnly: true }));
    expect(Object.fromEntries(q)).toEqual({
      page: '2', limit: '20', sortBy: 'updatedAt:DESC', search: 'huỷ',
      'filter.status': '$eq:PUBLISHED', 'filter.category': '$eq:Gói cước', 'filter.audience': '$eq:MEMBER', 'filter.indexStatus': '$eq:FAILED',
    });
  });

  it('filters answers not rated yet with $null and weak ones with $eq:NOT_HELPFUL', () => {
    expect(new URLSearchParams(answersQuery(1, 20, 'UNRATED')).get('filter.aiFeedback')).toBe('$null');
    expect(new URLSearchParams(answersQuery(1, 20, 'NOT_HELPFUL')).get('filter.aiFeedback')).toBe('$eq:NOT_HELPFUL');
    expect(new URLSearchParams(answersQuery(1, 20, 'ALL')).has('filter.aiFeedback')).toBe(false);
  });
});

describe('AI health card', () => {
  it('warns when articles failed to index', async () => {
    routeFetch({ '/admin/support/ai/health': { mode: 'live', chatModel: 'm', chatConfigured: true, embeddingModel: 'e', embeddingConfigured: true, indexedChunks: 40, failedArticles: 2, pendingArticles: 0, lastIndexedAt: null } });
    render(<AiHealthCard />);
    expect(await screen.findByRole('alert')).toHaveTextContent('2 bài xuất bản bị lỗi lập chỉ mục');
  });
});

describe('Knowledge tab', () => {
  it('lists articles with their status and index, and deletes one only after confirming', async () => {
    const calls = routeFetch({ '/admin/support/knowledge': page([ARTICLE]), '/admin/support/knowledge/a1': { id: 'a1', deleted: true } });
    render(<KnowledgeTab focus={null} />);

    const row = (await screen.findByText('Huỷ gói Tháng')).closest('tr')!;
    expect(within(row).getByText('Đang dùng')).toBeInTheDocument();
    expect(within(row).getByText('Đã lập chỉ mục')).toBeInTheDocument();

    await userEvent.click(within(row).getByRole('button', { name: 'Xoá' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Không hoàn tác được');
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xoá bài' }));

    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/knowledge/a1' && c.method === 'DELETE')).toBe(true));
  });

  it('archives through its own route and re-indexes a published article', async () => {
    const calls = routeFetch({ '/admin/support/knowledge': page([ARTICLE]) });
    render(<KnowledgeTab focus={null} />);
    const row = (await screen.findByText('Huỷ gói Tháng')).closest('tr')!;

    await userEvent.click(within(row).getByRole('button', { name: 'Lập lại chỉ mục' }));
    await userEvent.click(within(row).getByRole('button', { name: 'Lưu trữ' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Lưu trữ' }));

    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/knowledge/a1/archive' && c.method === 'POST')).toBe(true));
    expect(calls.some((c) => c.path === '/admin/support/knowledge/a1/reindex' && c.method === 'POST')).toBe(true);
  });

  it('opens a new article prefilled from a weak answer and publishes it', async () => {
    const calls = routeFetch({ '/admin/support/knowledge': page([]) });
    render(<KnowledgeTab focus={{ kind: 'new', draft: { title: 'Đổi email đăng nhập', contentMarkdown: '## Đổi email đăng nhập\n\nBạn vào Tài khoản.' } }} />);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Slug (định danh duy nhất)')).toHaveValue('doi-email-dang-nhap');
    await userEvent.click(within(dialog).getByLabelText('Xuất bản cho AI dùng'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu bài' }));

    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/admin/support/knowledge' && c.method === 'POST')!;
      expect(JSON.parse(sent.body as string)).toMatchObject({ title: 'Đổi email đăng nhập', slug: 'doi-email-dang-nhap', status: 'PUBLISHED', audience: 'MEMBER' });
    });
  });
});

const ANSWER: PlaygroundAnswer = {
  question: 'Huỷ gói có hoàn tiền không?', answer: 'Bạn huỷ trong 24 giờ đầu được hoàn.', resolution: 'ANSWERED', confidence: 0.9,
  escalationReason: null, grounded: true, sources: [{ articleId: 'a1', title: 'Huỷ gói Tháng', heading: 'Mốc 24 giờ' }],
  retrieved: [{ articleId: 'a1', title: 'Huỷ gói Tháng', heading: 'Mốc 24 giờ', chunkIndex: 0, score: 0.82, excerpt: 'Trong 24 giờ đầu…' }],
  toolsUsed: [], model: 'gemini', latencyMs: 800,
};

describe('Playground tab', () => {
  it('sends earlier turns oldest first, shows the sources, and a source opens its article', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true, data: ANSWER });
    const onOpenArticle = vi.fn();
    render(<PlaygroundTab onOpenArticle={onOpenArticle} />);

    await userEvent.type(screen.getByLabelText('Câu hỏi thử'), 'Huỷ gói có hoàn tiền không?');
    await userEvent.click(screen.getByRole('button', { name: /Hỏi/ }));
    expect(await screen.findByText('Bạn huỷ trong 24 giờ đầu được hoàn.')).toBeInTheDocument();
    expect(post).toHaveBeenLastCalledWith('/admin/support/ai/preview-chat', { question: 'Huỷ gói có hoàn tiền không?', audience: 'MEMBER' }, { timeoutMs: 60_000 });

    await userEvent.type(screen.getByLabelText('Câu hỏi thử'), 'Sau 24 giờ thì sao?');
    await userEvent.click(screen.getByRole('button', { name: /Hỏi/ }));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[1][1]).toEqual({
      question: 'Sau 24 giờ thì sao?',
      audience: 'MEMBER',
      history: [
        { role: 'MEMBER', content: 'Huỷ gói có hoàn tiền không?' },
        { role: 'AI', content: 'Bạn huỷ trong 24 giờ đầu được hoàn.' },
      ],
    });

    await userEvent.click((await screen.findAllByRole('button', { name: /Huỷ gói Tháng/ }))[0]);
    expect(onOpenArticle).toHaveBeenCalledWith('a1');
  });

  it('says the AI is unavailable on a 503', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ error: { message: 'AI off', details: { reason: 'AI_UNAVAILABLE' } } }, 503)));
    render(<PlaygroundTab onOpenArticle={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Câu hỏi thử'), 'Xin chào');
    await userEvent.click(screen.getByRole('button', { name: /Hỏi/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('AI đang không khả dụng');
  });

  it('keeps at most the last 10 turns of history', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ question: `q${i}`, answer: { ...ANSWER, answer: `a${i}` } }));
    const h = historyOf(many);
    expect(h).toHaveLength(10);
    expect(h[0]).toEqual({ role: 'MEMBER', content: 'q2' });
  });
});

describe('Answers tab', () => {
  const log = {
    id: 'msg1', conversationId: 'c1', question: 'Đổi email?', answer: 'Chưa rõ.', confidence: 0.4, resolution: 'UNCERTAIN', model: 'm',
    sources: [], toolsUsed: [], feedback: null, feedbackNote: null, feedbackAt: null, feedbackBy: null,
    conversation: { id: 'c1', status: 'WAITING_FOR_STAFF', satisfactionRating: null, member: { id: 'u1', fullName: 'Nguyễn An', email: 'an@test.vn' } },
    createdAt: '2026-11-14T00:00:00Z',
  };

  it('rates an answer "Chưa tốt" with a note, and filters the unrated ones', async () => {
    const calls = routeFetch({
      '/admin/support/ai/answers/summary': { totalAnswers: 1, helpful: 0, notHelpful: 0, unrated: 1, handedOffToStaff: 1, averageSatisfaction: null },
      '/admin/support/ai/answers': page([log]),
      '/admin/support/ai/answers/msg1/feedback': { id: 'msg1', aiFeedback: 'NOT_HELPFUL' },
    });
    render(<AnswersTab onDraftArticle={vi.fn()} />);

    expect(await screen.findByText('Đổi email?')).toBeInTheDocument();
    expect(screen.getByText('Đã chuyển nhân viên')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Chưa tốt/ }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Cần bổ sung gì vào Kho tri thức?'), 'Thiếu bước đổi email');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu đánh giá' }));
    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/admin/support/ai/answers/msg1/feedback')!;
      expect(JSON.parse(sent.body as string)).toEqual({ rating: 'NOT_HELPFUL', note: 'Thiếu bước đổi email' });
    });

    await userEvent.click(screen.getByRole('tab', { name: 'Chưa đánh giá' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/ai/answers' && c.search.get('filter.aiFeedback') === '$null')).toBe(true));
  });
});
