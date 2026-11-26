import { callApi, expect, signIn, test } from './fixtures';

const ALLEY = '/projects/11111111-1111-4111-8111-000000000005';

test('ST-WEB-10 the Admin sets the budget once, the Reviewer asks for more with a quote and the Admin grants less', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto(`/admin${ALLEY}?tab=fee`);
  const form = page.getByRole('region', { name: 'Đặt ngân sách sản xuất' });
  await form.getByLabel('Số tiền').fill('200.000.000');
  await form.getByRole('button', { name: 'Đặt ngân sách' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Đặt ngân sách' }).click();
  await expect(page.getByText('Đã đặt ngân sách')).toBeVisible();
  // Set once: the form now only corrects it with a reason, and a second budget is refused by the API.
  await expect(page.getByRole('region', { name: 'Điều chỉnh ngân sách' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Đặt ngân sách sản xuất' })).toHaveCount(0);
  expect(await callApi(page, 'POST', `${ALLEY}/costs/entries`, { entryType: 'BUDGET', amountVnd: 300_000_000 })).toBe(409);

  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${ALLEY}?tab=fee`);
  const ask = page.getByRole('region', { name: 'Yêu cầu thêm chi phí sản xuất' });
  await ask.getByLabel('Studio báo giá').fill('260.000.000');
  // The amount asked is the gap between the quote and the budget left.
  await expect(ask.getByLabel('Số tiền xin thêm')).toHaveValue('60000000');
  await ask.getByLabel(/Lý do/).fill('Studio cần thêm chi phí dựng cảnh đêm.');
  await ask.getByLabel('Báo giá / bằng chứng (bắt buộc)').setInputFiles({ name: 'bao-gia.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 quote') });
  await ask.getByRole('button', { name: 'Gửi yêu cầu cho Admin' }).click();
  await expect(page.getByText('Đã gửi yêu cầu cho Admin')).toBeVisible();
  await expect(ask.getByText('Chờ Admin duyệt', { exact: true })).toBeVisible();

  await signIn(page, 'admin');
  await page.goto('/admin/requests?tab=costs');
  const request = page.getByRole('listitem').filter({ hasText: 'Studio cần thêm chi phí dựng cảnh đêm.' });
  await request.getByLabel('Số tiền cấp').fill('40.000.000');
  await request.getByRole('button', { name: 'Cấp', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cấp chi phí' }).click();
  await expect(page.getByText('Đã cấp thêm chi phí')).toBeVisible();

  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${ALLEY}?tab=fee`);
  await expect(page.getByRole('region', { name: 'Yêu cầu thêm chi phí sản xuất' }).getByText(/Đã cấp 40\.000\.000/)).toBeVisible();
  await expect(page.getByText('Admin đã cấp')).toBeVisible();
});
