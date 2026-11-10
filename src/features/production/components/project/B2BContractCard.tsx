'use client';

import { useState } from 'react';
import {
  FileSignature,
  CheckCircle2,
  Clock,
  Repeat,
  Plus,
} from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { useAppStore } from '@/store/useAppStore';
import { contractService } from '@/services/contractService';
import type { Contract, ContractStatus } from '@/types/contract';
import { formatNumber } from '@/lib/format';
import { SignContractModal } from '@/features/admin/components/SignContractModal';
import { CreateContractModal } from '@/features/admin/components/CreateContractModal';

interface B2BContractCardProps {
  projectId: string;
}

export function B2BContractCard({ projectId }: B2BContractCardProps) {
  const user = useAppStore((state) => state.user);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const contractsResource = useResource(`project-contracts:${projectId}`, () =>
    contractService.listContracts(projectId)
  );

  const contracts: Contract[] = contractsResource.data ?? [];
  const latestContract = contracts[0] ?? null;

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const getStatusBadge = (status?: ContractStatus) => {
    switch (status) {
      case 'SIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hợp Đồng Hoàn Tất (Đủ 2 Chữ Ký)
          </span>
        );
      case 'STUDIO_SIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Studio Đã Báo Giá & Ký — Chờ Admin Duyệt
          </span>
        );
      case 'ADMIN_COUNTERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30">
            <Repeat className="w-3.5 h-3.5" /> Admin Đã Đề Xuất Giá Mới — Chờ Studio Ký
          </span>
        );
      case 'SENT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15">
            <Clock className="w-3.5 h-3.5" /> Hợp Đồng Mẫu Đã Gửi Studio (Chờ Điền Giá & Ký)
          </span>
        );
    }
  };

  const handleOpenSign = (contract: Contract) => {
    setSelectedContract(contract);
    setIsSignModalOpen(true);
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] p-5 sm:p-6 shadow-sm space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-[#0F172A] dark:text-white">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                Hợp Đồng Sản Xuất B2B (Bước 3 & 4)
              </h3>
              {latestContract && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  Vòng {latestContract.round}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Hệ thống tự động sinh hợp đồng mẫu khi duyệt Kịch bản Final, hoặc Admin có thể phát hành trực tiếp bên dưới.
            </p>
          </div>
        </div>
        <div>{latestContract ? getStatusBadge(latestContract.status) : getStatusBadge('SENT')}</div>
      </div>

      {latestContract ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] space-y-1">
              <span className="text-[11px] text-[#64748B]">Kinh phí sản xuất (VNĐ)</span>
              <p className="text-base font-bold text-[#0F172A] dark:text-white tabular-nums">
                {latestContract.costVnd ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatNumber(Number(latestContract.costVnd))} VNĐ
                  </span>
                ) : (
                  <span className="text-slate-400 italic text-xs">Chưa điền (Chờ Studio báo giá)</span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] space-y-1">
              <span className="text-[11px] text-[#64748B]">Chữ ký Bên A (Admin Sàn)</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {latestContract.adminSignedAt ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã Ký ({new Date(latestContract.adminSignedAt).toLocaleDateString('vi-VN')})
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Chờ Admin Ký
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] space-y-1">
              <span className="text-[11px] text-[#64748B]">Chữ ký Bên B (Studio)</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {latestContract.studioSignedAt ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã Ký ({new Date(latestContract.studioSignedAt).toLocaleDateString('vi-VN')})
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Chờ Studio Ký
                  </span>
                )}
              </div>
            </div>
          </div>

          {latestContract.terms && (
            <div className="p-3.5 rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs space-y-1">
              <span className="font-semibold text-[#0F172A] dark:text-slate-200">Điều khoản làm việc B2B:</span>
              <p className="text-[#64748B] dark:text-slate-400 whitespace-pre-line line-clamp-3">{latestContract.terms}</p>
            </div>
          )}

          {isAdmin && (
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 rounded-full px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo / Gửi Hợp Đồng Mẫu Mới</span>
              </button>

              {latestContract.status !== 'SIGNED' && (
                <button
                  type="button"
                  onClick={() => handleOpenSign(latestContract)}
                  className="inline-flex items-center gap-1.5 bg-[#121212] dark:bg-white text-white dark:text-[#121212] hover:bg-black dark:hover:bg-slate-100 rounded-full px-5 py-2 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Xem & Ký Hợp Đồng B2B</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.08] space-y-3">
          <p className="text-xs text-[#64748B]">
            Chưa có hợp đồng B2B nào cho dự án này. Admin có thể duyệt Kịch bản Final hoặc chủ động tạo hợp đồng mẫu gửi Studio ngay.
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#121212] dark:bg-white text-white dark:text-[#121212] rounded-full px-5 py-2 text-xs font-semibold hover:bg-black transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Hợp Đồng Mẫu B2B</span>
            </button>
          )}
        </div>
      )}

      {/* Sign Contract Modal */}
      <SignContractModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        contract={selectedContract}
        projectId={projectId}
        onContractSigned={() => {
          void contractsResource.reload();
        }}
      />

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultProjectId={projectId}
        onCreated={() => {
          void contractsResource.reload();
        }}
      />
    </div>
  );
}
