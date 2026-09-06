'use client';

import { AIComplianceInfo } from '@/types/movie';

interface ComplianceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  compliance: AIComplianceInfo;
}

export default function ComplianceDrawer({ isOpen, onClose, compliance }: ComplianceDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Drawer */}
      <div
        className="absolute bottom-0 left-0 right-0 glass-card rounded-t-2xl p-6 animate-slide-up max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          🛡️ Thông Tin Tuân Thủ Nội Dung AI
        </h3>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-light">Trạng thái kiểm duyệt:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              compliance.reviewStatus === 'approved'
                ? 'bg-verified/20 text-verified'
                : compliance.reviewStatus === 'pending'
                  ? 'bg-warning/20 text-warning'
                  : 'bg-danger/20 text-danger'
            }`}>
              {compliance.reviewStatus === 'approved' ? '✅ Đã duyệt' : compliance.reviewStatus === 'pending' ? '⏳ Đang chờ' : '🚫 Bị gắn cờ'}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoItem label="Mô hình AI" value={compliance.aiModel} />
            <InfoItem label="Ngày tạo nội dung" value={new Date(compliance.generatedDate).toLocaleDateString('vi-VN')} />
            <InfoItem label="Điều luật tuân thủ" value={compliance.complianceArticle} />
            <InfoItem label="Điểm kiểm duyệt" value={`${compliance.moderationScore}/100`} />
            <InfoItem label="Phân loại nội dung" value={compliance.contentRating} />
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-neon/10 border border-neon/20">
            <p className="text-xs text-muted-light mb-1 font-medium">📋 Tuyên bố miễn trừ</p>
            <p className="text-sm text-foreground/80">{compliance.disclaimer}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-foreground font-medium transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/5">
      <p className="text-[10px] text-muted-light uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
  );
}
