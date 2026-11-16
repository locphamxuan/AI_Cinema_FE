'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store/useAppStore';
import { loginUrlFor } from '@/lib/safeNext';
import {
  authorizeQueryFrom,
  oauthFailureText,
  oauthService,
  type ConsentView,
  type OAuthFailure,
} from '@/services/oauthService';

type State =
  | { kind: 'loading' }
  | { kind: 'consent'; view: ConsentView }
  | { kind: 'error'; failure: OAuthFailure }
  | { kind: 'leaving' };

const CARD = 'w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9';

/**
 * MF-1: Studio Web sends the studio here to approve its login (OAuth 2.0 + PKCE). Signed out → the sign-in
 * page, which comes back with the whole query. The backend checks the client, the redirect and the account,
 * and on a decision answers the URL to go to; this page never builds one itself.
 */
export function ConsentPage() {
  const router = useRouter();
  const search = useSearchParams();
  const logout = useAppStore((s) => s.logout);
  const email = useAppStore((s) => s.user?.email);
  const query = useMemo(() => authorizeQueryFrom(search), [search]);
  const here = `/oauth/authorize?${search.toString()}`;
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    if (!authService.hasSession()) {
      router.replace(loginUrlFor(here));
      return;
    }
    let active = true;
    void oauthService.describe(query).then((res) => {
      if (!active) return;
      if (res.ok) setState({ kind: 'consent', view: res.data });
      else if (res.failure.status === 401) router.replace(loginUrlFor(here));
      else setState({ kind: 'error', failure: res.failure });
    });
    return () => {
      active = false;
    };
  }, [here, query, router]);

  const decide = async (approve: boolean) => {
    setState({ kind: 'leaving' });
    const res = await oauthService.decide(query, approve);
    if (res.ok) window.location.assign(res.data.redirectTo);
    else setState({ kind: 'error', failure: res.failure });
  };

  const switchAccount = () => {
    logout();
    router.replace(loginUrlFor(here));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      {(state.kind === 'loading' || state.kind === 'leaving') && (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {state.kind === 'loading' ? 'Đang kiểm tra yêu cầu đăng nhập…' : 'Đang chuyển về Studio Web…'}
        </p>
      )}

      {state.kind === 'error' && (
        <section className={CARD} aria-labelledby="oauth-error-title">
          <h1 id="oauth-error-title" className="font-heading text-xl font-semibold">
            Không thể cấp quyền
          </h1>
          <p role="alert" className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {oauthFailureText(state.failure)}
          </p>
          {state.failure.description && <p className="mt-2 text-xs text-muted-foreground">Chi tiết: {state.failure.description}</p>}
          {state.failure.error === 'access_denied' && (
            <Button className="mt-6 w-full" onClick={switchAccount}>
              Đăng xuất và đăng nhập tài khoản Studio
            </Button>
          )}
        </section>
      )}

      {state.kind === 'consent' && (
        <section className={CARD} aria-labelledby="oauth-title">
          <h1 id="oauth-title" className="font-heading text-xl font-semibold">
            {state.view.client.name} muốn dùng tài khoản AI Cinema của bạn
          </h1>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3.5">
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{state.view.account.studioName ?? 'Tài khoản Studio'}</p>
              <p className="truncate text-xs text-muted-foreground">{email ?? 'Tài khoản đang đăng nhập'}</p>
            </div>
          </div>

          <h2 className="mt-5 text-sm font-medium">Studio Web sẽ được phép</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {state.view.scopes.map((s) => (
              <li key={s.scope} className="rounded-xl border border-border px-3 py-2 leading-relaxed">
                {s.description}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => void decide(false)}>
              Từ chối
            </Button>
            <Button onClick={() => void decide(true)}>Cho phép</Button>
          </div>
          <button
            type="button"
            onClick={switchAccount}
            className="mt-4 w-full cursor-pointer text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Đăng nhập tài khoản khác
          </button>
        </section>
      )}
    </main>
  );
}
