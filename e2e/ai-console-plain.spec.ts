import { expect, signIn, test } from './fixtures';

test('ST-WEB-35 the Admin hides, restores and deletes a knowledge article in plain words', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/support/ai');

  const row = page.getByRole('row').filter({ hasText: 'Bài mẫu' });
  await expect(row).toBeVisible();
  // Plain wording: no article code or model name leaks into the list.
  await expect(row).not.toContainText('kb-1');
  await expect(row).not.toContainText('fake-chat');

  // Hide it, then use it again.
  await row.getByRole('button', { name: 'Tạm ẩn' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Tạm ẩn' }).click();
  await expect(page.getByText('Đã tạm ẩn bài')).toBeVisible();
  await row.getByRole('button', { name: 'Dùng lại' }).click();
  await expect(page.getByText('Bài được dùng lại')).toBeVisible();

  // Delete it for good, only after the confirmation.
  await row.getByRole('button', { name: 'Xoá' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xoá hẳn' }).click();
  await expect(page.getByText('Đã xoá bài')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Bài mẫu' })).toHaveCount(0);
});