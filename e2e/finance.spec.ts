import { expect, signIn, test } from './fixtures';

test('ST-WEB-23 the Admin opens the finance reports and the risk-flag tab', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/finance');

  // Both report tabs are offered and the profit report loads.
  await expect(page.getByRole('link', { name: 'Lợi nhuận từng phim' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Giao dịch rủi ro' })).toBeVisible();
  await expect(page.getByText('Không tải được')).toHaveCount(0);

  // The risk-flag tab opens without an error.
  await page.getByRole('link', { name: 'Giao dịch rủi ro' }).click();
  await expect(page).toHaveURL(/tab=risk/);
  await expect(page.getByText('Không tải được')).toHaveCount(0);
});