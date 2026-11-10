'use client';

import { useState } from 'react';
import { MessageSquare, Send, Sparkles, UserRound } from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { useAction } from '@/hooks/useAction';
import { projectNoteService } from '@/services/projectNoteService';
import { useAppStore } from '@/store/useAppStore';
import type { ProjectNote } from '@/types/projectNote';
import { Button } from '@/components/ui/Button';

interface ProjectNotesSectionProps {
  projectId: string;
}

export function ProjectNotesSection({ projectId }: ProjectNotesSectionProps) {
  const user = useAppStore((state) => state.user);
  const [message, setMessage] = useState('');
  const { busy, run } = useAction();
  const notesResource = useResource(`project-notes:${projectId}`, () =>
    projectNoteService.listNotes(projectId)
  );

  const notes: ProjectNote[] = notesResource.data ?? [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    const ok = await run(
      () => projectNoteService.sendNote(projectId, { message: text }),
      'Đã gửi ý kiến trao đổi'
    );
    if (ok) {
      setMessage('');
      void notesResource.reload();
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-[#E50914] border border-red-500/20">Admin</span>;
      case 'CREATOR':
      case 'CONTENT_CREATOR':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Creator</span>;
      case 'REVIEWER':
      case 'CONTENT_REVIEWER':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Reviewer</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">Thành viên</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111420] p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-[#E50914]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Thống Nhất Ý Tưởng & Định Hướng (Bước 1)
              <span className="flex items-center gap-1 text-[11px] font-normal text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-500" /> Admin & Creator
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kênh trao đổi định hướng nghệ thuật, phong cách AI, bối cảnh và ý tưởng kịch bản trước khi triển khai phân cảnh.
            </p>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.08] text-xs text-slate-400">
            Chưa có ghi chú trao đổi nào. Admin hoặc Creator hãy bắt đầu gửi định hướng ý tưởng bên dưới!
          </div>
        ) : (
          notes.map((note) => {
            const isMe = user?.id === note.senderId;
            return (
              <div
                key={note.id}
                className={`p-3 rounded-xl border transition-colors ${
                  isMe
                    ? 'bg-red-500/5 border-red-500/20 ml-4'
                    : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] mr-4'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                      {note.sender?.fullName?.charAt(0) || <UserRound className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {note.sender?.fullName || 'Người dùng'}
                    </span>
                    {getRoleBadge(note.sender?.role)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(note.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-8">
                  {note.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập phản hồi, ý tưởng phong cách bối cảnh, phân vai nhân vật..."
          disabled={busy}
          className="flex-1 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#E50914] transition-all"
        />
        <Button
          type="submit"
          disabled={busy || !message.trim()}
          size="sm"
          className="bg-[#E50914] hover:bg-[#B81D24] text-white shrink-0 px-4 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Gửi</span>
        </Button>
      </form>
    </div>
  );
}
