import type { UserRole } from '@/types/production';

export const BACKEND_ROLES: UserRole[] = ['MEMBER', 'CONTENT_CREATOR', 'CONTENT_REVIEWER', 'STUDIO', 'STAFF', 'ADMIN'];

/** Roles the Admin can create accounts for here; members sign up themselves, studio logins open from the studio. */
export const STAFF_ROLES: UserRole[] = ['CONTENT_CREATOR', 'CONTENT_REVIEWER', 'STAFF', 'ADMIN'];

/** Roles an account can be moved to: never STUDIO, which needs its studio (Studio page → Tài khoản đăng nhập). */
export const ASSIGNABLE_ROLES: UserRole[] = BACKEND_ROLES.filter((role) => role !== 'STUDIO');

export const BACKEND_ROLE_LABEL: Record<UserRole, string> = {
  MEMBER: 'Thành viên (Khán giả)',
  CONTENT_CREATOR: 'Nhà sáng tạo nội dung',
  CONTENT_REVIEWER: 'Kiểm duyệt viên',
  STUDIO: 'Studio đối tác',
  STAFF: 'Nhân viên vận hành',
  ADMIN: 'Quản trị viên',
};

export const ROLE_SHORT_LABEL: Record<UserRole, string> = {
  MEMBER: 'Thành viên',
  CONTENT_CREATOR: 'Creator',
  CONTENT_REVIEWER: 'Reviewer',
  STUDIO: 'Studio',
  STAFF: 'Vận hành',
  ADMIN: 'Quản trị',
};

export const ROLE_TONE: Record<UserRole, 'purple' | 'emerald' | 'blue' | 'amber' | 'neutral'> = {
  ADMIN: 'purple',
  CONTENT_REVIEWER: 'emerald',
  CONTENT_CREATOR: 'blue',
  STUDIO: 'neutral',
  STAFF: 'amber',
  MEMBER: 'neutral',
};

/** Groups of the permission catalog (AI_Cinema_BE PERMISSION_CATALOG `area`). */
export const PERMISSION_AREA_LABEL: Record<string, string> = {
  'movie-project': 'Dự án phim',
  studio: 'Studio & Đơn vị sản xuất',
  media: 'Tập phim & nộp phim',
  review: 'Kiểm duyệt nội dung',
  publishing: 'Phát hành & Bản quyền',
  catalog: 'Danh mục & Thể loại',
  'episode-access': 'Quyền xem tập & ví Member',
  billing: 'Gói thành viên & Doanh thu',
  coin: 'Coin & thưởng điểm danh',
  advertising: 'Quảng cáo & lần chèn',
  administration: 'Hệ thống & Quản trị',
  operations: 'Vận hành & Hỗ trợ',
  admin: 'Quản trị hệ thống',
};

/**
 * Vietnamese human-friendly translation and explanation for all system permissions.
 */
