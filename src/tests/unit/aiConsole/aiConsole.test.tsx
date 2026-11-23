import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KnowledgeTab } from '@/features/ai-console/KnowledgeTab';
import { PlaygroundTab, historyOf } from '@/features/ai-console/PlaygroundTab';
import { AnswersTab } from '@/features/ai-console/AnswersTab';
import { AiHealthCard } from '@/features/ai-console/AiHealthCard';
import { articleState } from '@/features/ai-console/aiLabels';
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
  id: 'a1', title: 'Huỷ gói Tháng', slug: 'huy-goi-thang', category: 'Gói Tháng', audience: 'MEMBER', locale: 'vi', status: 'PUBLISHED',
  source: 'POLICY', sourceRef: null, version: 2, indexStatus: 'INDEXED', indexError: null, indexedAt: '2026-11-14T00:00:00Z',
  createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-14T00:00:00Z',
};

describe('AI console queries', () => {
  it('sends the knowledge filters in the backend pagination dialect', () => {
    const q = new URLSearchParams(knowledgeQuery(2, 20, { search: ' huỷ ', status: 'PUBLISHED', category: 'Gói Tháng', failedOnly: true }));
    expect(Object.fromEntries(q)).toEqual({
      page: '2', limit: '20', sortBy: 'updatedAt:DESC', search: 'huỷ',
      'filter.status': '$eq:PUBLISHED', 'filter.category': '$eq:Gói Tháng', 'filter.indexStatus': '$eq:FAILED',
    });
  });

  it('filters answers not rated yet with $null and weak ones with $eq:NOT_HELPFUL', () => {
    expect(new URLSearchParams(answersQuery(1, 20, 'UNRATED')).get('filter.aiFeedback')).toBe('$null');
    expect(new URLSearchParams(answersQuery(1, 20, 'NOT_HELPFUL')).get('filter.aiFeedback')).toBe('$eq:NOT_HELPFUL');
    expect(new URLSearchParams(answersQuery(1, 20, 'ALL')).has('filter.aiFeedback')).toBe(false);
  });

  it('turns the article and AI reading states into one plain state', () => {
    expect(articleState({ status: 'PUBLISHED', indexStatus: 'INDEXED' })).toBe('IN_USE');
    expect(articleState({ status: 'PUBLISHED', indexStatus: 'INDEXING' })).toBe('UPDATING');
    expect(articleState({ status: 'PUBLISHED', indexStatus: 'FAILED' })).toBe('NOT_READ');
    expect(articleState({ status: 'ARCHIVED', indexStatus: 'PENDING' })).toBe('HIDDEN');
    expect(articleState({ status: 'DRAFT', indexStatus: 'PENDING' })).toBe('DRAFT');
  });
});

describe('AI health card', () => {
  it('says in plain words that some articles were not read, without model names', async () => {
    routeFetch({
      '/admin/support/ai/health': {
        mode: 'live', chatModel: 'gemini-x', chatConfigured: true, embeddingModel: 'embed-y', embeddingConfigured: true,
        indexedChunks: 40, failedArticles: 2, pendingArticles: 0, lastIndexedAt: null,
      },
    });
    const { container } = render(<AiHealthCard />);
    expect(await screen.findByRole('alert')).toHaveTextContent('2 bài AI chưa đọc được');
    expect(screen.getByText('Đang trả lời Member')).toBeInTheDocument();
    expect(container).not.toHaveTextContent('gemini-x');
    expect(container).not.toHaveTextContent('embed-y');
  });
});

