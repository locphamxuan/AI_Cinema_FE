import { ACCOUNTS, expect, fillLogin, test } from './fixtures';

// The form's error box (the Next.js route announcer also carries role="alert").
const formAlert = (page: import('@playwright/test').Page) => page.locator('[role="alert"].text-destructive');

test('ST-WEB-02 the back office refuses Member, STUDIO and locked accounts', async ({ page }) => {
  // A Member account belongs to the mobile app, not this back office.
  await fillLogin(page, ACCOUNTS.member);
  await expect(formAlert(page)).toContainText('ứng dụng di động');
  await expect(page).toHaveURL(/\/login/);

  // A STUDIO account signs in on Studio Web; here it is refused with a link there.
  await page.goto('/login');
  await fillLogin(page, ACCOUNTS.studio);
  await expect(formAlert(page)).toContainText('Studio Web');
  await expect(page.getByRole('link', { name: 'Đăng nhập Studio Web' })).toBeVisible();
  await expect(page).toHaveURL(/\/login/);

  // A locked account is refused and no session opens.
  await page.goto('/login');
  await fillLogin(page, ACCOUNTS.locked);
  await expect(formAlert(page)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});