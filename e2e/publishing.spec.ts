import { callApi, expect, signIn, test, writes } from './fixtures';

const LIGHT = '/projects/11111111-1111-4111-8111-000000000001';
const MONSOON = '/projects/11111111-1111-4111-8111-000000000004';
const episode = (n: number) => `44444444-0000-4000-8000-${String(n).padStart(12, '0')}`;
const title = (page: import('@playwright/test').Page, name: string) => page.getByRole('heading', { name }).locator('..');

test('ST-WEB-17 the Admin prices an episode, publishes it, schedules another, and cannot publish before confirmation', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto(`/admin${MONSOON}/episodes/${episode(8)}`);
  const release = page.getByRole('region', { name: 'Định giá & phát hành' });
  const price = release.getByLabel(/Giá Coin \(khoảng hợp lệ 1–100\)/);
  await price.fill('500');
  await expect(release.getByText('Giá ngoài khoảng: vẫn lưu được nhưng Admin sẽ nhận cảnh báo.')).toBeVisible();
  await release.getByRole('button', { name: 'Lưu giá' }).click();
  await expect(page.getByText('Đã lưu giá - giá ngoài khoảng nên Admin được báo')).toBeVisible();
  await price.fill('20');
  await release.getByRole('button', { name: 'Lưu giá' }).click();
  await expect(page.getByText('Đã lưu giá Coin')).toBeVisible();
  await release.getByRole('checkbox', { name: 'Miễn phí cho thành viên (Member)' }).check();
  await expect(page.getByText('Đã cập nhật quyền xem miễn phí của tập')).toBeVisible();

  await release.getByRole('button', { name: 'Phát hành ngay' }).click();
  await expect(page.getByRole('dialog')).toContainText('Thành viên');
  await page.getByRole('dialog').getByRole('button', { name: 'Phát hành' }).click();
  await expect(page.getByText('Tập đã phát hành')).toBeVisible();
  await expect(title(page, 'Tập 2: Mưa rào')).toContainText('Đã phát hành');
  expect((await writes(page, /\/episodes\//)).map((c) => c.body)).toEqual([{ coinPrice: 500 }, { coinPrice: 20 }, { isFreeForGuest: false, isFreeForMember: true }, {}]);

  // The out-of-range price raised an alert for the Admin.
  await page.goto('/admin/settings?tab=price-alerts');
  await expect(page.getByRole('listitem').filter({ hasText: 'Gió mùa - tập 2: Mưa rào' })).toContainText('Giá đặt 500 Coin');

  await page.goto(`/admin${MONSOON}/episodes/${episode(9)}`);
  await page.getByLabel('Lên lịch lúc').fill('2027-03-01T20:00');
  await page.getByRole('button', { name: 'Lên lịch', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Lên lịch' }).click();
  await expect(page.getByText('Đã lên lịch phát hành')).toBeVisible();
  await expect(title(page, 'Tập 3: Nắng lên')).toContainText('Đã lên lịch');
  expect((await writes(page, /\/publications$/)).at(-1)?.body).toEqual({ scheduledAt: '2027-03-01T13:00:00.000Z' });

  // Episode 1 passed the checks but the Reviewer has not confirmed it: no release here, and the API answers 409.
  await page.goto(`/admin${MONSOON}/episodes/${episode(7)}`);
  await expect(page.getByText('Chờ Reviewer xác nhận Phim bản cuối trước khi phát hành.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Phát hành ngay' })).toBeDisabled();
  expect(await callApi(page, 'POST', `/episodes/${episode(7)}/publications`)).toBe(409);
});

test('ST-WEB-18 a take-down for revision goes back through the Reviewer, a removal refunds the Coins', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto(`/admin${LIGHT}`);
  await expect(page.getByText(/Đang sửa/)).toHaveCount(0);
  await page.goto(`/admin${LIGHT}/episodes/${episode(1)}`);
  await page.getByRole('button', { name: 'Gỡ tập' }).click();
  let dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('radio', { name: 'Gỡ để sửa' })).toBeChecked();
  await dialog.getByLabel(/Nhận xét gửi Reviewer/).fill('Lỗi âm thanh ở phút 05:00.');
  await dialog.getByRole('button', { name: 'Gỡ tập' }).click();
  await expect(page.getByText('Đã gỡ tập để sửa')).toBeVisible();
  await expect(title(page, 'Tập 1: Khởi đầu')).toContainText('Yêu cầu sửa');

  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${LIGHT}`);
  await expect(page.getByRole('status').filter({ hasText: 'Đang sửa' })).toHaveText('Đang sửa 1 tập: mùa 1: tập 1');
  await page.goto(`/reviewer${LIGHT}/episodes/${episode(1)}`);
  await expect(page.getByText(/Tập đã bị gỡ để sửa/)).toBeVisible();
  await expect(page.getByText('Taken down to be fixed: Lỗi âm thanh ở phút 05:00.')).toBeVisible();
  await expect(title(page, 'Tập 1: Khởi đầu')).toContainText('Yêu cầu sửa');

  await signIn(page, 'admin');
  await page.goto(`/admin${LIGHT}/episodes/${episode(2)}`);
  await page.getByRole('button', { name: 'Gỡ tập' }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: 'Gỡ hẳn' }).check();
  await expect(dialog).toContainText('người đã mua được hoàn Coin');
  await dialog.getByLabel(/Ghi chú/).fill('Vi phạm bản quyền nhạc nền.');
  await dialog.getByRole('button', { name: 'Gỡ tập' }).click();
  await expect(page.getByText('Đã gỡ hẳn tập')).toBeVisible();
  await expect(title(page, 'Tập 2: Bóng tối')).toContainText('Đã gỡ');

  // The member who bought episode 2 got the 10 Coins back.
  await page.goto('/admin/coin-transactions');
  await expect(page.getByRole('row').filter({ hasText: 'Hoàn Coin' })).toContainText('+10');
});

test('ST-WEB-19 the Admin sends a confirmed Final Film back; the Reviewer sees the reason and the studio is not contacted', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto(`/admin${MONSOON}/episodes/${episode(9)}`);
  await page.getByRole('region', { name: 'Phim bản cuối' }).getByRole('button', { name: 'Trả lại qua Reviewer' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/Lý do/).fill('Ảnh bìa và đoạn kết chưa khớp kịch bản.');
  await dialog.getByRole('button', { name: 'Trả lại' }).click();
  await expect(page.getByText('Đã trả Phim bản cuối lại cho Reviewer')).toBeVisible();

  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${MONSOON}/episodes/${episode(9)}`);
  const final = page.getByRole('region', { name: 'Phim bản cuối' });
  await expect(final.getByRole('note').filter({ hasText: 'Admin trả lại' })).toContainText('Admin trả lại Phim bản cuối: Ảnh bìa và đoạn kết chưa khớp kịch bản.');
  await expect(final.getByRole('button', { name: 'Xác nhận Phim bản cuối' })).toBeVisible();
  // Nothing went to the studio: the episode is still checked, not sent back for changes, and no review was written.
  await expect(title(page, 'Tập 3: Nắng lên')).toContainText('Đạt kiểm tra');
  expect((await writes(page, /^\/(episodes|media-assets|publications)\//)).map((c) => c.path)).toEqual([`/episodes/${episode(9)}/final-rejection`]);
});
