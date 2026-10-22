export const APPLICATION_MESSAGES = {
  MSG01: {
    type: 'Inline',
    scenario: 'A movie, episode, or catalog search returns no results.',
    message: 'Không có phim nào khớp bộ lọc. Hãy thử bỏ bớt điều kiện.',
  },
  MSG02: {
    type: 'Inline, under the field',
    scenario: 'A required field is empty.',
    message: 'Trường này là bắt buộc.',
  },
  MSG03: {
    type: 'Inline or toast',
    scenario: 'Request data is invalid.',
    message: 'Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại các trường.',
  },
  MSG04: {
    type: 'Toast',
    scenario: 'Member registration succeeds.',
    message: 'Tài khoản của bạn đã được tạo thành công.',
  },
  MSG05: {
    type: 'Inline, under the form',
    scenario: 'The email or password is incorrect during sign-in.',
    message: 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.',
  },
  MSG06: {
    type: 'Inline, under the email field',
    scenario: 'The email address is already registered.',
    message: 'Email này đã được đăng ký tài khoản.',
  },
  MSG07: {
    type: 'Inline, under the date-of-birth field',
    scenario: 'A person under 18 attempts to register.',
    message: 'AI Cinema chỉ dành cho khán giả từ 18 tuổi trở lên.',
  },
  MSG08: {
    type: 'Inline or toast',
    scenario: 'A deactivated account attempts to sign in.',
    message: 'Tài khoản này đã bị vô hiệu hóa.',
  },
  MSG09: {
    type: 'Inline or toast',
    scenario: 'The user does not have permission to perform an action.',
    message: 'Bạn không có quyền thực hiện thao tác này.',
  },
  MSG10: {
    type: 'Inline or toast',
    scenario: 'A requested movie, episode, or other record does not exist or is unavailable.',
    message: 'Không tìm thấy nội dung yêu cầu hoặc nội dung hiện không khả dụng.',
  },
  MSG11: {
    type: 'Toast',
    scenario: 'A profile or project update succeeds.',
    message: 'Thông tin đã được cập nhật thành công.',
  },
  MSG12: {
    type: 'Inline or toast',
    scenario: 'A Member does not have enough Coins for a purchase.',
    message: 'Ví của bạn không đủ Coin cho giao dịch này.',
  },
  MSG13: {
    type: 'Inline or toast',
    scenario: 'An attempt is made to purchase an unpublished, free, or already-unlocked episode.',
    message: 'Không thể mua tập này. Tập có thể chưa phát hành, miễn phí hoặc đã được mở khóa.',
  },
  MSG14: {
    type: 'Inline or toast',
    scenario: 'An episode is not ready for publication.',
    message: 'Chưa thể phát hành tập này. Vui lòng hoàn tất các bước kiểm duyệt, gắn nhãn, tuân thủ và định giá.',
  },
  MSG15: {
    type: 'Toast',
    scenario: 'An episode is scheduled or published successfully.',
    message: 'Đã cập nhật trạng thái phát hành tập phim thành công.',
  },
  MSG16: {
    type: 'Toast',
    scenario: 'A project is cancelled successfully.',
    message: 'Đã hủy dự án thành công.',
  },
  MSG17: {
    type: 'Toast',
    scenario: 'A Coin refund is issued after permanent content removal.',
    message: 'Bạn đã được hoàn Coin vì nội dung này đã bị gỡ vĩnh viễn.',
  },
  MSG18: {
    type: 'Inline or toast',
    scenario: 'The API encounters an unexpected server error.',
    message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
  },
  MSG19: {
    type: 'Inline or toast',
    scenario: 'A request exceeds the allowed rate limit.',
    message: 'Bạn đang gửi yêu cầu quá nhanh. Vui lòng đợi một chút rồi thử lại.',
  },
} as const;

export function localizeApiError(
  rawMessage: unknown,
  status: number,
  rawDetails: unknown,
  endpoint: string,
): string {
  if (Array.isArray(rawMessage)) return APPLICATION_MESSAGES.MSG03.message;

  const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';
  const normalized = message.toLowerCase();
  const reason =
    typeof rawDetails === 'object' && rawDetails !== null && 'reason' in rawDetails ? rawDetails.reason : undefined;

  if (reason === 'INSUFFICIENT_COINS' || normalized.includes('does not hold enough coins')) {
    return APPLICATION_MESSAGES.MSG12.message;
  }
  if (
    ['EPISODE_NOT_PUBLISHED', 'EPISODE_NOT_PRICED', 'ACCESS_ALREADY_OWNED'].includes(String(reason)) ||
    normalized.includes('episode is not published') ||
    normalized.includes('episode has no coin price') ||
    normalized.includes('episode is free') ||
    normalized.includes('episode is already unlocked')
  ) {
    return APPLICATION_MESSAGES.MSG13.message;
  }
  if (normalized.includes('cannot be released yet')) return APPLICATION_MESSAGES.MSG14.message;
  if (normalized.includes('viewers aged 18 or older')) return APPLICATION_MESSAGES.MSG07.message;
  if (normalized.includes('account with this email already exists')) return APPLICATION_MESSAGES.MSG06.message;
  if (normalized === 'incorrect email or password') return APPLICATION_MESSAGES.MSG05.message;
  if (normalized.includes('account has been deactivated')) return APPLICATION_MESSAGES.MSG08.message;
  if (normalized.includes('requires the permission') || normalized === 'forbidden resource') {
    return APPLICATION_MESSAGES.MSG09.message;
  }
  if (
    normalized === 'the request is invalid' ||
    normalized === 'birthday cannot be in the future' ||
    normalized.includes('validation failed')
  ) {
    return APPLICATION_MESSAGES.MSG03.message;
  }
  if (
    normalized.includes('not found') ||
    normalized.includes('does not exist') ||
    normalized.includes('could not be found')
  ) {
    return APPLICATION_MESSAGES.MSG10.message;
  }
  if (normalized === 'an unexpected error occurred') return APPLICATION_MESSAGES.MSG18.message;

  if (status === 429) return APPLICATION_MESSAGES.MSG19.message;
  if (status === 401 && endpoint.includes('/auth/login')) return APPLICATION_MESSAGES.MSG05.message;
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return APPLICATION_MESSAGES.MSG09.message;
  if (status === 404) return APPLICATION_MESSAGES.MSG10.message;
  if (status === 400 || status === 422) return APPLICATION_MESSAGES.MSG03.message;
  if (status >= 500) return APPLICATION_MESSAGES.MSG18.message;

  return message || `HTTP error! status: ${status}`;
}
