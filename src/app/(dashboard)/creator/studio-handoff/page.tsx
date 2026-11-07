'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Handshake,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface StudioHandoffItem {
  id: string;
  projectTitle: string;
  studioName: string;
  contractNumber: string;
  signedDate: string;
  deliveryDate: string;
  status: 'CONTRACT_SIGNED' | 'IN_PRODUCTION' | 'NEGOTIATING' | 'REVIEWING_ASSETS';
  statusLabel: string;
  episodesCount: number;
  handoffAssets: {
    screenplay: boolean;
    characterBible: boolean;
    storyboard: boolean;
    voiceGuidelines: boolean;
  };
  contactPerson: string;
  notes: string;
}

const HANDOFF_DATA: StudioHandoffItem[] = [
  {
    id: 'handoff-cyber-saigon',
    projectTitle: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077',
    studioName: 'Studio Saigon VFX',
    contractNumber: 'HĐ-SGVFX-2026-088',
    signedDate: '02/11/2026',
    deliveryDate: '15/12/2026',
    status: 'IN_PRODUCTION',
    statusLabel: 'STUDIO ĐANG SẢN XUẤT',
    episodesCount: 5,
    handoffAssets: {
      screenplay: true,
      characterBible: true,
      storyboard: true,
      voiceGuidelines: true,
    },
    contactPerson: 'Trần Minh Hoàng (VFX Producer)',
    notes: 'Studio đã tiếp nhận toàn bộ 5 tập kịch bản phân cảnh; hiện đang thực hiện shot rendering cho tập 1 và 2.',
  },
  {
    id: 'handoff-iron-pulse',
    projectTitle: 'Biệt Đội Cơ Giới: Iron Pulse',
    studioName: 'AetherMind Production',
    contractNumber: 'HĐ-AETHER-2026-042',
    signedDate: '12/10/2026',
    deliveryDate: '28/11/2026',
    status: 'CONTRACT_SIGNED',
    statusLabel: 'ĐÃ KÝ HỢP ĐỒNG SẢN XUẤT',
    episodesCount: 4,
    handoffAssets: {
      screenplay: true,
      characterBible: true,
      storyboard: true,
      voiceGuidelines: false,
    },
    contactPerson: 'Lê Thu Trang (Production Manager)',
    notes: 'Đã hoàn tất chuyển giao tài sản kịch bản và storyboard mẫu; chờ nghiệm thu voice guidelines.',
  },
  {
    id: 'handoff-atlantica',
    projectTitle: 'Thành Phố Dưới Đáy Biển: Atlantica',
    studioName: 'Neo Hanoi VFX Lab',
    contractNumber: 'DỰ THẢO HĐ-NEO-2026-104',
    signedDate: 'Dự kiến 10/11/2026',
    deliveryDate: '20/01/2027',
    status: 'NEGOTIATING',
    statusLabel: 'ĐANG THƯƠNG LƯỢNG HỢP ĐỒNG',
    episodesCount: 6,
    handoffAssets: {
      screenplay: true,
      characterBible: true,
      storyboard: false,
      voiceGuidelines: false,
    },
    contactPerson: 'Nguyễn Đăng Khoa (Technical Director)',
    notes: 'Kịch bản phân cảnh 6 tập đã chốt Final. Admin và Pháp chế đang đàm phán phụ lục chi phí với Neo Hanoi VFX Lab.',
  },
];

export default function StudioHandoffPage() {
  const [filter, setFilter] = useState<'ALL' | 'IN_PRODUCTION' | 'CONTRACT_SIGNED' | 'NEGOTIATING'>('ALL');

  const filtered = HANDOFF_DATA.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const handleInspectPackage = (projectTitle: string) => {
    toast.info(
      'Gói tài sản kịch bản bàn giao',
      `Tất cả kịch bản, hồ sơ thiết lập nhân vật của "${projectTitle}" đã được đóng gói kiểm toán.`
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0D0F17] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Greeting Card */}
        <header className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-400/10 border border-amber-200/60 dark:border-amber-400/20 text-amber-800 dark:text-amber-300 mb-2">
              <Handshake className="w-3.5 h-3.5" />
              <span>Chuyển Giao Sản Xuất & Hợp Đồng Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tiến Độ Chuyển Giao Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Theo dõi tiến trình ký kết hợp đồng gia công phim, bàn giao storyboard & kịch bản phân cảnh cho các đối tác Studio bên ngoài.
            </p>
          </div>

          <Link
            href="/creator/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <span>Quay lại Kịch Bản</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Top 3 Metric Cards for Handoff */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-6 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hợp Đồng Đã Ký</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">4 Dự án</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã bàn giao gói kịch bản
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-6 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang Gia Công Phim</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">2 Studio</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5" /> Theo sát tiến độ dựng phim
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-6 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang Đàm Phán Ký Kết</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">1 Dự án</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1 font-semibold">
              <Handshake className="w-3.5 h-3.5" /> Thẩm định giá thầu sản xuất
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'ALL', label: 'Tất cả chuyển giao' },
            { key: 'IN_PRODUCTION', label: 'Đang sản xuất' },
            { key: 'CONTRACT_SIGNED', label: 'Đã ký hợp đồng' },
            { key: 'NEGOTIATING', label: 'Đang thương lượng' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.key
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold'
                  : 'bg-white dark:bg-[#141724] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Handoff Projects */}
        <div className="space-y-4">
          {filtered.map((item) => {
            const isProd = item.status === 'IN_PRODUCTION';
            const isSigned = item.status === 'CONTRACT_SIGNED';

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-1 ${
                        isProd
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                          : isSigned
                            ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30'
                            : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30'
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.projectTitle}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Building2 className="w-3.5 h-3.5" />
                        {item.studioName}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{item.contractNumber}</span>
                      <span>•</span>
                      <span>Quy mô: {item.episodesCount} tập kịch bản</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleInspectPackage(item.projectTitle)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Xem Hồ Sơ Bàn Giao</span>
                    </button>
                    <Link
                      href="/creator/projects"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>Kịch Bản Chi Tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Handoff Assets Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                  {[
                    { label: 'Kịch bản phân cảnh', checked: item.handoffAssets.screenplay },
                    { label: 'Thiết lập nhân vật (Bible)', checked: item.handoffAssets.characterBible },
                    { label: 'Phác thảo Storyboard', checked: item.handoffAssets.storyboard },
                    { label: 'Hướng dẫn lồng tiếng', checked: item.handoffAssets.voiceGuidelines },
                  ].map((asset, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold ${
                        asset.checked
                          ? 'bg-emerald-50 dark:bg-emerald-500/[0.08] border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] text-slate-400'
                      }`}
                    >
                      {asset.checked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{asset.label}</span>
                    </div>
                  ))}
                </div>

                {/* Notes & Timeline */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <p className="leading-relaxed">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Tình trạng chuyển giao:</span> {item.notes}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
                    <span>Ký hợp đồng: <strong className="text-slate-800 dark:text-slate-200">{item.signedDate}</strong></span>
                    <span>Studio giao phim: <strong className="text-slate-800 dark:text-slate-200">{item.deliveryDate}</strong></span>
                    <span>Đại diện Studio: <strong className="text-amber-600 dark:text-amber-400">{item.contactPerson}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
