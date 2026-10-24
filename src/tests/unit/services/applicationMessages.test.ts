import { describe, expect, it } from 'vitest';
import { APPLICATION_MESSAGES, localizeApiError } from '@/lib/applicationMessages';

describe('application messages', () => {
  it('localizes the backend authentication and account errors', () => {
    expect(localizeApiError('Incorrect email or password', 401, undefined, '/auth/login')).toBe(
      APPLICATION_MESSAGES.MSG05.message,
    );
    expect(localizeApiError('An account with this email already exists', 409, undefined, '/auth/register')).toBe(
      APPLICATION_MESSAGES.MSG06.message,
    );
    expect(localizeApiError('This account has been deactivated', 403, undefined, '/auth/login')).toBe(
      APPLICATION_MESSAGES.MSG08.message,
    );
    expect(
      localizeApiError('AI Cinema is only for viewers aged 18 or older', 403, undefined, '/auth/register'),
    ).toBe(APPLICATION_MESSAGES.MSG07.message);
  });

  it('localizes BE business errors using their messages and detail reasons', () => {
    expect(
      localizeApiError('The wallet does not hold enough Coins for this purchase', 422, undefined, '/episodes/e1/purchase'),
    ).toBe(APPLICATION_MESSAGES.MSG12.message);
    expect(localizeApiError('The episode is not published', 409, undefined, '/episodes/e1/purchase')).toBe(
      APPLICATION_MESSAGES.MSG13.message,
    );
    expect(
      localizeApiError('The episode cannot be released yet (BR-19)', 409, ['review'], '/episodes/e1/publications'),
    ).toBe(APPLICATION_MESSAGES.MSG14.message);
    expect(
      localizeApiError('The request is invalid', 400, ['email must be an email'], '/auth/register'),
    ).toBe(APPLICATION_MESSAGES.MSG03.message);
  });

  it('keeps the reason of any other business rule the backend refuses', () => {
    const handoff = 'Episodes 2 have no delivery deadline or one already past; the Reviewer must set it first';
    expect(localizeApiError(handoff, 409, undefined, '/projects/m1/handoff')).toBe(handoff);
    expect(localizeApiError('Only a failed delivery can be processed again', 400, undefined, '/media/a1/retry')).toBe(
      'Only a failed delivery can be processed again',
    );
    expect(localizeApiError('Season not found in this project', 404, undefined, '/projects/m1/handoff')).toBe(
      'Season not found in this project',
    );
  });

  it('never shows what the server said about a session, rate limit or server fault', () => {
    expect(localizeApiError('Invalid refresh token', 401, undefined, '/auth/refresh')).toBe(
      'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    );
    expect(localizeApiError('ThrottlerException: Too Many Requests', 429, undefined, '/movies')).toBe(
      APPLICATION_MESSAGES.MSG19.message,
    );
    expect(localizeApiError('relation "users" does not exist', 500, undefined, '/movies')).toBe(
      APPLICATION_MESSAGES.MSG18.message,
    );
  });

  it('uses Vietnamese fallbacks for common HTTP statuses', () => {
    expect(localizeApiError(undefined, 403, undefined, '/projects')).toBe(APPLICATION_MESSAGES.MSG09.message);
    expect(localizeApiError(undefined, 404, undefined, '/movies/missing')).toBe(APPLICATION_MESSAGES.MSG10.message);
    expect(localizeApiError(undefined, 429, undefined, '/movies')).toBe(APPLICATION_MESSAGES.MSG19.message);
    expect(localizeApiError(undefined, 500, undefined, '/movies')).toBe(APPLICATION_MESSAGES.MSG18.message);
  });
});
