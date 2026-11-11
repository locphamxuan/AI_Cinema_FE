'use client';

import type { RefObject } from 'react';
import { Film, Send, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import type { SupportMessage, SupportQuickReply } from '@/types/support';
import { AiOrb } from './AiOrb';

const HERO_CARDS = [
  {
    title: 'Nạp Coin VNPay',
    desc: 'Hướng dẫn nạp nhanh & kiểm tra ví',
    icon: Wallet,
    tint: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    message: 'Làm sao để nạp Coin qua VNPay?',
  },
  {
    title: 'Gói Tháng VIP',
    desc: 'Quyền lợi & cấu hình gói thành viên',
    icon: Sparkles,
    tint: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
    message: 'Quyền lợi và cách đăng ký Gói Tháng?',
  },
  {
    title: 'Quy trình Điều 44',
    desc: 'Duyệt nội dung & phát hành phim OTT',
    icon: Film,
    tint: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    message: 'Quy trình duyệt Điều 44 và phát hành phim lên OTT?',
  },
  {
    title: 'Xác nhận 18+ (BR-54)',
    desc: 'Quy định độ tuổi khi đăng ký tài khoản',
    icon: ShieldCheck,
    tint: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    message: 'Quy định đăng ký tài khoản 18+ như thế nào?',
  },
];

interface AiChatBodyProps {
  loading: boolean;
  sending: boolean;
  isClosed: boolean;
  showHero: boolean;
  messages: SupportMessage[];
  quickReplies: SupportQuickReply[];
  draft: string;
  errorMsg: string | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onDraftChange: (val: string) => void;
  onSend: (text: string) => void;
  onStartNew: () => void;
}

/** Scrollable assistant greeting, messages, quick replies, and input footer. */
export function AiChatBody({
  loading,
  sending,
  isClosed,
  showHero,
  messages,
  quickReplies,
  draft,
  errorMsg,
  messagesEndRef,
  onDraftChange,
  onSend,
  onStartNew,
}: AiChatBodyProps) {
  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            Đang kết nối Trợ lý AI...
          </div>
        ) : (
          <>
            {showHero && (
              <div className="flex flex-col items-center py-2 text-center">
                <AiOrb size="lg" />
                <span className="mt-2.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-0.5 text-[11px] font-semibold text-pink-600 dark:border-pink-500/30 dark:bg-pink-500/15 dark:text-pink-300">
                  AI Smart Assistant
                </span>
                <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  Tôi có thể giúp gì cho bạn?
                </h3>
                <p className="mt-1 max-w-[280px] text-xs text-slate-500 dark:text-slate-400">
                  Chọn nhanh một chủ đề hoặc nhập câu hỏi bên dưới.
                </p>

                <div className="mt-3 grid w-full grid-cols-2 gap-2 text-left">
                  {HERO_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.title}
                        type="button"
                        onClick={() => onSend(card.message)}
                        disabled={sending}
                        className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
                      >
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-xl ${card.tint}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-white">{card.title}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                          {card.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              if (msg.senderType === 'SYSTEM') {
                return (
                  <p key={msg.id} className="py-1 text-center text-[11px] text-slate-400">
                    {msg.content}
                  </p>
                );
              }
              if (msg.senderType === 'MEMBER') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#121212] px-3.5 py-2 text-xs leading-relaxed text-white dark:bg-pink-600">
                      {msg.content}
                    </div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 pl-0.5">
                    <AiOrb size="xs" />
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {msg.senderType === 'STAFF' ? 'Nhân viên CSKH' : 'Trợ lý AI Cinema'}
                    </span>
                  </div>
                  <div className="max-w-[86%] rounded-2xl rounded-tl-sm border border-slate-200/80 bg-slate-50 px-3.5 py-2 text-xs leading-relaxed text-slate-800 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-100">
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <AiOrb size="xs" />
                <span>Trợ lý AI đang trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {errorMsg && (
        <div className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={onStartNew}
            className="shrink-0 rounded-full bg-[#121212] px-2.5 py-0.5 text-[11px] font-semibold text-white"
          >
            Thử mới
          </button>
        </div>
      )}

      {!isClosed && quickReplies.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 pb-2">
          {quickReplies.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onSend(chip.message)}
              disabled={sending}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/10"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      <footer className="border-t border-slate-200/70 p-3 dark:border-white/10">
        {isClosed ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Cuộc hội thoại đã kết thúc.</span>
            <button
              type="button"
              onClick={onStartNew}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#121212] px-4 py-2 text-xs font-semibold text-white hover:bg-black dark:bg-pink-600 dark:hover:bg-pink-500"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Cuộc hội thoại mới
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSend(draft);
            }}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 focus-within:border-slate-400 focus-within:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:focus-within:border-pink-400/60"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder="Hỏi Trợ lý AI bất kỳ điều gì..."
              disabled={sending || loading}
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={sending || loading || !draft.trim()}
              aria-label="Gửi tin nhắn"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#121212] text-white transition hover:bg-black disabled:opacity-40 dark:bg-pink-600 dark:hover:bg-pink-500"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </footer>
    </>
  );
}
