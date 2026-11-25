import type { APIRequestContext, Page } from '@playwright/test';
import { apiAs, expect, signIn, SIGNATURE_PNG_PATH, test, writes } from './fixtures';

const ALLEY = '/projects/11111111-1111-4111-8111-000000000005';
const LIGHT = '/projects/11111111-1111-4111-8111-000000000001';

/** "Hẻm nhỏ" up to the Final Script: budget set, script submitted, approved by the Reviewer then the Admin. */
async function finalScriptApproved(request: APIRequestContext) {
  const admin = await apiAs(request, 'admin');
  await admin('POST', `${ALLEY}/costs/entries`, { entryType: 'BUDGET', amountVnd: 200_000_000 });
  await (await apiAs(request, 'creator'))('POST', `${ALLEY}/script/versions`, { content: 'CẢNH 1 - NGOẠI. HẺM - ĐÊM' });
  await (await apiAs(request, 'reviewer'))('POST', `${ALLEY}/script/review`, { approve: true });
  await admin('POST', `${ALLEY}/script/final-review`, { approve: true });
  const [round] = await admin('GET', `${ALLEY}/contracts`);
  return { studio: await apiAs(request, 'studio'), roundId: round.id as string };
}

const rounds = (page: Page) => page.getByRole('region', { name: 'Hợp đồng với Studio Lumen Studio' }).getByRole('listitem');

