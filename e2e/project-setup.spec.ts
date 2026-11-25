import { callApi, expect, signIn, test, writes } from './fixtures';

const WINTER = '/projects/11111111-1111-4111-8111-000000000002';
const MONSOON = '/projects/11111111-1111-4111-8111-000000000004';

test('ST-WEB-05 the Reviewer adds a season with deadlines and an idea file, and a file of a wrong type is refused', async ({ page }) => {
  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${WINTER}?tab=episodes`);
  await page.getByRole('button', { name: 'Thêm mùa' }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mùa 2 phát hành từ').fill('2027-01-01');
  await dialog.getByLabel('Mùa 2 phát hành đến').fill('2027-06-30');
  await dialog.getByLabel('Tên tập 3').fill('Mùa xuân');
  await dialog.getByLabel('Hạn giao tập 3').fill('2027-02-01');
  await dialog.getByRole('button', { name: 'Thêm mùa' }).click();
  await expect(page.getByText('Đã thêm mùa')).toBeVisible();
  const season = page.getByRole('region', { name: 'Phần 2 (trọn bộ)' });
  await expect(season.getByRole('link', { name: 'Mùa xuân' })).toBeVisible();
  const [added] = await writes(page, /\/seasons$/);
  expect(added.body).toMatchObject({ releaseStartDate: '2027-01-01', episodes: [{ title: 'Mùa xuân', deliveryDeadline: '2027-02-01' }] });

  // An idea file goes up; an executable is refused by the API and never listed.
  await page.getByRole('tab', { name: 'Tổng quan & Ý tưởng' }).click();
  const ideas = page.getByRole('region', { name: 'Tệp ý tưởng gửi Studio' });
  const input = ideas.locator('input[type="file"]');
  await input.setInputFiles({ name: 'y-tuong.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 idea') });
  await expect(ideas.getByText('y-tuong.pdf')).toBeVisible();
  await input.setInputFiles({ name: 'cong-cu.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ') });
  await expect(page.getByText('Không thực hiện được')).toBeVisible();
  await expect(page.getByText(/Tệp phải là .* và nội dung phải khớp đuôi tệp/)).toBeVisible();
  await expect(ideas.getByText('cong-cu.exe')).toHaveCount(0);
});

test('ST-WEB-06 the Admin assigns the lead, the Reviewer adds a co-Creator and an episode, the Creator writes a note', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto(`/admin${WINTER}`);
  await page.getByRole('button', { name: 'Giao cho Creator' }).click();
  await page.getByRole('dialog').getByRole('combobox').selectOption({ label: 'Creator Một (creator@aicinema.vn)' });
  await page.getByRole('dialog').getByRole('button', { name: 'Giao' }).click();
  await expect(page.getByLabel('Trạng thái dự án, mùa và tập').getByText('Đã giao Creator')).toBeVisible();

  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${WINTER}?tab=team`);
  await page.getByRole('button', { name: 'Thêm Creator' }).click();
  await page.getByRole('dialog').getByLabel('Creator', { exact: true }).selectOption({ label: 'Creator Hai (creator2@aicinema.vn)' });
  await page.getByRole('dialog').getByRole('button', { name: 'Thêm', exact: true }).click();
  const team = page.getByRole('region', { name: 'Phân công Creator' });
  await expect(team.getByRole('row', { name: /Creator Hai/ })).toBeVisible();
  await page.getByRole('tab', { name: 'Mùa & tập phim' }).click();
  await page.getByLabel('Creator phụ trách tập 2').selectOption({ label: 'Creator Hai (0 tập)' });
  await expect(page.getByText('Đã giao tập')).toBeVisible();
  await page.getByRole('tab', { name: 'Nhóm Creator' }).click();
  await expect(team.getByRole('row', { name: /Creator Hai/ })).toContainText('Tập 2');

  // The lead Creator has no way to add members, and the API refuses one sent anyway.
  await signIn(page, 'creator');
  await page.goto(`/creator${WINTER}?tab=team`);
  await expect(page.getByRole('region', { name: 'Phân công Creator' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thêm Creator' })).toHaveCount(0);
  expect(await callApi(page, 'POST', `${WINTER}/creators`, { creatorId: '00000000-0000-4000-8000-000000000005' })).toBe(403);

  await page.getByRole('tab', { name: 'Tổng quan & Ý tưởng' }).click();
  await page.getByLabel('Nội dung trao đổi').fill('Giữ tông ấm áp, cao trào ở tập cuối.');
  await page.getByRole('button', { name: 'Gửi trao đổi' }).click();
  const notes = page.getByRole('region', { name: 'Trao đổi ý tưởng' });
  await expect(notes.getByText('Giữ tông ấm áp, cao trào ở tập cuối.')).toBeVisible();
  await expect(notes.getByText('Creator Một')).toBeVisible();
});

test('ST-WEB-07 the Admin cancels a project with a reason; the Reviewer has no cancel action and the API refuses it', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto(`/admin${WINTER}`);
  await page.getByRole('button', { name: 'Huỷ dự án' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Lý do huỷ').fill('Đối tác rút vốn đầu tư.');
  await dialog.getByRole('button', { name: 'Huỷ dự án' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Dự án đã bị huỷ' })).toContainText('Đối tác rút vốn đầu tư.');
  await expect(page.getByRole('button', { name: 'Huỷ dự án' })).toHaveCount(0);

  // A Reviewer's own open project, with no published episode, offers no cancel action; the API answers 403.
  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${MONSOON}`);
  await expect(page.getByRole('heading', { name: 'Gió mùa' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Huỷ dự án' })).toHaveCount(0);
  expect(await callApi(page, 'POST', `${MONSOON}/cancel`, { reason: 'Reviewer thử huỷ dự án.' })).toBe(403);
  expect((await writes(page, /\/cancel$/)).map((c) => c.user)).toEqual(['admin@aicinema.vn']);
});
