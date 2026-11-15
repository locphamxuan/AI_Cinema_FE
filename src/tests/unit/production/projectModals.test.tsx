import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { AssignCreatorModal, EditProjectModal } from '@/features/production/components/project/ProjectModals';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { ProjectDetail } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const IDEA = 'Một cô gái đi tìm người mẹ mất tích giữa cơn mưa Sài Gòn.';
const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 100 } });
const GENRES = page([
  { id: 'g1', name: 'Kinh dị' },
  { id: 'g2', name: 'Tâm lý' },
]);

const film = (overrides: Partial<ProjectDetail> = {}) =>
  assignedProject({
    ideaDescription: IDEA,
    synopsis: null,
    genres: [{ id: 'g1', name: 'Kinh dị' }],
    ageRating: null,
    releaseYear: null,
    freeEpisodeCount: null,
    ...overrides,
  });

function editModal(project = film()) {
  const onClose = vi.fn();
  const reload = vi.fn(async () => undefined);
  render(withProject(project, <EditProjectModal onClose={onClose} />, reload));
  return { onClose, reload };
}

const save = () => screen.getByRole('button', { name: 'Lưu' });
const sentPatch = (calls: ReturnType<typeof routeFetch>) =>
  JSON.parse(calls.find((c) => c.path === '/projects/m1' && c.method === 'PATCH')!.body as string);

beforeEach(() => {
  localStorage.clear();
  vi.mocked(toast.error).mockClear();
  signInAs('reviewer');
});
afterEach(() => vi.unstubAllGlobals());

describe('EditProjectModal', () => {
  it('saves what viewers and the studio read, leaving out the fields left empty', async () => {
    const calls = routeFetch({ '/genres': GENRES, '/projects/m1': film() });
    const { onClose, reload } = editModal();

    await userEvent.click(await screen.findByRole('button', { name: 'Tâm lý' }));
    await userEvent.selectOptions(screen.getByLabelText('Độ tuổi'), 'T16');
    await userEvent.type(screen.getByLabelText('Năm phát hành'), '2027');
    await userEvent.type(screen.getByLabelText('Số tập xem miễn phí'), '2');
    await userEvent.click(save());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(sentPatch(calls)).toEqual({
      title: 'Mưa Sài Gòn',
      ideaDescription: IDEA,
      genreIds: ['g1', 'g2'],
      ageRating: 'T16',
      releaseYear: 2027,
      freeEpisodeCount: 2,
    });
    expect(reload).toHaveBeenCalled();
  });

  it('sends null free episodes when the field is cleared, meaning the platform default', async () => {
    const calls = routeFetch({ '/genres': GENRES, '/projects/m1': film() });
    const { onClose } = editModal(film({ freeEpisodeCount: 3 }));

    await screen.findByRole('button', { name: 'Tâm lý' });
    await userEvent.clear(screen.getByLabelText('Số tập xem miễn phí'));
    await userEvent.click(save());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(sentPatch(calls).freeEpisodeCount).toBeNull();
  });

  it('needs a title, an idea of 20 characters and one genre', async () => {
    routeFetch({ '/genres': GENRES });
    editModal();
    await screen.findByRole('button', { name: 'Kinh dị' });
    expect(save()).toBeEnabled();

    await userEvent.clear(screen.getByLabelText(/Ý tưởng gửi studio/));
    await userEvent.type(screen.getByLabelText(/Ý tưởng gửi studio/), 'Quá ngắn');
    expect(save()).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/Ý tưởng gửi studio/), ' để gửi cho studio đâu');
    expect(save()).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Kinh dị' }));
    expect(save()).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Kinh dị' }));
    await userEvent.clear(screen.getByLabelText('Tên phim'));
    expect(save()).toBeDisabled();
  });

  it('keeps the dialog open and shows the refusal of the API', async () => {
    routeFetch({ '/genres': GENRES, '/projects/m1': failWith(409, 'The project is CANCELLED') });
    const { onClose, reload } = editModal();

    await screen.findByRole('button', { name: 'Kinh dị' });
    await userEvent.click(save());

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không thực hiện được', expect.stringContaining('CANCELLED')));
    expect(onClose).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});

describe('AssignCreatorModal (Admin)', () => {
  const creators = page([
    { id: 'creator-id', fullName: 'Creator Một', email: 'c1@x.vn' },
    { id: 'c2', fullName: 'Creator Hai', email: 'c2@x.vn' },
  ]);

  function assign() {
    signInAs('admin');
    const onClose = vi.fn();
    const reload = vi.fn(async () => undefined);
    render(withProject(film(), <AssignCreatorModal current={film().creator} onClose={onClose} />, reload));
    return { onClose, reload };
  }

  it('gives the project to another active Creator', async () => {
    const calls = routeFetch({ '/users': creators, '/projects/m1/assign': null });
    const { onClose, reload } = assign();

    const give = screen.getByRole('button', { name: 'Giao' });
    expect(give).toBeDisabled();
    await screen.findByRole('option', { name: /Creator Hai/ });
    await userEvent.selectOptions(screen.getByLabelText('Creator'), 'c2');
    await userEvent.click(give);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(JSON.parse(calls.find((c) => c.path === '/projects/m1/assign')!.body as string)).toEqual({ creatorId: 'c2' });
    expect(reload).toHaveBeenCalled();
  });

  it('shows the refusal of the API and keeps the dialog open', async () => {
    routeFetch({ '/users': creators, '/projects/m1/assign': failWith(409, 'Cannot reassign a project that is IN_PRODUCTION') });
    const { onClose } = assign();

    await screen.findByRole('option', { name: /Creator Hai/ });
    await userEvent.selectOptions(screen.getByLabelText('Creator'), 'c2');
    await userEvent.click(screen.getByRole('button', { name: 'Giao' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không thực hiện được', expect.stringContaining('IN_PRODUCTION')));
    expect(onClose).not.toHaveBeenCalled();
  });
});
