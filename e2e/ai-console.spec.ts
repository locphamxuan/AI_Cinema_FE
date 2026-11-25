import { expect, signIn, test } from './fixtures';

test('ST-WEB-24 the Admin writes, publishes and deletes a knowledge article', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/support/ai');

  // Write a new article and publish it for the AI.
  await page.getByRole('button', { name: 'Thêm bài' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Tiêu đề').fill('Bài thử nghiệm');
  await dialog.getByLabel('Chủ đề').fill('Gói Tháng');
  await dialog.getByRole('textbox', { name: /Nội dung/ }).fill('## Câu hỏi\nTrả lời ngắn gọn.');
  await dialog.getByRole('button', { name: 'Lưu và cho AI dùng' }).click();
  await expect(page.getByText(/AI sẽ đọc bài/)).toBeVisible();

  // The article is listed; delete it after the confirmation.
  const row = page.getByRole('row').filter({ hasText: 'Bài thử nghiệm' });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Xoá' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xoá hẳn' }).click();
  await expect(page.getByText('Đã xoá bài')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Bài thử nghiệm' })).toHaveCount(0);
});