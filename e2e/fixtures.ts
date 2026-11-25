import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test as base, type APIRequestContext, type Page } from '@playwright/test';
import { FAKE_API_URL } from './env';

export const PASSWORD = 'Aicinema@123';
export const ACCOUNTS = {
  admin: 'admin@aicinema.vn',
  reviewer: 'reviewer@aicinema.vn',
  creator: 'creator@aicinema.vn',
  creator2: 'creator2@aicinema.vn',
  staff: 'staff@aicinema.vn',
  member: 'member@aicinema.vn',
  studio: 'studio@aicinema.vn',
  locked: 'locked@aicinema.vn',
} as const;
export type Account = keyof typeof ACCOUNTS;

/** Where each role lands after signing in. */
export const HOME: Record<'admin' | 'reviewer' | 'creator' | 'staff', RegExp> = {
  admin: /\/admin$/,
  reviewer: /\/reviewer$/,
  creator: /\/creator\/projects$/,
  staff: /\/staff$/,
};

export async function fillLogin(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
}

/** Signs in as `who` and waits for its home page; a tab already signed in drops its session first. */
export async function signIn(page: Page, who: keyof typeof HOME) {
  if (page.url().startsWith('http')) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
  await fillLogin(page, ACCOUNTS[who]);
  await expect(page).toHaveURL(HOME[who]);
}

/** The writes the fake API received since the reset, e.g. to check what a screen sent or that it sent nothing. */
export async function writes(page: Page, path?: RegExp) {
  const calls = (await (await page.request.get(`${FAKE_API_URL}/__test/calls`)).json()) as {
    method: string;
    path: string;
    body: Record<string, unknown>;
    user: string | null;
  }[];
  return path ? calls.filter((c) => path.test(c.path)) : calls;
}

/**
 * Calls the API from the tab with the session it signed in with, as a user who bypasses the screen would: what the
 * API answers tells whether the server, not only the UI, refuses the step.
 */
export async function callApi(page: Page, method: string, path: string, body: Record<string, unknown> = {}) {
  return page.evaluate(
    async ({ method, path, body }) => {
      const tab = sessionStorage.getItem('ai_cinema_tab_session');
      const record = JSON.parse(localStorage.getItem(`ai_cinema_session:${tab}`) ?? '{}') as { accessToken?: string };
      const res = await fetch(`/api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${record.accessToken}` },
        body: method === 'GET' ? undefined : JSON.stringify(body),
      });
      return res.status;
    },
    { method, path, body },
  );
}

/**
 * A step done outside this back office or set up before the scenario: signs `who` in to the API and returns a caller.
 * The studio's steps are what Studio Web sends (/studio-portal); `signed` adds its signature image as a multipart form.
 */
export async function apiAs(request: APIRequestContext, who: Account) {
  const login = await request.post(`${FAKE_API_URL}/auth/login`, { data: { email: ACCOUNTS[who], password: PASSWORD } });
  const headers = { Authorization: `Bearer ${(await login.json()).accessToken}` };
  return async (method: 'GET' | 'POST', path: string, fields: Record<string, unknown> = {}, signed = false) => {
    const multipart = { ...(fields as Record<string, string>), file: { name: 'signature.png', mimeType: 'image/png', buffer: SIGNATURE_PNG } };
    const res = await request.fetch(`${FAKE_API_URL}${path}`, {
      method,
      headers,
      ...(method === 'GET' ? {} : signed ? { multipart } : { data: fields }),
    });
    expect(res.ok(), `${method} ${path}: ${await res.text()}`).toBe(true);
    return res.status() === 204 ? null : res.json();
  };
}

/** A 200x60 white PNG: a signature image the size checks of the back office accept. */
export const SIGNATURE_PNG_PATH = join(__dirname, 'assets', 'signature.png');
const SIGNATURE_PNG = readFileSync(SIGNATURE_PNG_PATH);

/** Every test starts from the seed of the fake API. */
export const test = base.extend({
  page: async ({ page, request }, provide) => {
    expect((await request.post(`${FAKE_API_URL}/__test/reset`)).status()).toBe(204);
    await provide(page);
  },
});

export { expect };