const PERMISSION_VI_MAP: Record<string, { title: string; desc: string }> = {
  // Movie project
  'project:create': {
    title: 'Tạo dự án phim & giao Creator',
    desc: 'Tạo dự án phim, chọn Reviewer phụ trách, giao (hoặc đổi) Creator chính và chọn Studio.',
  },
  'project:manage': {
    title: 'Quản trị dự án phim được giao',
    desc: 'Chỉnh sửa thông tin, mùa, tập phim, hạn giao và huỷ dự án mình phụ trách.',
  },
  'script:write': {
    title: 'Viết & nộp kịch bản',
    desc: 'Creator chính soạn kịch bản của dự án được giao và nộp cho Reviewer duyệt.',
  },
  'script:approve': {
    title: 'Duyệt kịch bản bản cuối',
    desc: 'Đồng ý Kịch bản bản cuối (hệ thống gửi hợp đồng mẫu cho Studio) hoặc yêu cầu Creator sửa.',
  },
  'studio:portal': {
    title: 'Cổng Studio (Studio Web)',
    desc: 'Tài khoản Studio thương lượng, ký hợp đồng và nộp phim từng tập trên Studio Web.',
  },
  'episode:price': {
    title: 'Đặt giá Coin cho tập phim',
    desc: 'Admin đặt giá Coin và quyền xem của tập trước khi phát hành; giá ngoài khoảng cho phép được ghi cảnh báo.',
  },
  'cost:request': {
    title: 'Yêu cầu thêm chi phí sản xuất',
    desc: 'Gửi Admin yêu cầu thêm chi phí (VND) cho dự án mình phụ trách, kèm báo giá của Studio.',
  },
  'cost:approve': {
    title: 'Duyệt yêu cầu thêm chi phí sản xuất',
    desc: 'Cấp đủ, cấp một phần hoặc từ chối yêu cầu thêm chi phí sản xuất của Reviewer.',
  },
  'cost:adjust': {
    title: 'Đặt và điều chỉnh ngân sách sản xuất',
    desc: 'Đặt ngân sách sản xuất (VND) cho dự án phim và điều chỉnh khi cần, kèm lý do.',
  },
  'project:read.all': {
    title: 'Xem toàn bộ dự án phim trên nền tảng',
    desc: 'Xem danh sách và tiến độ sản xuất tất cả các dự án phim trên hệ thống (không chỉ dự án của mình).',
  },
  'project:suggest': {
    title: 'Gửi đề xuất thay đổi dự án',
    desc: 'Gửi yêu cầu thay đổi tiến độ, nhân sự hoặc ngân sách kèm lý do và minh chứng rõ ràng.',
  },
  'project:change.review': {
    title: 'Phê duyệt đề xuất thay đổi dự án',
    desc: 'Xem xét, chấp thuận hoặc từ chối các đề xuất thay đổi gửi từ Reviewer và Creator.',
  },

  // Studio
  'studio:manage': {
    title: 'Quản lý danh sách Studio đối tác',
    desc: 'Thêm, sửa hồ sơ và tạm dừng Studio đối tác.',
  },

  // Media
  'media:ingest': {
    title: 'Làm việc trên các tập của dự án được giao',
    desc: 'Nhóm Creator, uỷ quyền tập và ghi chú tập; phim do Studio nộp trên Studio Web.',
  },

  // Review
  'content:review': {
    title: 'Kiểm duyệt nội dung & gắn nhãn AI',
    desc: 'Xem xét nội dung tập phim, kiểm tra tuân thủ pháp lý và gắn nhãn AI.',
  },

  // Publishing
  'episode:publish': {
    title: 'Xuất bản & gỡ tập phim',
    desc: 'Xem phim bản cuối Reviewer đã xác nhận, phát hành ngay hoặc hẹn giờ, trả lại qua Reviewer hoặc gỡ tập.',
  },
  'price-alert:manage': {
    title: 'Theo dõi & Cảnh báo giá tập phim',
    desc: 'Theo dõi tập có giá ngoài khoảng cho phép, hỏi ý kiến Reviewer rồi tự đặt lại giá.',
  },

  // Catalog
  'genre:manage': {
    title: 'Quản lý thể loại & Phân loại phim',
    desc: 'Thêm mới, sửa đổi và sắp xếp cây phân loại thể loại phim trên nền tảng.',
  },

  // Episode Access & Member
  'access.episode.read': {
    title: 'Kiểm tra quyền truy cập tập phim',
    desc: 'Xem tập Member đã mở khoá và quyền xem tập để hỗ trợ khi gặp sự cố.',
  },
  'wallet.read': {
    title: 'Kiểm tra số dư ví Coin',
    desc: 'Xem số dư ví Coin cá nhân và xác nhận khả năng thanh toán khi giao dịch.',
  },
  'wallet.topup': {
    title: 'Nạp Coin vào tài khoản',
    desc: 'Tạo đơn nạp Coin qua cổng thanh toán VNPay.',
  },
  'reward.checkin': {
    title: 'Điểm danh hàng ngày nhận thưởng',
    desc: 'Nhận phần thưởng điểm danh hàng ngày và tham gia vòng quay may mắn.',
  },
  'subscription.self.manage': {
    title: 'Quản lý gói thành viên cá nhân',
    desc: 'Đăng ký gói thành viên, bật hoặc tắt tự gia hạn gói của chính mình.',
  },

  // Billing
  'billing.plan.manage': {
    title: 'Quản lý danh mục gói thành viên',
    desc: 'Tạo, sửa quyền lợi, giới hạn thiết bị và ẩn / hiện các gói thành viên.',
  },
  'billing.price.manage': {
    title: 'Đặt giá gói theo kỳ thanh toán',
    desc: 'Thiết lập mức giá Coin theo từng chu kỳ thanh toán (tháng, quý, năm) cho các gói.',
  },
  'billing.subscription.read': {
    title: 'Tra cứu danh sách đăng ký gói',
    desc: 'Xem các Member đang có gói, hạn dùng và lịch sử thu Coin định kỳ.',
  },
  'billing.subscription.cancel': {
    title: 'Huỷ gói thành viên của người dùng',
    desc: 'Chấm dứt gói thành viên của một tài khoản.',
  },
  'analytics.revenue.read': {
    title: 'Xem báo cáo doanh thu gói',
    desc: 'Xem biểu đồ doanh thu theo gói, số lượt thu phí và tăng trưởng tài chính nền tảng.',
  },
  'analytics.churn.read': {
    title: 'Xem tỉ lệ rời gói',
    desc: 'Theo dõi tỷ lệ dừng gia hạn và phân tích lý do thành viên huỷ gói.',
  },

  // Coin & Reward Rules
  'coin.wallet.read': {
    title: 'Tra cứu ví Coin thành viên',
    desc: 'Xem số dư ví Coin chính và các khoản Coin thưởng khuyến mãi của bất kỳ người dùng nào.',
  },
  'coin.adjust': {
    title: 'Điều chỉnh số dư Coin thủ công',
    desc: 'Cộng hoặc trừ Coin vào ví người dùng kèm lý do đối chiếu và mã chứng từ.',
  },
  'coin.transaction.read': {
    title: 'Tra cứu lịch sử giao dịch Coin',
    desc: 'Xem toàn bộ lịch sử nạp, tiêu, thưởng và hoàn trả Coin trên toàn hệ thống.',
  },
  'reward.rule.manage': {
    title: 'Cấu hình thang thưởng điểm danh',
    desc: 'Thiết lập mức Coin thưởng mỗi ngày trong tuần và tỷ lệ trúng thưởng vòng quay.',
  },

  // Advertising
  'ad.manage': {
    title: 'Quản trị chiến dịch quảng cáo',
    desc: 'Tạo quảng cáo, tải video lên, đặt vị trí chèn và bật / tắt quảng cáo.',
  },

  // Administration
  'member:ops.read': {
    title: 'Xem thông tin khán giả (chỉ xem)',
    desc: 'Tra cứu hồ sơ tài khoản khán giả phục vụ hỗ trợ khách hàng và tra cứu sự cố.',
  },
  'user:read': {
    title: 'Xem danh sách tài khoản toàn hệ thống',
    desc: 'Xem toàn bộ tài khoản người dùng bao gồm nhân viên, nhà sáng tạo và kiểm duyệt viên.',
  },
  'user:manage': {
    title: 'Quản trị tài khoản & Cấp vai trò',
    desc: 'Tạo tài khoản nhân sự nội bộ, đổi vai trò, khoá hoặc mở khoá tài khoản.',
  },
  'role:manage': {
    title: 'Phân quyền hạn theo từng vai trò',
    desc: 'Thiết lập bảng phân quyền cho từng nhóm người dùng trong hệ thống.',
  },
  'platform:settings.manage': {
    title: 'Cài đặt chính sách nền tảng',
    desc: 'Điều chỉnh tỷ giá Coin, khoảng giá tập, số tập xem miễn phí và các thông số khác.',
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
