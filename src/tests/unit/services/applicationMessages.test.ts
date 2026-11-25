import { describe, expect, it } from 'vitest';
import { APPLICATION_MESSAGES, localizeApiError } from '@/lib/applicationMessages';

describe('application messages', () => {
  it('localizes the backend authentication and account errors', () => {
    expect(localizeApiError('Incorrect email or password', 401, undefined, '/auth/login')).toBe(
      APPLICATION_MESSAGES.MSG05.message,
    );
    expect(localizeApiError('An account with this email already exists', 409, undefined, '/auth/register')).toBe(
      APPLICATION_MESSAGES.MSG06.message,
    );
    expect(localizeApiError('This account has been deactivated', 403, undefined, '/auth/login')).toBe(
      APPLICATION_MESSAGES.MSG08.message,
    );
  });

  it('localizes BE business errors using their messages and detail reasons', () => {
    expect(
      localizeApiError('The wallet does not hold enough Coins for this purchase', 422, undefined, '/episodes/e1/purchase'),
    ).toBe(APPLICATION_MESSAGES.MSG12.message);
    expect(localizeApiError('The episode is not published', 409, undefined, '/episodes/e1/purchase')).toBe(
      APPLICATION_MESSAGES.MSG13.message,
    );
    expect(
      localizeApiError('The episode cannot be released yet (BR-19)', 409, ['review'], '/episodes/e1/publications'),
    ).toBe(APPLICATION_MESSAGES.MSG14.message);
    expect(
      localizeApiError('The request is invalid', 400, ['email must be an email'], '/auth/register'),
    ).toBe(APPLICATION_MESSAGES.MSG03.message);
  });

  it('keeps the reason of any other business rule the backend refuses', () => {
    const handoff = 'Every episode needs a delivery deadline before the studio is contracted';
    expect(localizeApiError(handoff, 409, undefined, '/projects/m1/handoff')).toBe(
      'Mỗi tập cần có hạn giao phim trước khi ký hợp đồng với Studio.',
    );
    expect(localizeApiError('Only a failed delivery can be processed again', 400, undefined, '/media/a1/retry')).toBe(
      'Chỉ bản phim xử lý lỗi mới xử lý lại được.',
    );
    expect(localizeApiError('Season not found in this project', 404, undefined, '/projects/m1/handoff')).toBe(
      'Không tìm thấy mùa phim trong dự án.',
    );
    expect(localizeApiError('Cannot sign a contract that is SENT (expected STUDIO_SIGNED or ADMIN_COUNTERED)', 409, undefined, '/c')).toBe(
      'Không thể ký hợp đồng đang ở trạng thái Đã gửi Studio (cần Studio đã ký hoặc Admin đề xuất giá mới).',
    );
  });

  it('never shows what the server said about a session, rate limit or server fault', () => {
    expect(localizeApiError('Invalid refresh token', 401, undefined, '/auth/refresh')).toBe(
      'Hết hạn đăng nhập, vui lòng đăng nhập lại.',
    );
    expect(localizeApiError('ThrottlerException: Too Many Requests', 429, undefined, '/movies')).toBe(
      APPLICATION_MESSAGES.MSG19.message,
    );
    expect(localizeApiError('relation "users" does not exist', 500, undefined, '/movies')).toBe(
      APPLICATION_MESSAGES.MSG18.message,
    );
  });

  it('uses Vietnamese fallbacks for common HTTP statuses', () => {
    expect(localizeApiError(undefined, 403, undefined, '/projects')).toBe(APPLICATION_MESSAGES.MSG09.message);
    expect(localizeApiError(undefined, 404, undefined, '/movies/missing')).toBe(APPLICATION_MESSAGES.MSG10.message);
    expect(localizeApiError(undefined, 429, undefined, '/movies')).toBe(APPLICATION_MESSAGES.MSG19.message);
    expect(localizeApiError(undefined, 500, undefined, '/movies')).toBe(APPLICATION_MESSAGES.MSG18.message);
  });
  it('names what a release still misses (BR-19) instead of a generic refusal', () => {
    expect(
      localizeApiError('The episode cannot be released yet (BR-19)', 409, ['the movie synopsis', 'the movie age rating'], '/episodes/e1/publications'),
    ).toBe('Chưa thể phát hành tập này. Còn thiếu: tóm tắt phim (Reviewer điền ở tab Tổng quan); độ tuổi phim (Reviewer điền ở tab Tổng quan).');
    expect(localizeApiError('The episode cannot be released yet (BR-19)', 409, undefined, '/episodes/e1/publications')).toBe(
      APPLICATION_MESSAGES.MSG14.message,
    );
  });
});

