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
});
