'use client';

import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Cpu,  Coins,  ArrowRight } from 'lucide-react';

export default function ComplianceTrustBanner() {
  const steps = [
    {
      number: '01',
      title: 'Studio Nộp Hồ Sơ Kỹ Thuật (Maker)',
      desc: 'Khai báo 100% công cụ AI (Runway, Sora, Midjourney), kịch bản gốc và nộp bản dựng video master chất lượng cao.',
      icon: Cpu,
      color: '#8B5CF6',
    },
    {
      number: '02',
      title: 'Thẩm Định & Gắn Nhãn Điều 44 (Checker)',
      desc: 'Ban kiểm duyệt đánh giá 4 vòng: An toàn nội dung, không xâm phạm hình tượng người thật, cấp chứng nhận nhãn AI bắt buộc.',
      icon: ShieldCheck,
      color: '#10B981',
    },
    {
      number: '03',
      title: 'Phát Hành OTT & Doanh Thu Ví Coin (Viewer)',
      desc: 'Mã hóa HLS đa độ phân giải 4K HDR. Người xem mở khóa tập bằng ví Coin với 70% doanh thu chuyển thẳng cho Studio.',
      icon: Coins,
      color: '#E50914',
    },
  ];

  return (
    <div className="my-12 px-4 sm:px-8 md:px-14">
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[#12151E] dark:via-[#0E1118] dark:to-[#151821] border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm dark:shadow-2xl transition-colors">
        {/* Ambient Glows for Dark mode */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

        <div className="relative z-10">
          {/* Badge & Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2.5 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Tiêu Chuẩn Pháp Lý Việt Nam</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Quy Trình Kiểm Duyệt & Gắn Nhãn Tuân Thủ Điều 44 Luật AI
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Nền tảng OTT đầu tiên tại Việt Nam áp dụng mô hình Maker - Checker nghiêm ngặt, thực thi Điều 44 Luật số 134/2025/QH15 và Điều 18 Nghị định số 142/2026/NĐ-CP về minh bạch nội dung tạo sinh bởi Trí tuệ Nhân tạo.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/reviewer"
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-2 transition backdrop-blur-md"
              >
                <span>Xem Cổng Kiểm Duyệt</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
              </Link>
            </div>
          </div>

          {/* 3 Step Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 transition-all duration-300 relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                        style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: step.color }} />
                      </div>
                      <span className="text-xs font-mono font-black text-slate-400 dark:text-slate-500">BƯỚC {step.number}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-slate-100 transition-colors">
                      {step.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đạt tiêu chuẩn xuất bản</span>
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
