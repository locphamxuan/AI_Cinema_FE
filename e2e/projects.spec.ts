import { expect, signIn, test } from './fixtures';

test('smoke: the Admin project list shows every seeded project', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/projects');
  await expect(page.getByRole('heading', { name: /Dự án phim/ }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ánh sáng cuối' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mùa đông ấm' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bến cảng' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tạo dự án' })).toBeVisible();
});

test('smoke: the Reviewer project list only shows projects in their charge', async ({ page }) => {
  await signIn(page, 'reviewer');
  await page.goto('/reviewer/projects');
  await expect(page.getByRole('heading', { name: 'Danh sách dự án' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Xin chào, Reviewer Một' })).toBeVisible();
  // A project in another Reviewer's charge is not on this list.
  await expect(page.getByRole('heading', { name: 'Bến cảng' })).toHaveCount(0);
});

test('smoke: the Creator project list only shows projects assigned to them', async ({ page }) => {
  await signIn(page, 'creator');
  await expect(page.getByRole('heading', { name: 'Dự án kịch bản' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Xin chào, Creator Một' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bến cảng' })).toHaveCount(0);
});