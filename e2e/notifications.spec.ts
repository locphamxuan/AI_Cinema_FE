import { FAKE_API_URL } from './env';
import { expect, signIn, test } from './fixtures';

test('ST-WEB-26 the notification centre filters unread, pages and marks all read', async ({ page, request }) => {
  await signIn(page, 'admin');
  expect((await request.post(`${FAKE_API_URL}/__test/notifications`, { data: { count: 12 } })).status()).toBe(204);

  await page.goto('/admin/notifications');
  await expect(page.getByRole('heading', { name: 'Thông báo hệ thống' })).toBeVisible();
  const main = page.locator('main');
  await expect(main.getByText('(Tổng cộng 12 thông báo)')).toBeVisible();
  // 6 notifications per page.
  await expect(main.locator('[role="button"]').filter({ hasText: 'Thông báo thử' })).toHaveCount(6);

  // Only the unread ones, then mark them all read: the list empties.
  await main.getByLabel('Chỉ xem chưa đọc').check();
  await main.getByRole('button', { name: 'Đánh dấu đã đọc hết' }).click();
  await expect(main.getByText('Không có thông báo nào ở mục này')).toBeVisible();
});