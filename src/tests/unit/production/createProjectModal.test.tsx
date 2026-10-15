import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateProjectModal } from '@/features/production/components/list/CreateProjectModal';
import { getTodayDateString } from '@/lib/dateUtils';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/reviewer/projects',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

it('sends the viewer information with the project and uploads idea and synopsis files with their purpose', async () => {
  signInAs('reviewer');
  const calls = routeFetch({
    '/genres': { data: [{ id: 'g1', name: 'Kinh dị' }], meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 100 } },
    '/projects': { id: 'm-new' },
    '/projects/m-new/idea-files': { id: 'f1' },
  });
  const onCreated = vi.fn();
  render(<CreateProjectModal onClose={vi.fn()} onCreated={onCreated} />);

  await userEvent.type(screen.getByLabelText('Tên phim'), 'Vùng dịch 704');
  await userEvent.type(screen.getByLabelText(/Ý tưởng \/ mô tả cho studio/), 'Một thị trấn bị phong toả sau dịch bệnh lạ.');
  await userEvent.click(await screen.findByRole('button', { name: 'Kinh dị' }));
  await userEvent.type(screen.getByLabelText('Tóm tắt cho người xem'), 'Bốn người sống sót tìm đường ra.');
  await userEvent.selectOptions(screen.getByLabelText('Độ tuổi'), 'T18');
  fireEvent.change(screen.getByLabelText('Năm phát hành'), { target: { value: '2026' } });
  const files = screen.getAllByLabelText(/Tệp (ý tưởng gửi Studio|tóm tắt cho người xem)/) as HTMLInputElement[];
  await userEvent.upload(files[0], new File(['idea'], 'y-tuong.docx'));
  await userEvent.upload(files[1], new File(['video'], 'teaser.mp4', { type: 'video/mp4' }));
  fireEvent.change(screen.getByLabelText('Đơn giá 1 tập của mùa 1'), { target: { value: '3000' } });
  fireEvent.change(screen.getByLabelText('Hạn giao tập 1'), { target: { value: getTodayDateString() } });
  fireEvent.change(screen.getByLabelText('Hạn giao tập 2'), { target: { value: getTodayDateString() } });

  await userEvent.click(screen.getByRole('button', { name: 'Tạo dự án' }));
  await waitFor(() => expect(onCreated).toHaveBeenCalledWith('m-new'));

  const created = calls.find((c) => c.path === '/projects' && c.method === 'POST');
  expect(JSON.parse(created!.body as string)).toMatchObject({
    synopsis: 'Bốn người sống sót tìm đường ra.',
    ageRating: 'T18',
    releaseYear: 2026,
    genreIds: ['g1'],
  });
  const uploads = calls.filter((c) => c.path === '/projects/m-new/idea-files');
  expect(uploads).toHaveLength(2);
});