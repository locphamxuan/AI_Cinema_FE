import { callApi, expect, signIn, test, writes } from './fixtures';

test('ST-WEB-36 the Admin creates an ad from a name and a video only, then pauses it', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/ads');
  await expect(page.getByText('Danh sách quảng cáo')).toBeVisible();
  await expect(page.getByText('Nước cam')).toBeVisible();

  await page.getByRole('button', { name: 'Tạo quảng cáo' }).click();
  const form = page.getByRole('dialog');
  // No click-through link and no priority: every active ad has the same chance at a cue.
  await expect(form.getByText(/Link khi người xem bấm/)).toHaveCount(0);
  await expect(form.getByText(/Mức ưu tiên/)).toHaveCount(0);
  await form.getByPlaceholder('Ví dụ: Giới thiệu gói Tháng').fill('Trà sữa');
  await form.getByPlaceholder('https://…').fill('https://cdn.example/ads/tra-sua.mp4');
  await form.getByRole('button', { name: 'Tạo quảng cáo' }).click();
  await expect(page.getByText('Đã tạo quảng cáo')).toBeVisible();
  await expect(page.getByText('Trà sữa', { exact: true })).toBeVisible();

  const [created] = await writes(page, /^\/admin\/ads$/);
  expect(created.body).toEqual({ title: 'Trà sữa', mediaUrl: 'https://cdn.example/ads/tra-sua.mp4' });

  await page.getByRole('button', { name: 'Tạm dừng' }).first().click();
  await expect(page.getByText('Đã tạm dừng')).toBeVisible();

  // The API refuses the removed fields even when a caller bypasses the form.
  expect(await callApi(page, 'POST', '/admin/ads', { title: 'X', mediaUrl: 'https://cdn.example/x.mp4', weight: 2 })).toBe(400);
});
