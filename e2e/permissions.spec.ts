import { expect, signIn, test } from './fixtures';

test('ST-WEB-20 the Admin changes a role permission and confirms', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/permissions?tab=roles');
  await expect(page.getByRole('heading', { name: 'Phân quyền theo vai trò' }).first()).toBeVisible();
  await expect(page.getByText('5 quyền khả dụng')).toBeVisible();

  // Staff does not hold project:create yet; grant it, then save the change.
  const cell = page.getByRole('checkbox', { name: 'Staff: Tạo dự án phim' });
  await expect(cell).toHaveAttribute('aria-checked', 'false');
  await cell.click();
  await page.getByRole('button', { name: 'Lưu 1 vai trò' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Lưu phân quyền' }).click();
  await expect(page.getByText('Đã lưu phân quyền')).toBeVisible();
});