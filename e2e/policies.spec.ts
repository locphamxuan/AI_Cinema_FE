import { FAKE_API_URL } from './env';
import { ACCOUNTS, expect, PASSWORD, signIn, test } from './fixtures';

test('ST-WEB-31 the Admin creates a plain-text policy, switches it off, and cannot switch off the last in force', async ({ page, request }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/policies');

  // Create a policy from the text box.
  await page.getByRole('button', { name: 'Thêm chính sách' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Tiêu đề').fill('Chính sách thử nghiệm');
  await dialog.getByRole('textbox', { name: /Nội dung/ }).fill('Mọi tập do AI tạo phải gắn nhãn rõ ràng.\n- Nhãn hiện trên màn hình.');
  await dialog.getByRole('button', { name: 'Thêm chính sách' }).click();
  await expect(page.getByText('Đã thêm chính sách')).toBeVisible();

  // Switch it off after the confirmation.
  const row = page.getByRole('row').filter({ hasText: 'Chính sách thử nghiệm' });
  await row.getByRole('button', { name: 'Tắt' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Tắt' }).click();
  await expect(page.getByText('Đã tắt chính sách')).toBeVisible();

  // The last policy in force of a type cannot be switched off (409 POLICY_LAST_IN_FORCE).
  const login = await request.post(`${FAKE_API_URL}/auth/login`, { data: { email: ACCOUNTS.admin, password: PASSWORD } });
  const { accessToken } = (await login.json()) as { accessToken: string };
  const res = await request.patch(`${FAKE_API_URL}/policies/pol-ai`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { isActive: false },
  });
  expect(res.status()).toBe(409);
});