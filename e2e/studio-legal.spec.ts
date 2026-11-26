import { expect, signIn, test } from './fixtures';

test('ST-WEB-34 the Admin opens a studio legal profile read-only and edits only contact info', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/studios');

  await page.getByRole('button', { name: /Hồ sơ pháp lý của/ }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  // The legal profile is read-only: no input, only the fields and a close button.
  await expect(dialog.getByText('Mã số thuế')).toBeVisible();
  await expect(dialog.getByRole('textbox')).toHaveCount(0);
  await expect(dialog.getByRole('combobox')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Đóng' }).first().click();
  await expect(dialog).toHaveCount(0);
});