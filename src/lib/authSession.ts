/**
 * AI Cinema - the sign-in session of this browser tab.
 *
 * Every login opens its own session record (tokens + profile) in localStorage under its own id, and each tab
 * remembers in sessionStorage which record it works with. Three windows can therefore stay signed in as three
 * different accounts side by side: a login in one window never replaces the tokens another window sends.
 * A tab duplicated from another one shares that tab's record (same id), so a token rotated by one is the
 * token the other sends next. A new tab opened on any page but /login continues the most recent login.
 */

import type { UserProfile } from '@/types/auth';

export interface SessionRecord {
  accessToken: string;
  refreshToken: string;
  user: UserProfile | null;
  updatedAt: number;
}

const TAB_KEY = 'ai_cinema_tab_session';
const LAST_KEY = 'ai_cinema_last_session';
const RECORD_PREFIX = 'ai_cinema_session:';
/** Sessions kept for this browser; older ones are dropped (their tabs sign in again). */
const MAX_SESSIONS = 6;
/** Tokens of the old single, shared session (before per-tab sessions); removed on sight. */
const LEGACY_KEYS = ['ai_cinema_auth_token', 'ai_cinema_refresh_token', 'ai_cinema_user_data'];
const LOGIN_PATH = '/login';

const recordKey = (id: string) => `${RECORD_PREFIX}${id}`;
const listeners = new Set<() => void>();

function safely<T>(read: () => T, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    return read();
  } catch {
    return fallback;
  }
}

function readRecord(id: string | null): SessionRecord | null {
  if (!id) return null;
  return safely(() => {
    const raw = localStorage.getItem(recordKey(id));
    const parsed = raw ? (JSON.parse(raw) as SessionRecord) : null;
    return parsed?.accessToken ? parsed : null;
  }, null);
}

function writeRecord(id: string, record: SessionRecord): void {
  safely(() => localStorage.setItem(recordKey(id), JSON.stringify(record)), undefined);
}

function newId(): string {
  const random = globalThis.crypto?.randomUUID?.();
  return random ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Keeps the most recently used sessions only, so a long-used browser does not pile up tokens. */
function prune(): void {
  safely(() => {
    const own = sessionStorage.getItem(TAB_KEY);
    const others = Object.keys(localStorage)
      .filter((key) => key.startsWith(RECORD_PREFIX))
      .map((key) => key.slice(RECORD_PREFIX.length))
      .filter((id) => id !== own);
    const byAge = others.sort((a, b) => (readRecord(b)?.updatedAt ?? 0) - (readRecord(a)?.updatedAt ?? 0));
    for (const id of byAge.slice(MAX_SESSIONS - 1)) localStorage.removeItem(recordKey(id));
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  }, undefined);
}

function notify(): void {
  for (const listener of listeners) listener();
}

export const authSession = {
  /**
   * Id of this tab's session. A tab without one continues the latest login, except on /login itself:
   * there the owner is about to sign in with another account.
   */
  id(): string | null {
    return safely(() => {
      const own = sessionStorage.getItem(TAB_KEY);
      if (own) return own;
      if (window.location.pathname === LOGIN_PATH) return null;
      const latest = localStorage.getItem(LAST_KEY);
      if (!readRecord(latest)) return null;
      sessionStorage.setItem(TAB_KEY, latest!);
      return latest;
    }, null);
  },

  read(): SessionRecord | null {
    return readRecord(authSession.id());
  },

  /** A new login: a new session for this tab, never touching the sessions of other tabs. */
  start(tokens: { accessToken: string; refreshToken: string }, user: UserProfile | null): void {
    const id = newId();
    writeRecord(id, { ...tokens, user, updatedAt: Date.now() });
    safely(() => {
      sessionStorage.setItem(TAB_KEY, id);
      localStorage.setItem(LAST_KEY, id);
    }, undefined);
    prune();
  },

  /** New tokens (refresh, password change) or a newer profile for this tab's session. */
  update(patch: Partial<Omit<SessionRecord, 'updatedAt'>>): void {
    const id = authSession.id();
    const current = readRecord(id);
    if (!id || !current) return;
    writeRecord(id, { ...current, ...patch, updatedAt: Date.now() });
  },

  /** Ends this tab's session (and that of tabs duplicated from it); other accounts stay signed in. */
  end(): void {
    const id = safely(() => sessionStorage.getItem(TAB_KEY), null);
    safely(() => {
      sessionStorage.removeItem(TAB_KEY);
      if (!id) return;
      localStorage.removeItem(recordKey(id));
      if (localStorage.getItem(LAST_KEY) === id) localStorage.removeItem(LAST_KEY);
    }, undefined);
    notify();
  },

  /**
   * Runs `task` while no other tab of this session refreshes it. A refresh token works once, so two tabs of
   * one session must not swap it at the same time (the second swap would read as a stolen token).
   */
  async exclusive<T>(task: () => Promise<T>): Promise<T> {
    const id = authSession.id();
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    if (!id || !locks) return task();
    return locks.request(`ai_cinema_refresh:${id}`, task);
  },

  /** Calls `listener` when this tab's session ends or changes, here or in a tab sharing it. */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      const id = safely(() => sessionStorage.getItem(TAB_KEY), null);
      if (id && event.key === recordKey(id)) listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },
};
