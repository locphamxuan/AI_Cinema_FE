import { FAKE_API_URL } from './env';
import { ACCOUNTS, expect, HOME, PASSWORD, signIn, test, writes } from './fixtures';

test('ST-WEB-01 each back-office role signs in and lands on its own dashboard', async ({ page }) => {
  for (const role of ['admin', 'reviewer', 'creator', 'staff'] as const) {
    await signIn(page, role);
    // The URL is the proof each role reached its own dashboard; any h1 confirms a page rendered.
    await expect(page).toHaveURL(HOME[role]);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
});
test('ST-WEB-03 a required field left empty keeps the focus while the user types into it', async ({ page }) => {
  await page.goto('/login');
  const email = page.getByRole('textbox', { name: 'Email' });
  await email.fill('');
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();

  // The browser stops the submission, says why under the empty field and puts the cursor there.
  await expect(email).toBeFocused();
  expect(await email.evaluate((el: HTMLInputElement) => el.validationMessage)).not.toBe('');
  expect(await writes(page, /\/auth\/login/)).toHaveLength(0);

  // Typing goes into that same field, which stays focused and becomes valid.
  await page.keyboard.type(ACCOUNTS.admin);
  await expect(email).toBeFocused();
  await expect(email).toHaveValue(ACCOUNTS.admin);
  expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
});

test('ST-WEB-27 two accounts in two tabs of one browser keep their own session', async ({ page, context, request }) => {
  expect((await request.post(`${FAKE_API_URL}/__test/notifications`, { data: { count: 2 } })).status()).toBe(204);
  await signIn(page, 'admin');
  const second = await context.newPage();
  await signIn(second, 'reviewer');

  // Tab 1 still acts as the Admin: it opens an Admin-only page and its writes carry the Admin account.
  await page.goto('/admin/projects');
  await expect(page.getByRole('button', { name: 'Tạo dự án' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tài khoản Quản trị Một' })).toBeVisible();
  await page.goto('/admin/notifications');
  await page.locator('main').getByRole('button', { name: 'Đánh dấu đã đọc hết' }).click();
  expect((await writes(page, /\/notifications\/read-all/)).map((c) => c.user)).toEqual([ACCOUNTS.admin]);
  await second.reload();
  await expect(second.getByRole('button', { name: 'Tài khoản Reviewer Một' })).toBeVisible();

  // Signing out in tab 2 leaves tab 1 signed in as the Admin.
  await second.getByRole('button', { name: 'Tài khoản Reviewer Một' }).click();
  await second.getByRole('menuitem', { name: 'Đăng xuất' }).click();
  await expect(second).toHaveURL(/\/login/);
  await page.reload();
  await expect(page).toHaveURL(/\/admin\/notifications/);
  await expect(page.getByRole('button', { name: 'Tài khoản Quản trị Một' })).toBeVisible();
});
