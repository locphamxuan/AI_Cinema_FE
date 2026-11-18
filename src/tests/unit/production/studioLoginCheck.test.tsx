import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudioLoginWarning, useStudioLogin } from '@/features/production/components/project/StudioLoginCheck';
import { localizeApiError } from '@/lib/applicationMessages';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';
import type { Studio } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
afterEach(() => vi.unstubAllGlobals());

const studio = { id: 's1', name: 'Studio Mới' } as Studio;

function Probe({ target }: { target: Studio | null }) {
  const { ready } = useStudioLogin(target);
  return <p>{String(ready)}</p>;
}

describe('Studio login check', () => {
  it('is ready only once the studio holds an active login', async () => {
    signInAs('admin');
    routeFetch({ '/studios/s1/accounts': [{ id: 'a1', isActive: false }] });
    const { rerender } = render(<Probe target={studio} />);
    expect(await screen.findByText('false')).toBeInTheDocument();
    routeFetch({ '/studios/s2/accounts': [{ id: 'a2', isActive: true }] });
    rerender(<Probe target={{ ...studio, id: 's2' }} />);
    expect(await screen.findByText('true')).toBeInTheDocument();
    rerender(<Probe target={null} />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('warns and opens the login accounts of the studio in place', async () => {
    signInAs('admin');
    routeFetch({ '/studios/s1/accounts': [] });
    const onCreated = vi.fn();
    render(<StudioLoginWarning studio={studio} onCreated={onCreated} />);
    expect(screen.getByRole('alert')).toHaveTextContent('chưa có tài khoản đăng nhập Studio Web');
    await userEvent.click(screen.getByRole('button', { name: /Tạo tài khoản đăng nhập/ }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Studio Mới');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });

  it('explains the refusal the backend sends', () => {
    expect(localizeApiError('no login', 409, { reason: 'STUDIO_HAS_NO_LOGIN' }, '/projects/p1/contracts')).toMatch(/chưa có tài khoản đăng nhập Studio Web/);
  });
});
