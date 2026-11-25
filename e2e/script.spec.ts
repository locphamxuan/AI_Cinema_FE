import type { Page } from '@playwright/test';
import { expect, signIn, test, writes } from './fixtures';

const ALLEY = '/projects/11111111-1111-4111-8111-000000000005';

async function submitScript(page: Page, content: string) {
  await page.getByLabel(/Nội dung kịch bản/).fill(content);
  await page.getByRole('button', { name: 'Nộp cho Reviewer' }).click();
  await expect(page.getByText(/Đã nộp, chờ Reviewer duyệt/).first()).toBeVisible();
}

test('ST-WEB-08 the Creator submits the script, the Reviewer approves it and the Admin approves the Final Script', async ({ page }) => {
  await signIn(page, 'creator');
  await page.goto(`/creator${ALLEY}?tab=script`);
  await submitScript(page, 'CẢNH 1 - NỘI. CĂN HỘ - ĐÊM\nAn nhìn ra con hẻm vắng.');

  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${ALLEY}?tab=script`);
  await expect(page.getByText('Bản 1 đang chờ Reviewer phụ trách duyệt.')).toBeVisible();
  await page.getByRole('button', { name: 'Duyệt kịch bản' }).click();
  await expect(page.getByText('Reviewer đã duyệt, chờ Admin').first()).toBeVisible();

  await signIn(page, 'admin');
  await page.goto(`/admin${ALLEY}?tab=script`);
  await page.getByRole('button', { name: 'Đồng ý Kịch bản bản cuối' }).click();
  await expect(page.getByText('Đã duyệt Kịch bản bản cuối, hợp đồng mẫu đã gửi Studio')).toBeVisible();
  await expect(page.getByText('Kịch bản bản cuối (bản 1) đã khoá; hệ thống đã gửi hợp đồng mẫu cho Studio.')).toBeVisible();

  // The studio now has its template contract: round 1, sent and waiting for its signature.
  await page.getByRole('tab', { name: 'Hợp đồng' }).click();
  const contract = page.getByRole('region', { name: 'Hợp đồng với Studio Lumen Studio' });
  await expect(contract.getByText(/Vòng 1 · Studio Lumen Studio/)).toBeVisible();
  await expect(contract.getByText('Đã gửi Studio, chờ Studio ký')).toBeVisible();
  expect((await writes(page, /\/script\//)).map((c) => [c.path.split('/').pop(), c.user])).toEqual([
    ['versions', 'creator@aicinema.vn'],
    ['review', 'reviewer@aicinema.vn'],
    ['final-review', 'admin@aicinema.vn'],
  ]);
});

test('ST-WEB-09 the Reviewer sends the script back with a required comment and version 2 waits for review', async ({ page }) => {
  await signIn(page, 'creator');
  await page.goto(`/creator${ALLEY}?tab=script`);
  await submitScript(page, 'CẢNH 1 - NGOẠI. HẺM - NGÀY');

  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${ALLEY}?tab=script`);
  await page.getByRole('button', { name: 'Yêu cầu sửa' }).click();
  const dialog = page.getByRole('dialog');
  // The comment is required: the send button stays off until there is one.
  await expect(dialog.getByRole('button', { name: 'Gửi yêu cầu sửa' })).toBeDisabled();
  await dialog.getByLabel('Góp ý cho Creator').fill('Thêm cảnh mở đầu giới thiệu nhân vật chính.');
  await dialog.getByRole('button', { name: 'Gửi yêu cầu sửa' }).click();
  await expect(page.getByText('Cần sửa').first()).toBeVisible();

  await signIn(page, 'creator');
  await page.goto(`/creator${ALLEY}?tab=script`);
  await expect(page.getByText('Thêm cảnh mở đầu giới thiệu nhân vật chính.')).toBeVisible();
  await page.getByLabel(/Nội dung kịch bản/).fill('CẢNH 0 - NỘI. NHÀ AN - SÁNG\nCẢNH 1 - NGOẠI. HẺM - NGÀY');
  await page.getByLabel(/Ghi chú thay đổi/).fill('Thêm cảnh mở đầu.');
  await page.getByRole('button', { name: 'Nộp cho Reviewer' }).click();
  await expect(page.getByText('Bản 2 đang chờ Reviewer phụ trách duyệt.')).toBeVisible();
});
