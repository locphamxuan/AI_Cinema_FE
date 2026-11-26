import { expect, signIn, test } from './fixtures';

test('ST-WEB-20 the Admin sees every account with its role and status', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/permissions?tab=accounts');
  await expect(page.getByRole('heading', { name: 'Tài khoản & Phân quyền' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Quản lý tài khoản' })).toBeVisible();
  await expect(page.getByText('9 tài khoản trong hệ thống')).toBeVisible();

  const table = page.locator('table');
  await expect(table.getByText('admin@aicinema.vn')).toBeVisible();
  await expect(table.getByText('reviewer@aicinema.vn')).toBeVisible();
  await expect(table.getByText('creator@aicinema.vn')).toBeVisible();
  await expect(table.getByText('locked@aicinema.vn')).toBeVisible();
  // The Admin can open a new staff account.
  await expect(page.getByRole('button', { name: 'Tạo tài khoản' })).toBeVisible();
});