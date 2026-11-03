import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAppStore } from '@/store/useAppStore';

describe('GoogleSignInButton', () => {
  const loginWithGoogle = vi.fn();
  const onSignedIn = vi.fn();
  let googleCallback: (response: { credential: string }) => void = () => {};

  // Google hands the ID token to the callback the button was initialised with.
  const signInWithGoogle = async () => {
    render(<GoogleSignInButton onSignedIn={onSignedIn} />);
    await waitFor(() => expect(window.google?.accounts.id.renderButton).toHaveBeenCalled());
    await act(async () => googleCallback({ credential: 'id-token' }));
  };

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'web-client-id');
    loginWithGoogle.mockReset();
    onSignedIn.mockReset();
    useAppStore.setState({ loginWithGoogle });
    window.google = {
      accounts: {
        id: {
          initialize: vi.fn(({ callback }) => {
            googleCallback = callback;
          }),
          renderButton: vi.fn(),
        },
      },
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.google;
  });

  it('renders nothing when no Google client ID is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', '');
    const { container } = render(<GoogleSignInButton onSignedIn={onSignedIn} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('signs in straight away with an account already linked', async () => {
    loginWithGoogle.mockResolvedValue({ success: true, redirectUrl: '/admin' });

    await signInWithGoogle();

    expect(window.google?.accounts.id.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'web-client-id' }),
    );
    expect(loginWithGoogle).toHaveBeenCalledWith('id-token', undefined);
    expect(onSignedIn).toHaveBeenCalledWith('/admin');
  });

  it('asks a new member for a birthday and resends the same token (BR-54)', async () => {
    loginWithGoogle
      .mockResolvedValueOnce({ success: false, reason: 'GOOGLE_SIGNUP_NEEDS_BIRTHDAY' })
      .mockResolvedValueOnce({ success: true });

    await signInWithGoogle();
    await userEvent.type(screen.getByLabelText('Ngày sinh'), '2000-05-14');
    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(loginWithGoogle).toHaveBeenLastCalledWith('id-token', { dateOfBirth: '2000-05-14' });
    expect(onSignedIn).toHaveBeenCalled();
  });

  it('asks for the password before linking an existing account and shows a wrong one', async () => {
    loginWithGoogle
      .mockResolvedValueOnce({ success: false, reason: 'GOOGLE_LINK_NEEDS_PASSWORD' })
      .mockResolvedValueOnce({ success: false, error: 'Email hoặc mật khẩu không chính xác.' });

    await signInWithGoogle();
    await userEvent.type(screen.getByLabelText('Mật khẩu tài khoản'), 'sai-mat-khau');
    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(loginWithGoogle).toHaveBeenLastCalledWith('id-token', { password: 'sai-mat-khau' });
    expect(screen.getByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không chính xác.');
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('shows a refusal that needs no further step', async () => {
    loginWithGoogle.mockResolvedValue({ success: false, error: 'Email này đã được liên kết với một tài khoản Google khác.' });

    await signInWithGoogle();

    expect(screen.getByRole('alert')).toHaveTextContent('tài khoản Google khác');
    expect(screen.queryByRole('button', { name: 'Tiếp tục' })).not.toBeInTheDocument();
  });
});
