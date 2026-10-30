'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CARD_NUMBER = '9704198526191432198';

/** The public VNPay sandbox test card, with a copy button, so testers need not look it up. */
export function VnpaySandboxCard() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(CARD_NUMBER)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setCopied(false));
  };

  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-blue-950/40 border border-indigo-500/30 p-3.5 sm:p-4 text-xs">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-300 font-bold">
          <span className="text-sm">💳</span>
          <span>Thẻ Thanh Toán Test Sandbox (Ngân hàng NCB)</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 border border-indigo-500/40 transition-colors flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Đã chép số thẻ</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Sao chép số thẻ</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] tabular-nums">
        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
          <span className="text-slate-400 block text-[10px]">Ngân hàng:</span>
          <span className="font-bold text-white text-xs">NCB</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
          <span className="text-slate-400 block text-[10px]">Số thẻ:</span>
          <span className="font-bold text-amber-400 text-xs">9704 1985 2619 1432</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
          <span className="text-slate-400 block text-[10px]">Tên chủ thẻ:</span>
          <span className="font-bold text-white text-xs">NGUYEN VAN A</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
          <span className="text-slate-400 block text-[10px]">Phát hành / OTP:</span>
          <span className="font-bold text-emerald-400 text-xs">07/15 • 123456</span>
        </div>
      </div>
    </div>
  );
}
