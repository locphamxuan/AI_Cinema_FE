import { FAKE_API_URL } from './env';
import { ACCOUNTS, expect, PASSWORD, signIn, test } from './fixtures';

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
test('ST-WEB-38 the Admin scans, locks the member of a risky top-up (signed out at once), then unlocks the account', async ({ page, request }) => {
  const login = await request.post(`${FAKE_API_URL}/auth/login`, { data: { email: ACCOUNTS.member, password: PASSWORD } });
  const memberToken = (await login.json()).accessToken as string;
  const asMember = () => request.get(`${FAKE_API_URL}/notifications`, { headers: { Authorization: `Bearer ${memberToken}` } });
  expect((await asMember()).status()).toBe(200);

  await signIn(page, 'admin');
  await page.goto('/admin/finance?tab=risk');
  const risk = page.getByRole('region', { name: 'Giao dịch rủi ro' });
  await risk.getByRole('button', { name: 'Kiểm tra ngay' }).click();
  await expect(page.getByText('Tìm thấy 1 giao dịch rủi ro mới')).toBeVisible();

  const row = risk.getByRole('row').filter({ hasText: 'Nạp 6000000 VND trong một lần' });
  await row.getByRole('button', { name: 'Khoá tài khoản' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Khoá tài khoản' })).toBeDisabled();
  await dialog.getByLabel(/Lý do khoá/).fill('Nạp lớn bất thường');
  await dialog.getByRole('button', { name: 'Khoá tài khoản' }).click();
  await expect(page.getByText('Đã khoá tài khoản Member Một')).toBeVisible();
  expect((await asMember()).status()).toBe(401);

  await risk.getByRole('combobox', { name: 'Lọc theo trạng thái' }).selectOption('ACCOUNT_LOCKED');
  await expect(risk.getByRole('row').filter({ hasText: 'Nạp lớn bất thường' })).toContainText('Đã khoá tài khoản');
  await risk.getByRole('link', { name: 'Mở khoá ở trang Tài khoản' }).first().click();
  await expect(page).toHaveURL(/tab=accounts/);
  const account = page.locator('table').getByRole('row').filter({ hasText: 'member@aicinema.vn' });
  await account.getByRole('button', { name: 'Mở khoá' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Mở khoá' }).click();
  await expect(page.getByText('Đã mở khoá tài khoản')).toBeVisible();
});
