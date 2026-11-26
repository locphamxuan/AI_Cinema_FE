import { expect, signIn, test } from './fixtures';

test('ST-WEB-28 the Admin dashboard shows metric cards and the project status breakdown', async ({ page }) => {
  await signIn(page, 'admin');
  await page.getByRole('tab', { name: 'Biểu đồ doanh thu & vận hành' }).click();
  await expect(page.getByRole('heading', { name: 'Tổng quan hệ thống' })).toBeVisible();
  await expect(page.getByText('Doanh thu theo gói thành viên')).toBeVisible();
  await expect(page.getByText('Số tập phim theo dự án')).toBeVisible();
  await expect(page.getByText('Trạng thái dự án phim')).toBeVisible();
  await expect(page.getByText('Tài khoản theo vai trò')).toBeVisible();
  // No error note: the revenue report loaded.
  await expect(page.getByText('Không tải được')).toHaveCount(0);
});