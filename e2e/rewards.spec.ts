import { FAKE_API_URL } from './env';
import { ACCOUNTS, expect, PASSWORD, signIn, test } from './fixtures';

test('ST-WEB-30 the Admin rebalances the wheel in percent, then deletes a prize for good, but not the last active one', async ({ page, request }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/rewards');
  await expect(page.getByRole('heading', { name: 'Vòng quay may mắn' })).toBeVisible();
  await expect(page.getByText('2/3 giải đang bật · Tổng tỉ lệ 100%')).toBeVisible();

  // Deleting an active prize while others are on asks to switch it off with new chances first.
  await page.getByRole('button', { name: 'Xoá Giải B' }).click();
  const chances = page.getByRole('dialog', { name: 'Chia lại tỉ lệ trúng' });
  await expect(chances).toContainText('Tắt giải và chia lại tỉ lệ');
  await expect(chances).toContainText('còn thiếu 40%');
  await expect(chances.getByRole('button', { name: 'Lưu tỉ lệ' })).toBeDisabled();
  await chances.getByLabel('Tỉ lệ trúng (%) của Giải A').fill('100');
  await chances.getByRole('button', { name: 'Lưu tỉ lệ' }).click();
  await expect(page.getByText('Đã lưu tỉ lệ trúng')).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Bật giải Giải B trên vòng quay' })).toHaveAttribute('aria-checked', 'false');

  // Now switched off, it is deleted for real.
  await page.getByRole('button', { name: 'Xoá Giải B' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xoá vĩnh viễn' }).click();
  await expect(page.getByText('Đã xoá giải')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Giải B' })).toHaveCount(0);

  // Deleting the last active prize is refused with 409 REWARD_PRIZE_LAST_ACTIVE.
  const login = await request.post(`${FAKE_API_URL}/auth/login`, { data: { email: ACCOUNTS.admin, password: PASSWORD } });
  const { accessToken } = (await login.json()) as { accessToken: string };
  const res = await request.delete(`${FAKE_API_URL}/admin/reward-prizes/pz-a`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(res.status()).toBe(409);
});

test('ST-WEB-39 the Admin adds a prize in percent; a total that is not 100% is refused until rebalanced', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/rewards');
  await page.getByRole('button', { name: 'Thêm giải' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/Số Coin thưởng/).fill('30');
  await dialog.getByLabel(/Tỉ lệ trúng/).fill('12,5');
  await expect(dialog.getByRole('alert')).toContainText('thừa 12,5%');
  await expect(dialog.getByRole('button', { name: 'Thêm giải' })).toBeDisabled();
  // Added switched off, it is switched on later with the new chances.
  await dialog.getByRole('switch').uncheck();
  await dialog.getByRole('button', { name: 'Thêm giải' }).click();
  await expect(page.getByText('Đã thêm giải vào vòng quay')).toBeVisible();

  await page.getByRole('switch', { name: 'Bật giải 30 Coin thưởng trên vòng quay' }).click();
  const chances = page.getByRole('dialog', { name: 'Chia lại tỉ lệ trúng' });
  await expect(chances).toContainText('thì tổng là 112,5%');
  await chances.getByLabel('Tỉ lệ trúng (%) của Giải A').fill('47,5');
  await expect(chances).toContainText('Tổng các giải bật: 100%');
  await chances.getByRole('button', { name: 'Lưu tỉ lệ' }).click();
  await expect(page.getByText('3/4 giải đang bật · Tổng tỉ lệ 100%')).toBeVisible();
});
