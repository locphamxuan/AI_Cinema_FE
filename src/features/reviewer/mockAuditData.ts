import type { MasterEpisode, AuditTicket } from './types';

export const INITIAL_AUDIT_EPISODE: MasterEpisode = {
  id: 'ep-cyber-saigon-02',
  projectTitle: 'Cyber Saigon 2077',
  episodeNumber: 2,
  episodeTitle: 'Mạng Lưới Ngầm',
  version: 'Version 2 (Master Render 4K)',
  durationSeconds: 1110, // 18m 30s
  durationText: '18:30',
  videoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
  posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
  studioName: 'Saigon VFX Lab',
  reviewerName: 'Trần Gia Huy',
  status: 'REVIEWING',
  aiComplianceGranted: false,
  aiTechStack: ['Runway Gen-3 Alpha', 'Midjourney v6.1', 'ElevenLabs Turbo v2', 'Topaz Video AI'],
  promptsCount: 142,
  synopsis:
    'Sau cuộc chạm trán tại Chợ Lớn ngập ánh neon, Kane thâm nhập vào trung tâm dữ liệu ngầm dưới lòng Bến Thành để giải mã mảnh chip lượng tử chứa bí mật AI tối mật.',
  scriptExcerpt: [
    {
      act: 'Màn 1: Đoạn 01 (00:00 - 05:20)',
      scene: 'Ngoại cảnh - Chợ Lớn Cyber Mưa Axit',
      description: 'Mưa axit rơi rải rác trên các biển hiệu hologram quảng cáo phở và chip cấy ghép thần kinh.',
      dialogue: 'Kane: "Tín hiệu từ tổng đài đã bị nhiễu. Bọn lính đánh thuê của Tập đoàn Nova đang rà quét khu này."',
    },
    {
      act: 'Màn 2: Đoạn 02 (05:21 - 13:45)',
      scene: 'Nội cảnh - Ga tàu điện ngầm ngầm Bến Thành',
      description: 'Đường hầm bỏ hoang với ánh đèn chớp tắt. Maya kích hoạt thiết bị tàng hình quang học.',
      dialogue: 'Maya: "Nếu chip này rơi vào tay Hội đồng Thành phố, họ sẽ xóa sổ toàn bộ vùng ngoại ô 5."',
    },
    {
      act: 'Màn 3: Đoạn 03 (13:46 - 18:30)',
      scene: 'Cao trào - Trung tâm máy chủ lượng tử',
      description: 'Cuộc đối đầu tay đôi nghẹt thở bằng vũ khí xung điện từ EMP.',
      dialogue: 'Kane: "Không có chỗ lùi nữa đâu. Kích hoạt giao thức phân rã dữ liệu ngay!"',
    },
  ],
  aiDisclosureLogs: [
    {
      tool: 'Runway Gen-3 Alpha',
      purpose: 'Sinh chuỗi chuyển động nhân vật hành động & camera panning',
      model: 'Gen-3 Alpha Commercial Tier',
      provenanceStatus: 'VERIFIED',
      notes: 'Bản quyền prompt & video seed đã khai báo đầy đủ, không trùng lặp tác phẩm đã công bố.',
    },
    {
      tool: 'Midjourney v6.1',
      purpose: 'Ý niệm concept bối cảnh Chợ Lớn Cyberpunk & phục trang nhân vật',
      model: 'v6.1 Relax Mode Commercial License',
      provenanceStatus: 'VERIFIED',
      notes: 'Họa sĩ ý niệm đã thực hiện overpaint tay 35% trên các layer chi tiết kiến trúc Việt Nam.',
    },
    {
      tool: 'ElevenLabs Turbo v2',
      purpose: 'Lồng tiếng nhân vật phụ & loa phát thanh công cộng',
      model: 'Custom Voice Clone w/ Voice Actor Consent Signed',
      provenanceStatus: 'VERIFIED',
      notes: 'Hợp đồng bản quyền giọng nói diễn viên Nguyễn Văn A đã ký gửi kèm hồ sơ thẩm định.',
    },
  ],
};

export const INITIAL_AUDIT_TICKETS: AuditTicket[] = [
  {
    id: 'tkt-001',
    timestampSeconds: 84, // 01:24
    timestampText: '01:24',
    category: 'Biến dạng khuôn mặt AI (Artifact)',
    title: 'Lỗi biến dạng khuôn mặt do AI (Glitch artifact)',
    description: 'Render lại phân cảnh cận cảnh nhân vật nam, biểu cảm bị méo hình khi nhân vật quay góc 45 độ sang trái.',
    severity: 'CRITICAL',
    status: 'PENDING_STUDIO',
    statusLabel: 'Chờ Studio phản hồi',
    author: {
      name: 'Trần Gia Huy',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: 'Compliance Reviewer',
    },
    createdAt: '10 phút trước',
  },
  {
    id: 'tkt-002',
    timestampSeconds: 310, // 05:10
    timestampText: '05:10',
    category: 'Âm thanh & Khẩu hình (Lip-sync)',
    title: 'Lệch đồng bộ khẩu hình (Lip-sync mismatch)',
    description: 'Giọng lồng tiếng ElevenLabs bị lệch khoảng 12 frame so với cử động môi của nhân vật nữ Maya khi nói câu thoại thứ hai.',
    severity: 'WARNING',
    status: 'PENDING_STUDIO',
    statusLabel: 'Chờ Studio phản hồi',
    author: {
      name: 'Trần Gia Huy',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: 'Compliance Reviewer',
    },
    createdAt: '25 phút trước',
  },
  {
    id: 'tkt-003',
    timestampSeconds: 760, // 12:40
    timestampText: '12:40',
    category: 'Vi phạm bản quyền logo (IP Risk)',
    title: 'Biển hiệu neon chứa ký hiệu bảo hộ thương hiệu',
    description: 'Bảng hiệu neon phía trên cửa hàng góc trái phân cảnh vô tình tạo hình giống logo thương hiệu xe hơi có bảo hộ. Cần inpaint AI xóa bỏ ký hiệu này.',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    statusLabel: 'Studio đang khắc phục',
    author: {
      name: 'Trần Gia Huy',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: 'Compliance Reviewer',
    },
    studioResponse: 'Saigon VFX Lab đã nhận ticket và đang cho chạy inpaint bằng Stable Diffusion ControlNet.',
    createdAt: '1 giờ trước',
  },
];
