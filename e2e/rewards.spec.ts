import { FAKE_API_URL } from './env';
import { ACCOUNTS, expect, PASSWORD, signIn, test } from './fixtures';

test('ST-WEB-30 the Admin deletes a wheel prize, but not the last active one', async ({ page, request }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/rewards');
  await expect(page.getByRole('heading', { name: 'Vòng quay may mắn' })).toBeVisible();

  // Deleting one active prize is fine while another stays active.
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