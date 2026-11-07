'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { INITIAL_AUDIT_EPISODE, INITIAL_AUDIT_TICKETS } from '../mockAuditData';
import type { AuditTicket, MasterEpisode } from '../types';
import { ReviewerAuditCanvas } from './ReviewerAuditCanvas';
import { ReviewerFeedbackPanel } from './ReviewerFeedbackPanel';

export function ReviewerAuditWorkspace() {
  const [episode, setEpisode] = useState<MasterEpisode>(INITIAL_AUDIT_EPISODE);
  const [tickets, setTickets] = useState<AuditTicket[]>(INITIAL_AUDIT_TICKETS);
  const [currentTime, setCurrentTime] = useState<number>(165); // 02:45
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isComplianceActive, setIsComplianceActive] = useState<boolean>(false);

  // Time navigation
  const handleTimeChange = (newTime: number) => {
    setCurrentTime(newTime);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Quick mark error button on video player
  const handleMarkErrorAtCurrentTime = () => {
    const min = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const sec = Math.floor(currentTime % 60).toString().padStart(2, '0');
    toast.info(
      `Đã đánh dấu thời điểm ${min}:${sec}`,
      'Vui lòng nhập chi tiết mô tả lỗi tại bảng Feedback bên phải để gửi cho Studio.'
    );
  };

  // Toggle AI Article 44 compliance badge
  const handleToggleAiCompliance = () => {
    setIsComplianceActive((prev) => {
      const next = !prev;
      if (next) {
        toast.success(
          'Đã Cấp Giấy Phép Tuân Thủ AI (Điều 44)',
          `Tập "${episode.episodeTitle}" đã được xác thực minh bạch dữ liệu AI và sẵn sàng đóng dấu phát hành OTT.`
        );
      } else {
        toast.info(
          'Đã Tạm Dừng Giấy Phép Tuân Thủ AI',
          'Tập phim chuyển về trạng thái chờ đối soát bổ sung dữ liệu prompt.'
        );
      }
      return next;
    });
  };

  // Add new audit ticket from right panel
  const handleAddTicket = (newTicket: AuditTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  // Decision 1: Reject to Studio
  const handleRejectToStudio = () => {
    toast.warning(
      'Đã Từ Chối Bản Master & Gửi Lại Studio',
      `Đã gửi thông báo kèm ${tickets.length} ticket yêu cầu chỉnh sửa kỹ thuật tới Studio ${episode.studioName}.`
    );
  };

  // Decision 2: Approve & Publish
  const handleApproveForPublish = () => {
    if (!isComplianceActive) {
      toast.error(
        'Chưa xác nhận Điều 44',
        'Tập phim chưa được gắn nhãn Tuân Thủ AI (Điều 44 Luật AI). Vui lòng kiểm tra và bấm "Gắn Nhãn AI Điều 44" trước khi phê duyệt.'
      );
      return;
    }

    toast.success(
      'Phê Duyệt Thành Công!',
      `Bản dựng Master tập "${episode.episodeTitle}" đã đạt chuẩn kiểm định và được chuyển giao cho Admin để phát hành lên hệ thống OTT.`
    );
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 w-full min-h-[calc(100vh-3.5rem)] bg-[#090B10] overflow-hidden">
      {/* ── CỘT 2: KHÔNG GIAN THẨM ĐỊNH CHÍNH (Canvas Giữa) ── */}
      <ReviewerAuditCanvas
        episode={episode}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onTimeChange={handleTimeChange}
        onTogglePlay={handleTogglePlay}
        onMarkErrorAtCurrentTime={handleMarkErrorAtCurrentTime}
        onToggleAiCompliance={handleToggleAiCompliance}
        isComplianceActive={isComplianceActive}
        tickets={tickets}
      />

      {/* ── CỘT 3: BẢNG FEEDBACK & AUDIT TICKETS (Bên Phải) ── */}
      <ReviewerFeedbackPanel
        tickets={tickets}
        episode={episode}
        currentTime={currentTime}
        onTimeJump={handleTimeChange}
        onAddTicket={handleAddTicket}
        onRejectToStudio={handleRejectToStudio}
        onApproveForPublish={handleApproveForPublish}
        isComplianceActive={isComplianceActive}
      />
    </div>
  );
}
