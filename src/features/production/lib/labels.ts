import type {
  ChangeRequestStatus,
  ComplianceCheckType,
  ComplianceResult,
  EpisodeStatus,
  LabelLocation,
  LabelType,
  MediaIngestStatus,
  MediaSourceMethod,
  MovieStatus,
  PriceAlertStatus,
  TokenEntryType,
  UnpublishMode,
  UnpublishReason,
} from '@/types/production';

export type Tone = 'neutral' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';

interface Label {
  label: string;
  tone: Tone;
}

export const MOVIE_STATUS: Record<MovieStatus, Label> = {
  DRAFT: { label: 'Nháp', tone: 'neutral' },
  ASSIGNED: { label: 'Đã giao Creator', tone: 'blue' },
  IN_PRODUCTION: { label: 'Studio đang sản xuất', tone: 'purple' },
  COMPLETED: { label: 'Hoàn tất', tone: 'emerald' },
  UNDER_REVISION: { label: 'Đang sửa tập', tone: 'amber' },
  CANCELLED: { label: 'Đã huỷ', tone: 'rose' },
};

export const EPISODE_STATUS: Record<EpisodeStatus, Label> = {
  DRAFT: { label: 'Nháp', tone: 'neutral' },
  AWAITING_MEDIA: { label: 'Chờ studio giao', tone: 'neutral' },
  PROCESSING: { label: 'Đang xử lý video', tone: 'blue' },
  IN_REVIEW: { label: 'Chờ duyệt', tone: 'amber' },
  CHANGES_REQUESTED: { label: 'Yêu cầu sửa', tone: 'rose' },
  APPROVED: { label: 'Đã duyệt', tone: 'blue' },
  LABELED: { label: 'Đã gắn nhãn AI', tone: 'blue' },
  COMPLIANCE_PASSED: { label: 'Đạt kiểm tra', tone: 'emerald' },
  SCHEDULED: { label: 'Đã lên lịch', tone: 'purple' },
  PUBLISHED: { label: 'Đã phát hành', tone: 'emerald' },
  UNPUBLISHED: { label: 'Đã gỡ', tone: 'rose' },
};

export const INGEST_STATUS: Record<MediaIngestStatus, Label> = {
  PENDING: { label: 'Chờ xử lý', tone: 'neutral' },
  DOWNLOADING: { label: 'Đang tải về', tone: 'blue' },
  TRANSCODING: { label: 'Đang chuyển mã HLS', tone: 'blue' },
  VALIDATING: { label: 'Đang kiểm tra link', tone: 'blue' },
  READY: { label: 'Sẵn sàng', tone: 'emerald' },
  FAILED: { label: 'Lỗi', tone: 'rose' },
  SUPERSEDED: { label: 'Đã có bản mới', tone: 'neutral' },
};

export const SOURCE_METHOD: Record<MediaSourceMethod, string> = {
  UPLOAD: 'Tải file lên',
  HLS_URL: 'Link HLS của studio',
  REMOTE_FILE: 'Link file (hệ thống tải về)',
};

export const LABEL_TYPE: Record<LabelType, string> = {
  AI_GENERATED: 'Do AI tạo',
  AI_EDITED: 'AI chỉnh sửa',
  AI_ASSISTED: 'AI hỗ trợ',
};

/** Default text of each label, editable by the Reviewer (BR-40). */
export const LABEL_DEFAULT_TEXT: Record<LabelType, string> = {
  AI_GENERATED: 'Nội dung được tạo bởi AI',
  AI_EDITED: 'Nội dung được chỉnh sửa bằng AI',
  AI_ASSISTED: 'Nội dung có sự hỗ trợ của AI',
};

export const LABEL_LOCATION: Record<LabelLocation, string> = {
  TOP_RIGHT: 'Góc trên phải',
  TOP_LEFT: 'Góc trên trái',
  BOTTOM_RIGHT: 'Góc dưới phải',
  BOTTOM_LEFT: 'Góc dưới trái',
  INTRO_NOTICE: 'Thông báo đầu phim',
};

export const COMPLIANCE_CHECK: Record<ComplianceCheckType, string> = {
  AI_LABEL_PRESENCE: 'Có nhãn AI',
  DECREE_142_NOTICE: 'Thông báo theo Nghị định 142',
  CONTENT_SAFETY: 'An toàn nội dung',
  REAL_PERSON_LIKENESS: 'Không giả mạo người/sự kiện thật',
};

