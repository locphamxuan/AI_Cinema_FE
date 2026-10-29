import type { UserRole } from '@/types/production';

export const BACKEND_ROLES: UserRole[] = ['MEMBER', 'CONTENT_CREATOR', 'CONTENT_REVIEWER', 'STAFF', 'ADMIN'];

/** Roles the Admin can create accounts for; members sign up themselves. */
export const STAFF_ROLES: UserRole[] = ['CONTENT_CREATOR', 'CONTENT_REVIEWER', 'STAFF', 'ADMIN'];

export const BACKEND_ROLE_LABEL: Record<UserRole, string> = {
  MEMBER: 'Thành viên (Khán giả)',
  CONTENT_CREATOR: 'Nhà sáng tạo nội dung',
  CONTENT_REVIEWER: 'Kiểm duyệt viên',
  STAFF: 'Nhân viên vận hành',
  ADMIN: 'Quản trị viên cấp cao',
};

export const ROLE_SHORT_LABEL: Record<UserRole, string> = {
  MEMBER: 'Thành viên',
  CONTENT_CREATOR: 'Creator',
  CONTENT_REVIEWER: 'Reviewer',
  STAFF: 'Vận hành',
  ADMIN: 'Quản trị',
};

export const ROLE_TONE: Record<UserRole, 'purple' | 'emerald' | 'blue' | 'amber' | 'neutral'> = {
  ADMIN: 'purple',
  CONTENT_REVIEWER: 'emerald',
  CONTENT_CREATOR: 'blue',
  STAFF: 'amber',
  MEMBER: 'neutral',
};

/** Groups of the permission catalog (AI_Cinema_BE PERMISSION_CATALOG `area`). */
export const PERMISSION_AREA_LABEL: Record<string, string> = {
  'movie-project': 'Dự án phim điện ảnh',
  studio: 'Studio & Đơn vị sản xuất',
  media: 'Tập phim & Media Ingest',
  review: 'Kiểm duyệt nội dung',
  publishing: 'Phát hành & Bản quyền',
  catalog: 'Danh mục & Thể loại',
  'episode-access': 'Truy cập tập phim & Ví hội viên',
  billing: 'Gói thành viên & Doanh thu',
  coin: 'COIN & Thưởng điểm danh',
  advertising: 'Quảng cáo & Ad Break',
  administration: 'Hệ thống & Quản trị',
  operations: 'Vận hành & Hỗ trợ',
  admin: 'Quản trị hệ thống',
};

/**
 * Vietnamese human-friendly translation and explanation for all system permissions.
 */
