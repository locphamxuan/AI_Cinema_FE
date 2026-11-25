import { expect, HOME, signIn, test } from './fixtures';

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