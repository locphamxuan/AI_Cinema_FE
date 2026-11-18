import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StaffLookup, StaffPage } from '@/features/staff/components/StaffPage';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
afterEach(() => vi.unstubAllGlobals());
const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 50 } });

describe('Staff pages', () => {
  it('opens the support desk to a Staff holding support:case.read, and says so otherwise', () => {
    signInAs('staff');
    routeFetch({});
    const { unmount } = render(<StaffPage />);
    expect(screen.getByRole('region', { name: 'Hàng chờ hỗ trợ' })).toBeInTheDocument();
    unmount();
    signInAs('staff', []);
    render(<StaffPage />);
    expect(screen.getByText(/chưa được cấp quyền hỗ trợ khách hàng/)).toBeInTheDocument();
  });

  it('lists the read-only lookups the permissions open', async () => {
    signInAs('staff', ['member:ops.read']);
    routeFetch({
      '/movies': page([{ id: 'm1', title: 'Mưa Trên Phố Cũ', episodeCount: 8, genres: [] }]),
      '/users': page([{ id: 'u1', fullName: 'An', email: 'an@test.vn', isActive: false }]),
    });
    render(<StaffLookup />);
    expect(await screen.findByText('Mưa Trên Phố Cũ')).toBeInTheDocument();
    expect(await screen.findByText('Đã khoá')).toBeInTheDocument();
  });
});