export const PERMISSION_VI_MAP: Record<string, { title: string; desc: string }> = {
  // Movie project
  'project:manage': {
    title: 'Khởi tạo & Quản trị dự án phim',
    desc: 'Tạo dự án phim, chỉnh sửa các mùa, tập phim, ý tưởng, gán Creator và hủy dự án.',
  },
  'project:fee.allocate': {
    title: 'Phân bổ ngân sách sản xuất (Token)',
    desc: 'Phân bổ, nạp thêm và điều chỉnh ngân sách Token sản xuất cho từng dự án phim.',
  },
  'project:read.all': {
    title: 'Xem toàn bộ dự án phim trên sàn',
    desc: 'Xem danh sách và tiến độ sản xuất tất cả các dự án phim trên hệ thống (không chỉ dự án của mình).',
  },
  'project:suggest': {
    title: 'Gửi đề xuất thay đổi dự án (BR-55)',
    desc: 'Gửi yêu cầu thay đổi tiến độ, nhân sự hoặc ngân sách kèm lý do và minh chứng rõ ràng.',
  },
  'project:change.review': {
    title: 'Phê duyệt đề xuất thay đổi dự án (BR-55)',
    desc: 'Thẩm định, chấp thuận hoặc từ chối các đề xuất thay đổi gửi từ Reviewer và Creator.',
  },

  // Studio
  'studio:handoff': {
    title: 'Bàn giao dự án cho Studio',
    desc: 'Chuyển giao dự án cho studio sản xuất, đổi đơn vị gia công và nghiệm thu các mốc bàn giao.',
  },
  'studio:manage': {
    title: 'Quản lý danh sách Studio đối tác',
    desc: 'Quản trị danh bạ các xưởng phim & studio liên kết: thêm mới, cập nhật hồ sơ và tạm dừng.',
  },

  // Media
  'media:ingest': {
    title: 'Tải lên tập phim & Media Ingest',
    desc: 'Tải lên video master, phụ đề đa ngôn ngữ và hình ảnh poster do studio bàn giao.',
  },

  // Review
  'content:review': {
    title: 'Kiểm duyệt nội dung & Gán nhãn AI',
    desc: 'Thẩm định nội dung tập phim, kiểm tra tuân thủ chính sách phát sóng và gán nhãn AI công khai.',
  },

  // Publishing
  'episode:publish': {
    title: 'Định giá & Xuất bản tập phim',
    desc: 'Thiết lập giá Coin, lên lịch phát sóng, phát hành chính thức hoặc gỡ tập phim.',
  },
  'price-alert:manage': {
    title: 'Theo dõi & Cảnh báo giá tập phim',
    desc: 'Giám sát các tập phim định giá ngoài khung quy định sàn và gửi yêu cầu điều chỉnh giá.',
  },

  // Catalog
  'genre:manage': {
    title: 'Quản lý thể loại & Phân loại phim',
    desc: 'Thêm mới, sửa đổi và sắp xếp cây phân loại thể loại phim trên nền tảng.',
  },

  // Episode Access & Member
  'access.episode.read': {
    title: 'Kiểm tra quyền truy cập tập phim',
    desc: 'Xem trạng thái mua vé và quyền truy cập tập phim của khán giả để hỗ trợ sự cố.',
  },
  'wallet.read': {
    title: 'Kiểm tra số dư ví Coin',
    desc: 'Xem số dư ví Coin cá nhân và xác nhận khả năng thanh toán khi giao dịch.',
  },
  'wallet.topup': {
    title: 'Nạp Coin vào tài khoản',
    desc: 'Tạo đơn nạp Coin qua cổng thanh toán VNPay và thẻ ngân hàng liên kết.',
  },
  'reward.checkin': {
    title: 'Điểm danh hàng ngày nhận thưởng',
    desc: 'Nhận phần thưởng điểm danh hàng ngày và tham gia vòng quay may mắn.',
  },
  'subscription.self.manage': {
    title: 'Quản lý gói thành viên cá nhân',
    desc: 'Đăng ký, kích hoạt, bật hoặc tắt tự động gia hạn gói hội viên của chính mình.',
  },

  // Billing
  'billing.plan.manage': {
    title: 'Quản lý danh mục gói hội viên',
    desc: 'Tạo mới, chỉnh sửa quyền lợi, giới hạn thiết bị và ẩn/hiện các gói thành viên VIP.',
  },
  'billing.price.manage': {
    title: 'Định giá gói cước theo chu kỳ',
    desc: 'Thiết lập mức giá Coin theo từng chu kỳ thanh toán (tháng, quý, năm) cho các gói.',
  },
  'billing.subscription.read': {
    title: 'Tra cứu danh sách đăng ký gói',
    desc: 'Xem toàn bộ thuê bao đang kích hoạt gói, hạn dùng và lịch sử thu phí định kỳ.',
  },
  'billing.subscription.cancel': {
    title: 'Hủy gói thành viên của người dùng',
    desc: 'Chấm dứt gói hội viên của tài khoản theo yêu cầu hoặc do vi phạm quy chế.',
  },
  'analytics.revenue.read': {
    title: 'Xem báo cáo doanh thu gói cước',
    desc: 'Xem biểu đồ doanh thu theo gói, số lượt thu phí và tăng trưởng tài chính nền tảng.',
  },
  'analytics.churn.read': {
    title: 'Xem tỷ lệ hủy gói (Churn Rate)',
    desc: 'Theo dõi tỷ lệ dừng gia hạn và phân tích lý do thành viên hủy gói.',
  },

  // Coin & Reward Rules
  'coin.wallet.read': {
    title: 'Tra cứu ví Coin thành viên',
    desc: 'Xem số dư ví Coin chính và các lô Coin thưởng khuyến mãi của bất kỳ người dùng nào.',
  },
  'coin.adjust': {
    title: 'Điều chỉnh số dư Coin thủ công',
    desc: 'Cộng hoặc trừ Coin vào ví người dùng kèm lý do đối soát và mã chứng từ.',
  },
  'coin.transaction.read': {
    title: 'Tra cứu sổ cái giao dịch Coin',
    desc: 'Xem toàn bộ lịch sử nạp, tiêu, thưởng và hoàn trả Coin trên toàn hệ thống.',
  },
  'reward.rule.manage': {
    title: 'Cấu hình thang thưởng điểm danh',
    desc: 'Thiết lập mức Coin thưởng mỗi ngày trong tuần và tỷ lệ trúng thưởng vòng quay.',
  },

  // Advertising
  'ad.manage': {
    title: 'Quản trị chiến dịch quảng cáo',
    desc: 'Tạo quảng cáo, tải lên video clip, thiết lập Ad Break và bật/tắt chiến dịch.',
  },

  // Administration
  'member:ops.read': {
    title: 'Xem thông tin khán giả (Chỉ đọc, BR-20)',
    desc: 'Tra cứu hồ sơ tài khoản khán giả phục vụ hỗ trợ khách hàng và tra cứu sự cố.',
  },
  'user:read': {
    title: 'Xem danh sách tài khoản toàn hệ thống',
    desc: 'Xem toàn bộ tài khoản người dùng bao gồm nhân viên, nhà sáng tạo và kiểm duyệt viên.',
  },
  'user:manage': {
    title: 'Quản trị tài khoản & Cấp vai trò',
    desc: 'Tạo tài khoản nhân sự nội bộ, đổi vai trò, khóa hoặc mở khóa tài khoản.',
  },
  'role:manage': {
    title: 'Phân quyền hạn theo từng vai trò',
    desc: 'Thiết lập và phân bổ ma trận quyền hạn cho từng nhóm người dùng trong hệ thống.',
  },
  'platform:settings.manage': {
    title: 'Cài đặt chính sách nền tảng',
    desc: 'Điều chỉnh tỷ giá Coin, khung giá gói cước, số tập xem thử miễn phí và thông số hệ thống.',
  },
  'token-budget:manage': {
    title: 'Quản lý hạn mức ngân sách Token',
    desc: 'Cấp hạn mức Token sản xuất cho Kiểm duyệt viên và thu hồi lượng Token chưa phân bổ.',
  },
};

/** Get Vietnamese metadata for permission row */
export function getPermissionMeta(key: string, fallbackDesc?: string): { title: string; desc: string } {
  if (PERMISSION_VI_MAP[key]) {
    return PERMISSION_VI_MAP[key];
  }
  return {
    title: fallbackDesc || key,
    desc: fallbackDesc || `Quyền hạn hệ thống (${key})`,
  };
}
