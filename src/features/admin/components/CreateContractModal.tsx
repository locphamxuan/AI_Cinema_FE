'use client';

import { useEffect, useState } from 'react';
import { FileSignature } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { contractService } from '@/services/contractService';
import { productionService } from '@/services/productionService';
import type { ProjectSummary } from '@/types/production';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  onCreated?: () => void;
}

const DEFAULT_CONTRACT_TERMS =
  '1. Bên B (Studio Đối tác) tự chịu trách nhiệm 100% chi phí AI Compute và phần cứng sản xuất bên ngoài.\n' +
  '2. Bàn giao Video Master chuẩn 4K UHD (24 FPS, ProRes 422 HQ / H.265) đúng thời hạn từng tập.\n' +
  '3. Tuân thủ Điều 44 Luật AI: Khai báo đầy đủ model, nhật ký prompt và thực hiện chỉnh sửa theo ticket timestamp của Reviewer.\n' +
  '4. Hợp đồng mẫu chưa bao gồm chi phí sản xuất; Studio điền báo giá trọn gói (VNĐ) và ký số gửi lại Admin duyệt.';

export function CreateContractModal({
  isOpen,
  onClose,
  defaultProjectId,
  onCreated,
}: CreateContractModalProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectId, setProjectId] = useState(defaultProjectId ?? '');
  const [terms, setTerms] = useState(DEFAULT_CONTRACT_TERMS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  useEffect(() => {
    if (!isOpen || defaultProjectId) return;
    let mounted = true;
    async function loadProjects() {
      try {
        const res = await productionService.listProjects({ page: 1, limit: 30 });
        if (mounted && res?.data?.data && res.data.data.length > 0) {
          setProjects(res.data.data);
          setProjectId((prev) => prev || res.data.data[0].id);
        }
      } catch (err) {
        console.warn('Could not load projects for contract modal:', err);
      }
    }
    void loadProjects();
    return () => {
      mounted = false;
    };
  }, [isOpen, defaultProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProject = projectId || 'proj-cyber-saigon';
    setSubmitting(true);
    try {
      await contractService.resendContract(targetProject, {
        terms: terms.trim() || undefined,
      });
      toast.success(
        'Đã Tạo & Gửi Hợp Đồng Mẫu B2B!',
        'Hợp đồng mẫu đã được khởi tạo và chuyển đến Studio đối tác để điền báo giá (VNĐ) & ký số.'
      );
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(
        'Không thể tạo hợp đồng mẫu',
        err instanceof Error ? err.message : 'Vui lòng thử lại'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Tạo & Gửi Hợp Đồng Mẫu B2B"
      subtitle="Hệ thống phát hành hợp đồng mẫu cho Studio đối tác điền báo giá sản xuất (VNĐ) và ký số."
      icon={<FileSignature className="w-5 h-5 text-[#121212] dark:text-white" />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {!defaultProjectId && (
          <FormField label="Chọn dự án áp dụng hợp đồng">
            {projects.length > 0 ? (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className={fieldInputClass}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.studio ? `(${p.studio.name})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={projectId || 'Cyber Saigon 2077 (Dự án mẫu)'}
                onChange={(e) => setProjectId(e.target.value)}
                className={fieldInputClass}
              />
            )}
          </FormField>
        )}

        <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] p-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong className="text-[#0F172A] dark:text-white">Lưu ý quy trình:</strong> Hợp đồng mẫu mặc định{' '}
          <strong>chưa có chi phí sản xuất</strong>. Sau khi gửi, Studio sẽ điền mức báo giá trọn gói (VNĐ) kèm chữ ký số gửi lại để Admin phê duyệt hoặc thương lượng lại.
        </div>

        <FormField label="Điều khoản làm việc & tiêu chuẩn bàn giao (Điều 44)">
          <textarea
            rows={6}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            required
            className={fieldTextareaClass}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 rounded-full px-4 py-2 text-xs font-medium hover:bg-slate-50 cursor-pointer"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#121212] dark:bg-white text-white dark:text-[#121212] hover:bg-black dark:hover:bg-slate-100 rounded-full px-5 py-2 text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Đang khởi tạo...' : 'Phát Hành Hợp Đồng Mẫu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