test('ST-WEB-11 the studio proposes, the Admin counters in whole thousands, both sign and production starts', async ({ page, request }) => {
  const { studio, roundId } = await finalScriptApproved(request);
  await studio('POST', `/studio-portal/contracts/${roundId}/propose`, { costVnd: '180000000' }, true);

  await signIn(page, 'admin');
  await page.goto(`/admin${ALLEY}?tab=contract`);
  const first = rounds(page).filter({ hasText: 'Vòng 1' });
  await expect(first.getByText('Studio đã ký, chờ Admin')).toBeVisible();
  await expect(first.getByText(/Chi phí Studio báo giá: 180\.000\.000/)).toBeVisible();
  await first.getByRole('button', { name: 'Đề xuất giá khác' }).click();

  // An amount that is not whole thousands is flagged under the field while the cursor stays in it.
  const price = first.getByLabel('Giá mới', { exact: true });
  await price.pressSequentially('150000500');
  await expect(first.getByText('Nhập số tiền dương, là bội số của 1.000 ₫ (ví dụ 120.000.000).')).toBeVisible();
  await expect(price).toBeFocused();
  await expect(first.getByRole('button', { name: 'Gửi giá cho Studio' })).toBeDisabled();
  await price.fill('150.000.000');
  await first.getByLabel('Ảnh chữ ký AI Cinema cho giá mới').setInputFiles(SIGNATURE_PNG_PATH);
  await first.getByRole('button', { name: 'Gửi giá cho Studio' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Ký và gửi giá' }).click();
  await expect(page.getByText('Đã gửi mức giá mới cho Studio')).toBeVisible();
  const second = rounds(page).filter({ hasText: 'Vòng 2' });
  await expect(second.getByText('Admin đề xuất giá mới, chờ Studio')).toBeVisible();
  const [counter] = await writes(page, /\/counter$/);
  expect(counter.body).toMatchObject({ costVnd: '150000000', files: [{ field: 'file', contentType: 'image/png' }] });

  // The studio signs the Admin's price on Studio Web: the round carries both signatures.
  const [, next] = await (await apiAs(request, 'admin'))('GET', `${ALLEY}/contracts`);
  await studio('POST', `/studio-portal/contracts/${next.id}/sign`, {}, true);
  await page.reload();
  await expect(second.getByText('Đã ký đủ 2 bên')).toBeVisible();
  await expect(first.getByText('Đã thay bằng vòng mới')).toBeVisible();
  await expect(second.getByText('Đã tự động giao việc cho Studio')).toBeVisible();
  await expect(page.getByLabel('Trạng thái dự án, mùa và tập').getByText('Studio đang sản xuất')).toBeVisible();
  await page.getByRole('tab', { name: 'Mùa & tập phim' }).click();
  await expect(page.getByText('Chờ Studio giao')).toHaveCount(2);
});

test('ST-WEB-12 the Reviewer reads the rounds and signed PDFs, the Creator only the rounds, and neither can decide', async ({ page }) => {
  await signIn(page, 'reviewer');
  await page.goto(`/reviewer${LIGHT}?tab=contract`);
  const signed = rounds(page).filter({ hasText: 'Vòng 1' });
  await expect(signed.getByText('Đã ký đủ 2 bên')).toBeVisible();
  await expect(signed.getByText(/Chi phí Studio báo giá: 100\.000\.000/)).toBeVisible();
  await expect(signed.getByRole('button', { name: 'Bản hoàn tất (đủ 2 chữ ký)' })).toBeVisible();
  await expect(signed.getByRole('button', { name: 'Bản Studio đã ký' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Đồng ý và ký|Đề xuất giá khác/ })).toHaveCount(0);

  await signIn(page, 'creator');
  await page.goto(`/creator${LIGHT}?tab=contract`);
  const seen = rounds(page).filter({ hasText: 'Vòng 1' });
  await expect(seen.getByText('Đã ký đủ 2 bên')).toBeVisible();
  await expect(page.getByText('Bạn chỉ xem các vòng thương lượng.', { exact: false })).toBeVisible();
  await expect(seen.getByText(/Chi phí/)).toHaveCount(0);
  await expect(seen.getByRole('button')).toHaveCount(0);
});

test('ST-WEB-13 a studio change sends the new studio only the brief and supersedes the open round', async ({ page }) => {
  await signIn(page, 'admin');
  const change = async (name: string, email: string, reason: string) => {
    await page.getByRole('button', { name: 'Đổi Studio', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Tên Studio').fill(name);
    await dialog.getByLabel('Email Studio').fill(email);
    await dialog.getByLabel('Phí đề xuất').fill('90.000.000');
    await dialog.getByLabel(/Lý do đổi Studio/).fill(reason);
    await dialog.getByRole('button', { name: 'Đổi Studio', exact: true }).click();
    await expect(page.getByText('Đã đổi Studio, gửi bản yêu cầu và hợp đồng mẫu cho Studio mới').last()).toBeVisible();
  };
  await page.goto(`/admin${LIGHT}?tab=studio`);
  await change('Nova Studio', 'nova@studio.vn', 'Lumen chậm tiến độ hai tuần.');

  const timeline = page.getByRole('region', { name: 'Dòng thời gian Studio' });
  const nova = timeline.getByRole('listitem').filter({ hasText: 'nova@studio.vn' });
  await expect(nova.getByText('Đã gửi bản yêu cầu').first()).toBeVisible();
  await expect(nova.getByText('Lý do đổi Studio: Lumen chậm tiến độ hai tuần.')).toBeVisible();
  // The new studio gets the brief PDF and nothing else; the old studio's materials stay with its hand-off.
  await expect(nova.getByRole('button', { name: 'Tải bản yêu cầu' })).toBeVisible();
  await expect(nova.getByRole('button', { name: /^Tải / })).toHaveCount(1);
  const lumen = timeline.getByRole('listitem').filter({ hasText: 'studio@aicinema.vn' });
  await expect(lumen.getByText('Đã đổi Studio')).toBeVisible();

  // Changing again before Nova signed closes Nova's open round.
  await change('Sao Studio', 'sao@studio.vn', 'Nova không nhận lịch sản xuất.');
  await page.getByRole('tab', { name: 'Hợp đồng' }).click();
  const novaRound = page.getByRole('region', { name: 'Hợp đồng với Studio Nova Studio' }).getByRole('listitem');
  await expect(novaRound.getByText('Đã thay bằng vòng mới')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Hợp đồng với Studio Sao Studio' }).getByText('Đã gửi Studio, chờ Studio ký')).toBeVisible();
});

test('ST-WEB-33 the Admin countersigns with a signature image after a PDF is refused before sending', async ({ page, request }) => {
  const { studio, roundId } = await finalScriptApproved(request);
  await studio('POST', `/studio-portal/contracts/${roundId}/propose`, {}, true);

  await signIn(page, 'admin');
  await page.goto(`/admin${ALLEY}?tab=contract`);
  const round = rounds(page).filter({ hasText: 'Vòng 1' });
  await expect(round.getByText('Studio đã ký, chờ Admin')).toBeVisible();
  const signature = round.getByLabel('Ảnh chữ ký AI Cinema (ký theo giá Studio)');
  await signature.setInputFiles({ name: 'hop-dong.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await expect(round.getByRole('alert')).toHaveText('Ảnh chữ ký phải là file PNG hoặc JPG.');
  await expect(round.getByRole('button', { name: 'Đồng ý và ký' })).toBeDisabled();

  await signature.setInputFiles(SIGNATURE_PNG_PATH);
  await expect(round.getByRole('img', { name: 'Xem trước chữ ký' })).toBeVisible();
  await round.getByRole('button', { name: 'Đồng ý và ký' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý và ký' }).click();
  await expect(page.getByText('Đã ký, hợp đồng hoàn tất')).toBeVisible();
  await expect(round.getByText('Đã ký đủ 2 bên')).toBeVisible();

  // Only the PNG was sent; the round now offers the studio's copy, AI Cinema's and the one with both signatures.
  const signs = await writes(page, /\/contracts\/[^/]+\/sign$/);
  expect(signs).toHaveLength(1);
  expect(signs[0].body).toMatchObject({ files: [{ field: 'file', fileName: 'signature.png', contentType: 'image/png' }] });
  for (const copy of ['Bản Studio đã ký', 'Bản AI Cinema ký', 'Bản hoàn tất (đủ 2 chữ ký)']) {
    await expect(round.getByRole('button', { name: copy })).toBeVisible();
  }
  const download = page.waitForEvent('download');
  await round.getByRole('button', { name: 'Bản hoàn tất (đủ 2 chữ ký)' }).click();
  expect((await download).suggestedFilename()).toBe('hop-dong-final.pdf');
});