describe('API messages in Vietnamese', () => {
  it('words a business refusal of the API in Vietnamese, values kept', () => {
    expect(localizeApiError('Only a month that is over can be allocated', 409, undefined, '/finance')).toBe(
      'Chỉ chia doanh thu cho tháng đã kết thúc.',
    );
    expect(localizeApiError('Studio "Sao Việt" is deactivated', 409, undefined, '/projects')).toBe(
      'Studio "Sao Việt" đã ngừng hoạt động.',
    );
  });

  it('names a missing policy by its Vietnamese type', () => {
    expect(
      localizeApiError('No AI_LABELING policy is in force; ask an Admin to activate one', 409, undefined, '/media-assets'),
    ).toBe('Chưa có chính sách "Gắn nhãn AI" nào đang áp dụng; hãy nhờ Admin bật.');
  });

  it('never shows English it cannot word, and keeps Vietnamese as is', () => {
    expect(localizeApiError('Some new English refusal', 409, undefined, '/x')).toMatch(/tải lại/);
    expect(localizeApiError('Some new English refusal', 418, undefined, '/x')).toBe('Không thực hiện được thao tác này. Vui lòng thử lại.');
    expect(localizeApiError('Tập đã có giá.', 409, undefined, '/x')).toBe('Tập đã có giá.');
    expect(localizeApiError('', 404, undefined, '/x')).toBe(APPLICATION_MESSAGES.MSG10.message);
  });

  it('words the signature image and legal profile refusals of a contract', () => {
    expect(localizeApiError('The signature image is 100x20 px; it must be at least 150x50 px', 400, undefined, '/x')).toBe(
      'Ảnh chữ ký 100x20 px quá nhỏ: cần ít nhất 150x50 px.',
    );
    expect(
      localizeApiError(
        'The studio legal profile is incomplete (taxCode, bankAccount); complete it before signing the contract',
        409,
        undefined,
        '/x',
      ),
    ).toBe('Hồ sơ pháp lý của Studio còn thiếu (mã số thuế, số tài khoản). Studio cần điền đủ trên Studio Web trước khi ký hợp đồng.');
  });

  it('words the newer refusals of the structure, filters, pricing, accounts and refunds', () => {
    expect(localizeApiError('A movie has at most 20 seasons', 409, { reason: 'SEASON_LIMIT_REACHED' }, '/x')).toBe('Một phim có tối đa 20 mùa.');
    expect(localizeApiError('A season has at most 100 episodes', 409, undefined, '/x')).toBe('Một mùa có tối đa 100 tập.');
    expect(localizeApiError('filter.status has an invalid value: OOPS', 400, undefined, '/x')).toBe('Bộ lọc có giá trị không hợp lệ: OOPS.');
    expect(localizeApiError('dueDate must be a calendar day (YYYY-MM-DD), without a time', 400, undefined, '/x')).toBe(
      'Ngày phải là một ngày trên lịch, không kèm giờ.',
    );
    expect(localizeApiError('The studio of this project changed meanwhile; reload it', 409, undefined, '/x')).toBe(
      'Studio của dự án vừa thay đổi; hãy tải lại.',
    );
    expect(localizeApiError('A Studio login keeps its role; lock it instead', 409, undefined, '/users/u1')).toMatch(/khoá tài khoản/);
    expect(
      localizeApiError('This bonus row could not be linked to its payment; refund the payment from its first row', 409, undefined, '/x'),
    ).toMatch(/dòng đầu tiên/);
  });

  it('tells the Admin the corrected wallet is short, not "your wallet"', () => {
    const details = { reason: 'INSUFFICIENT_COINS' };
    expect(localizeApiError('The wallet does not hold that many main Coins', 422, details, '/admin/wallet-adjustments')).toBe(
      'Ví này không đủ Coin cho lần trừ này. Hãy xem lại số dư hiện tại.',
    );
    expect(localizeApiError('The episode has no Coin price', 409, undefined, '/episodes/e1/purchase')).toBe(
      APPLICATION_MESSAGES.MSG13.message,
    );
  });
});