describe('Knowledge tab', () => {
  it('lists articles with one plain state, hides the article code, and deletes one only after confirming', async () => {
    const calls = routeFetch({ '/admin/support/knowledge': page([ARTICLE]), '/admin/support/knowledge/a1': { id: 'a1', deleted: true } });
    render(<KnowledgeTab focus={null} />);

    const row = (await screen.findByText('Huỷ gói Tháng')).closest('tr')!;
    expect(within(row).getByText('Đang dùng')).toBeInTheDocument();
    expect(row).not.toHaveTextContent('huy-goi-thang');

    await userEvent.click(within(row).getByRole('button', { name: 'Xoá' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Không hoàn tác được');
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xoá hẳn' }));

    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/knowledge/a1' && c.method === 'DELETE')).toBe(true));
  });

  it('hides an article through the archive route and retries one the AI could not read', async () => {
    const failed = { ...ARTICLE, id: 'a2', title: 'Nạp Coin qua VNPay', indexStatus: 'FAILED', indexError: 'quota' };
    const calls = routeFetch({ '/admin/support/knowledge': page([ARTICLE, failed]) });
    render(<KnowledgeTab focus={null} />);
    const row = (await screen.findByText('Huỷ gói Tháng')).closest('tr')!;
    const failedRow = screen.getByText('Nạp Coin qua VNPay').closest('tr')!;
    expect(within(failedRow).getByText('AI chưa đọc được')).toBeInTheDocument();
    expect(failedRow).not.toHaveTextContent('quota');
    expect(within(row).queryByRole('button', { name: 'Thử lại' })).toBeNull();

    await userEvent.click(within(failedRow).getByRole('button', { name: 'Thử lại' }));
    await userEvent.click(within(row).getByRole('button', { name: 'Tạm ẩn' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tạm ẩn' }));

    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/knowledge/a1/archive' && c.method === 'POST')).toBe(true));
    expect(calls.some((c) => c.path === '/admin/support/knowledge/a2/reindex' && c.method === 'POST')).toBe(true);
  });

  it('puts a hidden article back in use', async () => {
    const calls = routeFetch({ '/admin/support/knowledge': page([{ ...ARTICLE, status: 'ARCHIVED', indexStatus: 'PENDING' }]) });
    render(<KnowledgeTab focus={null} />);
    const row = (await screen.findByText('Huỷ gói Tháng')).closest('tr')!;
    expect(within(row).getByText('Tạm ẩn')).toBeInTheDocument();

    await userEvent.click(within(row).getByRole('button', { name: 'Dùng lại' }));
    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/admin/support/knowledge/a1' && c.method === 'PATCH')!;
      expect(JSON.parse(sent.body as string)).toEqual({ status: 'PUBLISHED' });
    });
  });

  it('opens a new article prefilled from a weak answer and saves it for the AI to use', async () => {
    const calls = routeFetch({ '/admin/support/knowledge': page([]) });
    render(<KnowledgeTab focus={{ kind: 'new', draft: { title: 'Đổi email đăng nhập', contentMarkdown: '## Đổi email đăng nhập\n\nBạn vào Tài khoản.' } }} />);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Tiêu đề')).toHaveValue('Đổi email đăng nhập');
    expect(within(dialog).queryByText(/Mã bài viết/)).toBeNull();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu và cho AI dùng' }));

    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/admin/support/knowledge' && c.method === 'POST')!;
      expect(JSON.parse(sent.body as string)).toMatchObject({
        title: 'Đổi email đăng nhập', slug: 'doi-email-dang-nhap', category: 'Gói Tháng', status: 'PUBLISHED', audience: 'MEMBER', source: 'MANUAL',
      });
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
  it('sends earlier turns oldest first, shows the articles used, and an article opens for editing', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true, data: ANSWER });
    const onOpenArticle = vi.fn();
    render(<PlaygroundTab onOpenArticle={onOpenArticle} />);

    await userEvent.type(screen.getByLabelText('Câu hỏi thử'), 'Huỷ gói có hoàn tiền không?');
    await userEvent.click(screen.getByRole('button', { name: /^Hỏi$/ }));
    expect(await screen.findByText('Bạn huỷ trong 24 giờ đầu được hoàn.')).toBeInTheDocument();
    expect(screen.queryByText(/gemini|Độ tin cậy|Độ khớp/)).toBeNull();
    expect(post).toHaveBeenLastCalledWith('/admin/support/ai/preview-chat', { question: 'Huỷ gói có hoàn tiền không?', audience: 'MEMBER' }, { timeoutMs: 60_000 });

    await userEvent.type(screen.getByLabelText('Câu hỏi thử'), 'Sau 24 giờ thì sao?');
    await userEvent.click(screen.getByRole('button', { name: /^Hỏi$/ }));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[1][1]).toEqual({
      question: 'Sau 24 giờ thì sao?',
      audience: 'MEMBER',
      history: [
        { role: 'MEMBER', content: 'Huỷ gói có hoàn tiền không?' },
        { role: 'AI', content: 'Bạn huỷ trong 24 giờ đầu được hoàn.' },
      ],
    });

    await userEvent.click((await screen.findAllByRole('button', { name: 'Huỷ gói Tháng' }))[0]);
    expect(onOpenArticle).toHaveBeenCalledWith('a1');
  });

  it('says the AI is off on a 503', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ error: { message: 'AI off', details: { reason: 'AI_UNAVAILABLE' } } }, 503)));
    render(<PlaygroundTab onOpenArticle={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Câu hỏi thử'), 'Xin chào');
    await userEvent.click(screen.getByRole('button', { name: /^Hỏi$/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Trợ lý AI đang tắt');
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
    expect(screen.getByText('Đã chuyển cho nhân viên')).toBeInTheDocument();
    expect(screen.queryByText(/an@test.vn/)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Chưa tốt' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Bài kiến thức cần bổ sung gì?'), 'Thiếu bước đổi email');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu đánh giá' }));
    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/admin/support/ai/answers/msg1/feedback')!;
      expect(JSON.parse(sent.body as string)).toEqual({ rating: 'NOT_HELPFUL', note: 'Thiếu bước đổi email' });
    });

    await userEvent.click(screen.getByRole('tab', { name: 'Chưa đánh giá' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/admin/support/ai/answers' && c.search.get('filter.aiFeedback') === '$null')).toBe(true));
  });
});
