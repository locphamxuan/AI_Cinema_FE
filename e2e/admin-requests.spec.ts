import { expect, signIn, test } from './fixtures';

test('ST-WEB-22 the Admin asks the Reviewer about an out-of-range price and answers the change requests', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/settings?tab=price-alerts');
  const alert = page.getByRole('listitem').filter({ hasText: 'Ánh sáng cuối - tập 1: Khởi đầu' });
  await expect(alert).toContainText('Giá đặt 150 Coin, khoảng hợp lệ 1–100');
  await alert.getByRole('button', { name: 'Hỏi ý kiến Reviewer' }).click();
  await page.getByRole('dialog').getByLabel('Câu hỏi cho Reviewer').fill('Giá 150 Coin có hợp lý cho tập mở đầu không?');
  await page.getByRole('dialog').getByRole('button', { name: 'Gửi câu hỏi' }).click();
  await expect(page.getByText('Đã gửi câu hỏi cho Reviewer')).toBeVisible();
  await page.getByRole('button', { name: 'Tất cả' }).click();
  await expect(alert.getByText('Đã hỏi ý kiến Reviewer')).toBeVisible();
  await alert.getByRole('button', { name: 'Chấp nhận giá' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Chấp nhận giá' }).click();
  await expect(page.getByText('Đã chấp nhận giá này')).toBeVisible();
  await expect(alert.getByText('Đã xử lý')).toBeVisible();

  await page.goto('/admin/requests');
  const approve = page.getByRole('listitem').filter({ hasText: 'Lùi hạn giao tập 3 thêm một tuần.' });
  await approve.getByRole('button', { name: 'Duyệt' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Duyệt đề xuất' }).click();
  const reject = page.getByRole('listitem').filter({ hasText: 'Đổi tên tập 4 thành "Đường về".' });
  await reject.getByRole('button', { name: 'Từ chối' }).click();
  await page.getByRole('dialog').getByLabel(/Lý do/).fill('Tên tập đã in trên poster, giữ nguyên.');
  await page.getByRole('dialog').getByRole('button', { name: 'Từ chối' }).click();
  await page.getByRole('tab', { name: 'Tất cả' }).click();
  await expect(approve.getByText('Admin đã duyệt')).toBeVisible();
  await expect(reject.getByText('Admin từ chối')).toBeVisible();
  await expect(reject).toContainText('Quản trị Một: Tên tập đã in trên poster, giữ nguyên.');

  // Whoever asked hears back: the Reviewer got the price question and the answer to the request.
  await signIn(page, 'reviewer');
  await page.goto('/reviewer/notifications');
  await expect(page.locator('main').getByText(/Admin hỏi ý kiến về giá 150 Coin/)).toBeVisible();
  await expect(page.locator('main').getByText('Admin đã duyệt đề xuất của bạn.')).toBeVisible();
});
