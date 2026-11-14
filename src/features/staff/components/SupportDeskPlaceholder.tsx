'use client';

import { Headphones, Bot, CheckCircle2, MessageSquare } from 'lucide-react';

export function SupportDeskPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
          <Headphones className="w-8 h-8" />
        </div>
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <Bot className="w-3.5 h-3.5" />
        </span>
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
          Bàn làm việc CSKH sẵn sàng
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Chọn một ca hỗ trợ từ danh sách bên trái để mở hội thoại trực tiếp với khách hàng, xem lịch sử tin nhắn hoặc áp dụng câu trả lời từ AI.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left pt-2">
        <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] space-y-1">
          <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold text-xs">
            <MessageSquare className="w-3.5 h-3.5" /> 1. Tiếp nhận
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Xem thành viên và nguyên nhân ca cần hỗ trợ.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] space-y-1">
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-xs">
            <Bot className="w-3.5 h-3.5" /> 2. Gợi ý AI
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Bấm "AI gợi ý" để tạo bản nháp câu trả lời chuẩn xác.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> 3. Giải quyết
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Gửi phản hồi và kết thúc ca hỗ trợ an toàn.
          </p>
        </div>
      </div>
    </div>
  );
}
