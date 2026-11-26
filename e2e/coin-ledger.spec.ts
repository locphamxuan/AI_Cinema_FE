import { expect, signIn, test } from './fixtures';

test('ST-WEB-37 the Admin finds the Coin rows of one account and reads its wallet, without changing any balance', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/coin-transactions');
  const ledger = page.getByRole('region', { name: 'Giao dịch Coin' });

  // Every row names the account it belongs to.
  await expect(ledger.getByRole('row').filter({ hasText: 'member@aicinema.vn' })).toContainText('Member Một');
  await expect(ledger.getByRole('row').filter({ hasText: 'ha@test.vn' })).toContainText('Trần Thu Hà');

  await ledger.getByRole('searchbox', { name: 'Tìm theo tên hoặc email tài khoản' }).fill('ha@test');
  await expect(ledger.getByRole('row').filter({ hasText: 'member@aicinema.vn' })).toHaveCount(0);
  await expect(ledger.getByRole('row').filter({ hasText: 'ha@test.vn' })).toHaveCount(1);

  await ledger.getByRole('button', { name: 'Xem ví của Trần Thu Hà' }).click();
  const wallet = page.getByRole('dialog');
  await expect(wallet).toContainText('Trần Thu Hà · ha@test.vn');
  await expect(wallet).toContainText('Coin chính50');
  await expect(wallet.getByRole('button', { name: /Điều chỉnh/ })).toHaveCount(0);
});
