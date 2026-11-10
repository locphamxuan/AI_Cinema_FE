'use client';

import { useState } from 'react';
import {
  FileSignature,
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Repeat,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { useAppStore } from '@/store/useAppStore';
import { contractService } from '@/services/contractService';
import type { Contract, ContractStatus } from '@/types/contract';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/format';
import { SignContractModal } from '@/features/admin/components/SignContractModal';

interface B2BContractCardProps {
  projectId: string;
}

export function B2BContractCard({ projectId }: B2BContractCardProps) {
  const user = useAppStore((state) => state.user);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hợp Đồng Hoàn Tất (Đủ 2 Chữ Ký)
          </span>
        );
      case 'STUDIO_SIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Studio Đã Báo Giá & Ký — Chờ Admin Duyệt
          </span>
        );
      case 'ADMIN_COUNTERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            <Repeat className="w-3.5 h-3.5" /> Admin Đã Đề Xuất Giá Mới — Chờ Studio Ký
          </span>
        );
      case 'SENT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
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
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111420] p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-[#E50914]">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hợp Đồng Sản Xuất B2B (Bước 3 & 4)
              </h3>
              {latestContract && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  Vòng {latestContract.round}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hệ thống tự động sinh hợp đồng mẫu $\rightarrow$ Studio báo giá (VNĐ) $\rightarrow$ Admin thương lượng & ký số đối ứng.
            </p>
          </div>
        </div>
        <div>{latestContract ? getStatusBadge(latestContract.status) : getStatusBadge('SENT')}</div>
      </div>

      {/* Contract Details */}
      {latestContract ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
              <span className="text-[11px] text-slate-400">Kinh phí sản xuất (VNĐ)</span>
              <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {latestContract.costVnd ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatNumber(Number(latestContract.costVnd))} VNĐ
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Chưa điền (Hợp đồng mẫu)</span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
              <span className="text-[11px] text-slate-400">Chữ ký Bên A (Admin Sàn)</span>
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

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
              <span className="text-[11px] text-slate-400">Chữ ký Bên B (Studio)</span>
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

          {/* Terms snippet */}
          {latestContract.terms && (
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Điều khoản làm việc B2B:</span>
              <p className="text-slate-500 dark:text-slate-400 line-clamp-2">{latestContract.terms}</p>
            </div>
          )}

          {/* Action Bar for Admin */}
          {isAdmin && latestContract.status !== 'SIGNED' && (
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <Button
                size="sm"
                onClick={() => handleOpenSign(latestContract)}
                className="bg-[#E50914] hover:bg-[#B81D24] text-white flex items-center gap-1.5"
              >
                <FileSignature className="w-4 h-4" />
                <span>Xem & Ký Hợp Đồng B2B</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.08] text-xs text-slate-400">
          Chưa có hợp đồng nào. Khi Admin phê duyệt Kịch bản Final (Bước 2), hệ thống sẽ tự động khởi tạo Hợp đồng mẫu gửi cho Studio.
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
    </div>
  );
}
