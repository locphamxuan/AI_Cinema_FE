import { expect, test as base, type Page } from '@playwright/test';
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

/** Signs in as `who` and waits for its home page. */
export async function signIn(page: Page, who: keyof typeof HOME) {
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

/** Every test starts from the seed of the fake API. */
export const test = base.extend({
  page: async ({ page, request }, provide) => {
    expect((await request.post(`${FAKE_API_URL}/__test/reset`)).status()).toBe(204);
    await provide(page);
  },
});

export { expect };
