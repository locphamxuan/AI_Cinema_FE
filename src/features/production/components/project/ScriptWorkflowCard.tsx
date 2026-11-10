'use client';

import { useState } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { useAction } from '@/hooks/useAction';
import { useAppStore } from '@/store/useAppStore';
import { scriptService } from '@/services/scriptService';
import type { ProjectScript, ScriptStatus } from '@/types/script';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';

interface ScriptWorkflowCardProps {
  projectId: string;
}

export function ScriptWorkflowCard({ projectId }: ScriptWorkflowCardProps) {
  const user = useAppStore((state) => state.user);
  const { busy, run } = useAction();
  const [modalMode, setModalMode] = useState<
    'submit' | 'reviewer_approve' | 'reviewer_reject' | 'admin_approve' | 'admin_reject' | null
  >(null);

  // Form states
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [comment, setComment] = useState('');
  const [terms, setTerms] = useState('');

  const scriptResource = useResource(`project-script:${projectId}`, () =>
    scriptService.getScript(projectId)
  );

  const script: ProjectScript | null = scriptResource.data ?? null;

  const role = user?.role?.toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isReviewer = role === 'REVIEWER' || role === 'CONTENT_REVIEWER';
  const isCreator = role === 'CREATOR' || role === 'CONTENT_CREATOR';

  const status: ScriptStatus = script?.status ?? 'SUBMITTED';

  const getStatusBadge = () => {
    switch (status) {
      case 'FINAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Lock className="w-3.5 h-3.5" /> Kịch Bản Final Đã Duyệt (Đã Khóa)
          </span>
        );
      case 'REVIEWER_APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Reviewer Đã Duyệt — Chờ Admin Chốt Final
          </span>
        );
      case 'REVISION_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Cần Chỉnh Sửa Phân Cảnh
          </span>
        );
      case 'SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Đang Chờ Reviewer Thẩm Định
          </span>
        );
    }
  };

  // Creator Submit
  const handleCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(
      () => scriptService.submitVersion(projectId, { content, note }),
      'Đã gửi kịch bản cho Reviewer thẩm định'
    );
    if (ok) {
      setModalMode(null);
      setContent('');
      setNote('');
      void scriptResource.reload();
    }
  };

  // Reviewer Review
  const handleReviewerReview = async (approve: boolean) => {
    const ok = await run(
      () => scriptService.reviewScript(projectId, { approve, comment }),
      approve ? 'Đã duyệt kịch bản và chuyển tiếp cho Admin' : 'Đã gửi yêu cầu chỉnh sửa cho Creator'
    );
    if (ok) {
      setModalMode(null);
      setComment('');
      void scriptResource.reload();
    }
  };

  // Admin Final Review
  const handleAdminFinalReview = async (approve: boolean) => {
    const ok = await run(
      () => scriptService.finalReviewScript(projectId, { approve, comment, terms: terms || undefined }),
      approve ? 'Đã phê duyệt Kịch bản Final và tự động kích hoạt Hợp đồng mẫu' : 'Đã gửi yêu cầu chỉnh sửa kịch bản'
    );
    if (ok) {
      setModalMode(null);
      setComment('');
      setTerms('');
      void scriptResource.reload();
    }
  };

  const latestVersion = script?.versions?.[script.versions.length - 1];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111420] p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Kịch Bản Phân Cảnh (Bước 2)
              </h3>
              {script?.currentVersion && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  Version {script.currentVersion}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Creator soạn phân cảnh $\rightarrow$ Reviewer duyệt nội dung $\rightarrow$ Admin phê duyệt Kịch bản Final để tạo Hợp đồng B2B.
            </p>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Script Summary & Content View */}
      {latestVersion ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Người soạn thảo: <strong className="text-slate-900 dark:text-white">{latestVersion.submittedBy?.fullName || 'Creator'}</strong></span>
              <span className="font-mono">{new Date(latestVersion.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            {latestVersion.note && (
              <p className="text-slate-600 dark:text-slate-300 italic">
                “{latestVersion.note}”
              </p>
            )}
            <div className="p-3 rounded-lg bg-white dark:bg-[#0D1017] border border-slate-200/80 dark:border-white/[0.04] max-h-40 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {latestVersion.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.08] text-xs text-slate-400">
          Chưa có kịch bản phân cảnh nào được nộp cho dự án này.
        </div>
      )}

      {/* Review History Notes */}
      {script?.reviews && script.reviews.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lịch sử thẩm định:</p>
          <div className="space-y-1.5">
            {script.reviews.map((r) => (
              <div key={r.id} className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex items-start gap-2">
                {r.approved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {r.stage === 'ADMIN' ? 'Admin' : 'Reviewer'} {r.approved ? 'đã duyệt v' + r.version : 'yêu cầu chỉnh sửa v' + r.version}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {r.comment && <p className="text-slate-600 dark:text-slate-400 mt-0.5">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        {/* Creator Actions */}
        {(isCreator || isAdmin) && status !== 'FINAL' && (
          <Button
            size="sm"
            onClick={() => setModalMode('submit')}
            className="bg-[#E50914] hover:bg-[#B81D24] text-white flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp Phân Cảnh (Bản Mới)</span>
          </Button>
        )}

        {/* Reviewer Actions */}
        {(isReviewer || isAdmin) && status === 'SUBMITTED' && (
          <>
            <Button
              size="sm"
              onClick={() => handleReviewerReview(true)}
              disabled={busy}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Duyệt Kịch Bản (Chuyển Admin)</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setModalMode('reviewer_reject')}
              className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Yêu Cầu Creator Sửa</span>
            </Button>
          </>
        )}

        {/* Admin Actions */}
        {isAdmin && status === 'REVIEWER_APPROVED' && (
          <>
            <Button
              size="sm"
              onClick={() => setModalMode('admin_approve')}
              className="bg-[#E50914] hover:bg-[#B81D24] text-white flex items-center gap-1.5 shadow-md"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Phê Duyệt Kịch Bản Final (Kích Hoạt Hợp Đồng)</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setModalMode('admin_reject')}
              className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              Yêu Cầu Chỉnh Sửa Lại
            </Button>
          </>
        )}
      </div>

      {/* Modal: Creator Submit Script */}
      {modalMode === 'submit' && (
        <Modal
          open
          onClose={() => setModalMode(null)}
          title="Nộp Kịch Bản Phân Cảnh"
          subtitle="Gửi kịch bản phân cảnh chi tiết cho Reviewer thẩm định nội dung & tính logic."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreatorSubmit} className="space-y-4">
            <FormField label="Nội dung kịch bản phân cảnh (Scene, Dialogue, Concept)">
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="CẢNH 1 — NỘI. PHÒNG LAB TÂN ĐỊNH — ĐÊM&#10;&#10;Ánh đèn neon xanh hắt qua khung kính vỡ. Quân (30 tuổi) khẽ bước vào..."
                required
                className={fieldTextareaClass}
              />
            </FormField>
            <FormField label="Ghi chú thay đổi (so với bản trước)">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Rút gọn phân đoạn rượt đuổi, bổ sung lời thoại nhân vật Maya"
                className={fieldInputClass}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Button type="button" variant="secondary" onClick={() => setModalMode(null)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={busy || !content.trim()} className="bg-[#E50914] text-white">
                {busy ? 'Đang gửi...' : 'Nộp Cho Reviewer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Reviewer Reject Script */}
      {modalMode === 'reviewer_reject' && (
        <Modal
          open
          onClose={() => setModalMode(null)}
          title="Yêu Cầu Chỉnh Sửa Kịch Bản"
          subtitle="Ghi rõ lý do và những điểm cần biên kịch nội bộ (Creator) chỉnh sửa."
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleReviewerReview(false);
            }}
            className="space-y-4"
          >
            <FormField label="Lý do / Hướng dẫn chỉnh sửa">
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cảnh 2 tiết tấu hơi chậm, cần đẩy mạnh xung đột giữa hai nhân vật..."
                required
                className={fieldTextareaClass}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Button type="button" variant="secondary" onClick={() => setModalMode(null)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={busy || !comment.trim()} variant="danger">
                {busy ? 'Đang gửi...' : 'Gửi Yêu Cầu Sửa'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Admin Final Approve Script */}
      {modalMode === 'admin_approve' && (
        <Modal
          open
          onClose={() => setModalMode(null)}
          title="Phê Duyệt Kịch Bản Final"
          subtitle="Kịch bản sẽ được khóa (Lock). Hệ thống sẽ tự động tạo Hợp đồng mẫu gửi cho Studio đối tác."
          maxWidth="max-w-lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleAdminFinalReview(true);
            }}
            className="space-y-4"
          >
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
              Sau khi duyệt, kịch bản chính thức chuyển sang giai đoạn ký kết Hợp đồng sản xuất B2B với Studio đối tác.
            </div>
            <FormField label="Điều khoản bổ sung trong hợp đồng mẫu (không bắt buộc)">
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Các yêu cầu về định dạng 4K UHD, ProRes 422 HQ, thời hạn nộp từng mốc..."
                className={fieldTextareaClass}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Button type="button" variant="secondary" onClick={() => setModalMode(null)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={busy} className="bg-[#E50914] text-white">
                {busy ? 'Đang duyệt...' : 'Phê Duyệt Final & Kích Hoạt Hợp Đồng'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Admin Final Reject Script */}
      {modalMode === 'admin_reject' && (
        <Modal
          open
          onClose={() => setModalMode(null)}
          title="Yêu Cầu Chỉnh Sửa Kịch Bản (Admin)"
          subtitle="Admin gửi phản hồi yêu cầu Creator chỉnh sửa lại kịch bản."
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleAdminFinalReview(false);
            }}
            className="space-y-4"
          >
            <FormField label="Ý kiến chỉ đạo của Admin">
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nội dung cần làm rõ hơn đoạn kết để giữ chân khán giả OTT..."
                required
                className={fieldTextareaClass}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Button type="button" variant="secondary" onClick={() => setModalMode(null)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={busy || !comment.trim()} variant="danger">
                {busy ? 'Đang gửi...' : 'Gửi Yêu Cầu Sửa'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
