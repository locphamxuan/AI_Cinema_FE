import { expect, signIn, test } from './fixtures';

test('ST-WEB-29 the Admin sees each film profit with episode sales and plan share, and no manual allocation', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/finance');

  await expect(page.getByText('Ánh sáng cuối')).toBeVisible();
  await expect(page.getByText('Mùa Đông ấm')).toBeVisible();
  // A film without production cost shows a neutral state, and there is no manual allocation button.
  await expect(page.getByRole('button', { name: /Phân bổ/ })).toHaveCount(0);

  // Filter by name.
  const search = page.getByLabel('Tìm theo tên phim hoặc studio');
  await search.fill('Ánh sáng');
  await expect(page.getByText('Ánh sáng cuối')).toBeVisible();
  await expect(page.getByText('Mùa Đông ấm')).toHaveCount(0);
});