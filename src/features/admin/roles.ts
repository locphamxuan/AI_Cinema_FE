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
  advertising: 'Quảng cáo & Ad Break',
  administration: 'Hệ thống & Quản trị',
};
