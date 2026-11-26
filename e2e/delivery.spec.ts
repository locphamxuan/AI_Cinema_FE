import { apiAs, expect, signIn, test, writes } from './fixtures';

const LIGHT = '/projects/11111111-1111-4111-8111-000000000001';
const MONSOON = '/projects/11111111-1111-4111-8111-000000000004';
const episode = (n: number) => `44444444-0000-4000-8000-${String(n).padStart(12, '0')}`;

test('ST-WEB-14 a delivered episode lists its versions and processing state, with no delivery buttons', async ({ page }) => {
  for (const who of ['reviewer', 'creator', 'admin'] as const) {
    await signIn(page, who);
    await page.goto(`/${who}${LIGHT}/episodes/${episode(4)}`);
    await expect(page.getByRole('heading', { name: 'Tập 4: Lối về' })).toBeVisible();
    const versions = page.getByRole('region', { name: 'Các bản Studio đã nộp' });
    await expect(versions.getByRole('button', { name: /Bản 2/ })).toContainText('Đang xử lý video');
    await expect(versions.getByRole('button', { name: /Bản 2/ })).toContainText('Xử lý video 40%');
    await expect(versions.getByRole('button', { name: /Bản 1/ })).toContainText('Lỗi');
    await expect(page.getByText('Hệ thống đang xử lý bản này, trang tự cập nhật.')).toBeVisible();
    // Only the studio delivers or reprocesses, on Studio Web.
    await expect(page.getByRole('button', { name: /^(Nộp|Tải lên|Xử lý lại|Giao bản)/ })).toHaveCount(0);
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  }
});

test('ST-WEB-15 the Reviewer requests changes, then approves the new version, labels it and passes the four checks', async ({ page, request }) => {
  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${LIGHT}/episodes/${episode(3)}`);
  await page.getByRole('region', { name: 'Phiếu duyệt - bản 1' }).getByRole('button', { name: 'Yêu cầu sửa' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Tài khoản Studio nhận thông báo kèm nhận xét này');
  await dialog.getByLabel(/Nhận xét/).fill('Phút 03:10 nhân vật bị méo mặt.');
  await dialog.getByRole('button', { name: 'Gửi yêu cầu sửa' }).click();
  await expect(page.getByText('Đã gửi yêu cầu sửa cho Studio')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tập 3: Ánh sáng' }).locator('..')).toContainText('Yêu cầu sửa');
  const [sent] = await writes(page, /\/reviews$/);
  expect(sent).toMatchObject({ user: 'reviewer@aicinema.vn', body: { decision: 'CHANGES_REQUESTED', comments: 'Phút 03:10 nhân vật bị méo mặt.' } });

  // The studio delivers version 2 on Studio Web.
  await (await apiAs(request, 'studio'))('POST', `/studio-portal/episodes/${episode(3)}/media`, { sourceMethod: 'HLS_URL' });
  await page.reload();
  const sheet = page.getByRole('region', { name: 'Phiếu duyệt - bản 2' });
  await sheet.getByRole('button', { name: 'Duyệt' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Duyệt bản này' }).click();
  await expect(page.getByText('Đã duyệt bản này')).toBeVisible();

  const label = page.getByRole('region', { name: 'Nhãn nội dung AI' });
  await label.getByRole('button', { name: 'Gắn nhãn' }).click();
  await expect(label).toContainText('Loại nhãn đã gắn');

  const checks = page.getByRole('form', { name: 'Kết quả kiểm tra tuân thủ' });
  await checks.getByRole('radio', { name: 'Đạt', exact: true }).nth(0).check();
  await checks.getByRole('radio', { name: 'Đạt', exact: true }).nth(1).check();
  await checks.getByRole('radio', { name: 'Không', exact: true }).check();
  await checks.getByRole('checkbox', { name: 'Tôi đã đối chiếu tập phim với các chính sách đang áp dụng' }).check();
  await checks.getByRole('button', { name: 'Xác nhận đã kiểm tra và đạt' }).click();
  await expect(page.getByText('Tập đạt kiểm tra tuân thủ')).toBeVisible();
  const results = page.getByRole('region', { name: 'Kiểm tra pháp lý và an toàn nội dung' }).getByRole('listitem');
  await expect(results).toHaveCount(4);
  for (const check of ['Có nhãn AI', 'Thông báo theo Nghị định 142', 'An toàn nội dung', 'Không giả mạo người/sự kiện thật']) {
    await expect(results.filter({ hasText: check })).toContainText('Đạt');
  }
  await expect(page.getByRole('heading', { name: 'Tập 3: Ánh sáng' }).locator('..')).toContainText('Đạt kiểm tra');
});

test('ST-WEB-16 the Reviewer confirms the Final Film after a confirmation dialog and the Admins are notified', async ({ page }) => {
  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${MONSOON}/episodes/${episode(7)}`);
  const final = page.getByRole('region', { name: 'Phim bản cuối' });
  await final.getByRole('button', { name: 'Xác nhận Phim bản cuối' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Admin được báo để đặt giá Coin');
  await dialog.getByRole('button', { name: 'Xác nhận Phim bản cuối' }).click();
  await expect(page.getByText('Đã xác nhận Phim bản cuối, Admin được báo')).toBeVisible();
  await expect(final).toContainText('Reviewer đã xác nhận Phim bản cuối lúc');

  await signIn(page, 'admin');
  await page.goto('/admin/notifications');
  await expect(page.locator('main').getByText('Phim bản cuối tập 1 của "Gió mùa" chờ phát hành.')).toBeVisible();
});
