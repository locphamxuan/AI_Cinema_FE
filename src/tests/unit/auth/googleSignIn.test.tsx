import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
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
    expect(loginWithGoogle).toHaveBeenCalledWith('id-token');
    expect(onSignedIn).toHaveBeenCalledWith('/admin');
  });

  it('opens a new account in one tap, without asking for anything else', async () => {
    loginWithGoogle.mockResolvedValue({ success: true, redirectUrl: '/' });

    await signInWithGoogle();

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
    expect(loginWithGoogle).toHaveBeenCalledWith('id-token');
    expect(screen.queryByLabelText('Ngày sinh')).not.toBeInTheDocument();
    expect(onSignedIn).toHaveBeenCalledWith('/');
  });

  it('shows a refusal that needs no further step', async () => {
    loginWithGoogle.mockResolvedValue({ success: false, error: 'Email này đã được liên kết với một tài khoản Google khác.' });

    await signInWithGoogle();

    expect(screen.getByRole('alert')).toHaveTextContent('tài khoản Google khác');
    expect(screen.queryByRole('button', { name: 'Tiếp tục' })).not.toBeInTheDocument();
  });
});
