'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileSignature, Plus, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { productionService } from '@/services/productionService';
import type { ProjectSummary } from '@/types/production';
import { CreateContractModal } from './CreateContractModal';
import { SignContractModal } from './SignContractModal';

export function ContractsInboxPanel() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [signOpen, setSignOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await productionService.listProjects({ page: 1, limit: 20 });
        if (mounted && res?.data?.data) {
          setProjects(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load projects:', err);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-5 font-sans">
      {/* Header Action Bar */}
      <div className="rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-[#0F172A] dark:text-white shrink-0">
            <FileSignature className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              Quản Lý Hợp Đồng Điện Tử B2B & Studio
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Tạo hợp đồng mẫu gửi Studio điền báo giá (VNĐ), xem xét đề xuất và ký số 2 bên trước khi sản xuất.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedProjectId(undefined);
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-[#121212] dark:bg-white text-white dark:text-[#121212] hover:bg-black dark:hover:bg-slate-100 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Hợp Đồng Mẫu</span>
        </button>
      </div>

      {/* Project Contract List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#0F172A] dark:text-white">
                  Cyber Saigon 2077: Mạng Lưới Ngầm
                </span>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-0.5 text-xs font-medium inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Chờ Admin ký duyệt
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Đối tác: Saigon VFX Studio • Báo giá đề xuất: <strong>150,000,000 VND</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSignOpen(true)}
                className="inline-flex items-center gap-1.5 border border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Xem Báo Giá & Ký Số</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0F172A] dark:text-white truncate">
                    {p.title}
                  </h3>
                  {p.status === 'COMPLETED' ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[11px] font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đã ký hợp đồng
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                      {p.studio ? `Studio: ${p.studio.name}` : 'Chưa gắn Studio'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B]">
                  {p._count?.episodes || 1} tập phim • Cập nhật {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setCreateOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 hover:bg-slate-50 rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Hợp Đồng Mẫu</span>
                </button>

                <Link
                  href={`/admin/projects/${p.id}?tab=studio`}
                  className="inline-flex items-center gap-1.5 bg-[#121212] dark:bg-white text-white dark:text-[#121212] hover:bg-black rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                >
                  <span>Chi tiết hợp đồng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateContractModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultProjectId={selectedProjectId}
      />

      <SignContractModal
        isOpen={signOpen}
        onClose={() => setSignOpen(false)}
      />
    </div>
  );
}
