import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateProjectModal } from '@/features/production/components/list/CreateProjectModal';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/projects',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 50 } });

it('lets the Admin create a project with its Reviewer, lead Creator and studio, without seasons', async () => {
  signInAs('admin');
  const calls = routeFetch({
    '/genres': page([{ id: 'g1', name: 'Kinh dị' }]),
    '/users': page([
      { id: 'r1', fullName: 'Reviewer Một', email: 'r1@x.vn' },
      { id: 'c1', fullName: 'Creator Một', email: 'c1@x.vn' },
    ]),
    '/studios': [{ id: 'st1', name: 'Lumen Studio', email: 'lumen@x.vn', isActive: true }],
    '/projects': { id: 'm-new' },
  });
  const onCreated = vi.fn();
  render(<CreateProjectModal onClose={vi.fn()} onCreated={onCreated} />);

  await userEvent.type(screen.getByLabelText('Tên phim'), 'Vùng dịch 704');
  await userEvent.type(screen.getByLabelText(/Ý tưởng phim/), 'Một thị trấn bị phong toả sau dịch bệnh lạ.');
  await userEvent.click(await screen.findByRole('button', { name: 'Kinh dị' }));
  // The Reviewer in charge is required.
  expect(screen.getByRole('button', { name: 'Tạo dự án' })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('chọn Reviewer phụ trách');

  await screen.findAllByRole('option', { name: 'Reviewer Một' });
  await userEvent.selectOptions(screen.getByLabelText('Reviewer phụ trách'), 'r1');
  await userEvent.selectOptions(screen.getByLabelText('Creator chính'), 'c1');
  await userEvent.selectOptions(screen.getByLabelText('Studio (tuỳ chọn)'), await screen.findByRole('option', { name: 'Lumen Studio' }));
  await userEvent.selectOptions(screen.getByLabelText('Độ tuổi'), 'T18');
  // Seasons and episodes are the Reviewer's job afterwards; idea files are added on the Overview tab.
  expect(screen.queryByText(/Mùa và tập/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/Tệp ý tưởng/)).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Tạo dự án' }));
  await waitFor(() => expect(onCreated).toHaveBeenCalledWith('m-new'));

  const created = calls.find((c) => c.path === '/projects' && c.method === 'POST');
  const body = JSON.parse(created!.body as string);
  expect(body).toMatchObject({ reviewerId: 'r1', creatorId: 'c1', studioId: 'st1', genreIds: ['g1'], ageRating: 'T18' });
  expect(body).not.toHaveProperty('seasons');
  const people = calls.filter((c) => c.path === '/users');
  expect(people.length).toBeGreaterThanOrEqual(2);
});
