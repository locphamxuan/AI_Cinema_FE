/**
 * Where the sign-in page may send the browser after login: only a path of this site. `//evil.com` and
 * `/\evil.com` are read by browsers as another host, so they are refused (no open redirect).
 */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/')) return null;
  if (next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}

/** `/login?next=<the current page>`, so signing in comes back here with the whole query. */
export function loginUrlFor(pathWithQuery: string): string {
  return `/login?next=${encodeURIComponent(pathWithQuery)}`;
}
