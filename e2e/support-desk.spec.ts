import { callApi, expect, signIn, test } from './fixtures';

test('ST-WEB-25 Staff reads the member wallet and plan, then claims, drafts with AI, replies and resolves the case once', async ({ page }) => {
  await signIn(page, 'staff');
  await page.getByRole('region', { name: 'Hàng chờ hỗ trợ' }).getByRole('button', { name: /Member Một/ }).click();
  const detail = page.getByRole('region', { name: 'Chi tiết yêu cầu' });

  // The member's data is read only: no correction here, and the API refuses one from Staff.
  await detail.getByRole('tab', { name: 'Bối cảnh Member' }).click();
  await expect(detail.getByRole('region', { name: 'Ví Coin' })).toContainText('Coin chính120');
  await expect(detail.getByRole('region', { name: 'Gói thành viên' })).toContainText('Gói Tháng');
  await expect(detail.getByText('Chỉ đọc. Điều chỉnh Coin, gói hay thiết bị do Admin làm ở màn quản trị tương ứng.')).toBeVisible();
  await expect(detail.getByRole('textbox')).toHaveCount(0);
  expect(await callApi(page, 'POST', '/admin/wallet-adjustments', { userId: '00000000-0000-4000-8000-000000000007', mainDelta: 50, reason: 'Bù Coin nạp lỗi' })).toBe(403);

  await detail.getByRole('tab', { name: 'Hội thoại' }).click();
  await detail.getByRole('button', { name: 'Nhận yêu cầu' }).click();
  await expect(page.getByText('Đã nhận yêu cầu', { exact: true })).toBeVisible();
  await detail.getByRole('button', { name: 'Gợi ý bằng AI' }).click();
  const reply = detail.getByLabel('Trả lời Member');
  await expect(reply).toHaveValue(/50 Coin đã vào ví của bạn/);
  await expect(detail.getByText(/Bản nháp AI · độ tin cậy 82%/)).toBeVisible();
  await reply.fill('Chào bạn, 50 Coin đã vào ví. Bạn mở lại ứng dụng để thấy số dư mới nhé.');
  await detail.getByRole('button', { name: 'Gửi', exact: true }).click();
  await expect(page.getByText('Đã gửi cho Member')).toBeVisible();
  await expect(detail.getByText('Chào bạn, 50 Coin đã vào ví. Bạn mở lại ứng dụng để thấy số dư mới nhé.')).toBeVisible();

  await detail.getByRole('button', { name: 'Đã giải quyết xong' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Đã giải quyết xong' }).click();
  await expect(page.getByText('Đã báo Member: chờ Member xác nhận')).toBeVisible();
  await expect(detail.getByText('Chờ Member xác nhận').first()).toBeVisible();
  await expect(detail.getByRole('button', { name: 'Đã giải quyết xong' })).toHaveCount(0);

  // D-14: resolving the case again is accepted but changes nothing, so the transcript does not grow.
  const transcript = detail.getByRole('listitem');
  const before = await transcript.count();
  expect(before).toBeGreaterThan(3);
  expect(await callApi(page, 'POST', '/admin/support/conversations/case-0001/resolve', {})).toBe(200);
  await page.reload();
  await page.getByRole('region', { name: 'Hàng chờ hỗ trợ' }).getByRole('button', { name: 'Chờ Member xác nhận' }).click();
  await page.getByRole('region', { name: 'Hàng chờ hỗ trợ' }).getByRole('button', { name: /Member Một/ }).click();
  await expect(transcript).toHaveCount(before);
});
