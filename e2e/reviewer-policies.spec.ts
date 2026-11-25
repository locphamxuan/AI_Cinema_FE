import { expect, signIn, test } from './fixtures';

test('ST-WEB-32 the Reviewer reads only the policies in force, read-only', async ({ page }) => {
  await signIn(page, 'reviewer');
  await page.goto('/reviewer/policies');

  await expect(page.getByRole('heading', { name: 'Chính sách đang áp dụng', level: 2 })).toBeVisible();
  // The three in-force policies are shown, grouped by type (one summary per policy).
  await expect(page.locator('summary')).toHaveCount(3);
  // Read-only: no create, edit or hide controls.
  await expect(page.getByRole('button', { name: 'Thêm chính sách' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sửa' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Tạm ẩn' })).toHaveCount(0);
});