export const COMPLIANCE_RESULT: Record<ComplianceResult, Label> = {
  PENDING: { label: 'Chưa kiểm', tone: 'neutral' },
  PASS: { label: 'Đạt', tone: 'emerald' },
  FAIL: { label: 'Không đạt', tone: 'rose' },
};

export const FEE_ENTRY: Record<TokenEntryType, string> = {
  INITIAL: 'Cấp lần đầu',
  TOP_UP: 'Cấp thêm',
  CORRECTION: 'Điều chỉnh',
};

export const CHANGE_REQUEST_STATUS: Record<ChangeRequestStatus, Label> = {
  OPEN: { label: 'Chờ trả lời', tone: 'amber' },
  ACCEPTED: { label: 'Đã chấp nhận', tone: 'emerald' },
  REJECTED: { label: 'Đã từ chối', tone: 'rose' },
};

export const PRICE_ALERT_STATUS: Record<PriceAlertStatus, Label> = {
  OPEN: { label: 'Mới', tone: 'amber' },
  CHANGE_REQUESTED: { label: 'Đã yêu cầu đổi giá', tone: 'blue' },
  RESOLVED: { label: 'Đã xử lý', tone: 'emerald' },
};

export const UNPUBLISH_MODE: Record<UnpublishMode, { label: string; hint: string }> = {
  REVISION: {
    label: 'Gỡ để sửa',
    hint: 'Tập về lại Creator để studio sửa. Người đã mua vẫn giữ quyền xem, không hoàn Coin; người xem thấy thông báo bảo trì.',
  },
  REMOVAL: {
    label: 'Gỡ hẳn',
    hint: 'Tập bị gỡ vĩnh viễn và người đã mua được hoàn Coin.',
  },
};

export const UNPUBLISH_REASON: Record<UnpublishReason, string> = {
  MANUAL: 'Quyết định của Reviewer',
  COMPLIANCE_ISSUE: 'Vấn đề tuân thủ',
  BROKEN_SOURCE: 'Nguồn video hỏng',
};

/** Parts of an episode the studio may have made with AI (BR-41). */
export const AI_PARTS: { value: string; label: string }[] = [
  { value: 'image', label: 'Hình ảnh' },
  { value: 'video', label: 'Video' },
  { value: 'voice', label: 'Giọng nói' },
  { value: 'music', label: 'Âm nhạc' },
  { value: 'script', label: 'Kịch bản' },
  { value: 'subtitle', label: 'Phụ đề' },
];

/** Audit events of a project, as the timeline shows them. Unknown actions fall back to their key. */
export const EVENT_LABEL: Record<string, string> = {
  PROJECT_CREATED: 'Tạo dự án',
  PROJECT_UPDATED: 'Sửa thông tin dự án',
  IDEA_FILE_UPLOADED: 'Tải file ý tưởng',
  FEE_ALLOCATED: 'Cấp phí sản xuất',
  FEE_TOPPED_UP: 'Cấp thêm phí sản xuất',
  FEE_CORRECTED: 'Điều chỉnh phí sản xuất',
  PROJECT_ASSIGNED: 'Giao Content Creator',
  STUDIO_HANDOFF_SENT: 'Gửi brief cho studio',
  STUDIO_CHANGED: 'Đổi studio',
  PROJECT_CANCELLED: 'Huỷ dự án',
  PROJECT_COMPLETED: 'Hoàn tất dự án',
  PROJECT_UNDER_REVISION: 'Dự án có tập đang sửa',
  MEDIA_SUBMITTED: 'Giao bản dựng',
  MEDIA_READY: 'Video sẵn sàng',
  MEDIA_FAILED: 'Xử lý video lỗi',
  CONTENT_CHANGES_REQUESTED: 'Yêu cầu sửa tập',
  CONTENT_APPROVED: 'Duyệt tập',
  AI_LABEL_APPLIED: 'Gắn nhãn AI',
  COMPLIANCE_PASSED: 'Đạt kiểm tra tuân thủ',
  COMPLIANCE_FAILED: 'Không đạt kiểm tra tuân thủ',
  EPISODE_PRICED: 'Đặt giá Coin',
  PRICE_OUT_OF_RANGE: 'Giá Coin ngoài khoảng',
  PROJECT_CHANGE_REQUESTED: 'Admin đề xuất sửa',
  PROJECT_CHANGE_ACCEPTED: 'Chấp nhận đề xuất',
  PROJECT_CHANGE_REJECTED: 'Từ chối đề xuất',
  EPISODE_SCHEDULED: 'Lên lịch phát hành',
  EPISODE_PUBLISHED: 'Phát hành tập',
  EPISODE_UNPUBLISHED: 'Gỡ tập',
};
