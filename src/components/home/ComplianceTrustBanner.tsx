'use client';

import Link from 'next/link';
import { ShieldCheck, Cpu, Coins, Sparkles, ArrowRight, CheckCircle2, FileCheck, Layers, Award, ArrowUpRight } from 'lucide-react';

export default function ComplianceTrustBanner() {
  const steps = [
    {
      number: '01',
      phase: 'KHỞI TẠO & SÁNG TÁC',
      role: 'Maker Studio',
      title: 'Hồ Sơ Kỹ Thuật & Khai Báo Model AI',
      desc: 'Studio nộp kịch bản phân cảnh, prompt kỹ thuật và video master 4K. Minh bạch 100% công cụ tạo sinh (Sora, Runway, Midjourney).',
      badge: 'Bản Quyền Gốc',
      badgeClass: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
      icon: Cpu,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15 border-purple-500/30 shadow-purple-500/20',
      metric: 'Kiểm tra bản quyền & Deepfake tự động',
      tag: 'Khai báo minh bạch',
    },
    {
      number: '02',
      phase: 'THẨM ĐỊNH ĐỘC LẬP',
      role: 'Reviewer Checker',
      title: 'Kiểm Duyệt & Cấp Tem Điều 44',
      desc: 'Hội đồng thẩm định độc lập rà soát 4 lớp an toàn: đạo đức nội dung, quyền nhân thân, cấp chứng chỉ số và gắn nhãn AI bắt buộc.',
      badge: 'Chuẩn Điều 44',
      badgeClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 shadow-emerald-500/20',
      metric: 'Cấp chứng nhận số VN-AIC 2026',
      tag: 'Đạt chuẩn xuất bản',
    },
    {
      number: '03',
      phase: 'CÔNG CHIẾU & DOANH THU',
      role: 'Viewer & OTT',
      title: 'Phát Hành 4K & Doanh Thu Tự Động',
      desc: 'Mã hóa HLS đa luồng phát hành độc quyền trên AI Cinema. Khán giả mở khóa bằng ví Coin, đối soát doanh thu 70/30 tự động.',
      badge: 'Chia Sẻ 70/30',
      badgeClass: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
      icon: Coins,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30 shadow-amber-500/20',
      metric: 'Chia sẻ 70% doanh thu cho Studio',
      tag: 'Ví Coin tức thời',
    },
  ];

  return (
    <div className="my-12 px-4 sm:px-8 md:px-14">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0D1019] via-[#090C14] to-[#121624] border border-slate-800/80 dark:border-white/10 p-6 sm:p-10 shadow-2xl text-white transition-all">
        {/* Ambient Cinema Neon Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Top Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                <span>Bảo Chứng Bản Quyền & Tiêu Chuẩn Điện Ảnh AI 2026</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                Hệ Sinh Thái Phim AI Minh Bạch Theo Điều 44 Luật AI
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                Nền tảng OTT đầu tiên tại Việt Nam chuẩn hóa mô hình <strong className="text-white">Maker - Checker</strong> nghiêm ngặt, thực thi Điều 44 Luật số 134/2025/QH15 và Điều 18 NĐ 142/2026/NĐ-CP nhằm bảo vệ quyền tác giả, minh bạch mô hình tạo sinh và bảo đảm nguồn thu công bằng cho các AI Studio đối tác.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/reviewer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Cổng Thẩm Định Maker-Checker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3 Step Interactive Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="group relative rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
                >
                  {/* Top Phase Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-md ${step.iconBg}`}
                      >
                        <Icon className={`w-5 h-5 ${step.iconColor}`} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${step.badgeClass}`}>
                          {step.badge}
                        </span>
                        <span className="text-xl font-black font-mono text-white/25 group-hover:text-white/50 transition-colors">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                      {step.phase}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {step.title}
                    </h4>

                    <p className="text-xs text-slate-300/80 leading-relaxed mb-4">
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom Distinct Indicator */}
                  <div className="pt-3.5 mt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{step.metric}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      {step.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
