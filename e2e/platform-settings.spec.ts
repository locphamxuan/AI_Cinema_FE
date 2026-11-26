import { expect, signIn, test } from './fixtures';

test('ST-WEB-21 the Admin edits the Coin rate and saves the platform settings', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/settings');
  await expect(page.getByRole('heading', { name: 'Cài đặt nền tảng', level: 2 })).toBeVisible();

  const rate = page.getByLabel('Tỷ giá Coin');
  await expect(rate).toHaveValue('1000');
  await rate.fill('1500');

  await page.getByRole('button', { name: 'Lưu (1)' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Lưu cài đặt' }).click();
  await expect(page.getByText('Đã lưu cài đặt')).toBeVisible();
  await expect(rate).toHaveValue('1500');
});