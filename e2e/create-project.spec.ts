import { expect, signIn, test } from './fixtures';

test('ST-WEB-04 the Admin creates a project with idea, genre, reviewer and budget', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/projects');
  await page.getByRole('button', { name: 'Tạo dự án' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Tạo dự án phim')).toBeVisible();
  await dialog.getByLabel('Tên phim').fill('Dự án thử nghiệm');
  await dialog.getByLabel(/Ý tưởng phim/).fill('Một câu chuyện thử nghiệm dài hơn hai mươi ký tự.');

  // Pick the first genre chip (the genre list loads from the API).
  const genre = dialog.locator('[role="group"]').first().getByRole('button').first();
  await expect(genre).toBeVisible();
  await genre.click();

  // First real Reviewer in the list (index 0 is the placeholder).
  await dialog.getByLabel('Reviewer phụ trách').selectOption({ index: 1 });
  await dialog.getByLabel(/Ngân sách sản xuất/).fill('200.000.000');

  await dialog.getByRole('button', { name: 'Tạo dự án' }).click();
  await expect(page.getByText('Đã tạo dự án')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]{36}/);
});