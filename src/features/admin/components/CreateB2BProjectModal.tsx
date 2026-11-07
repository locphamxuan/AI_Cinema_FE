'use client';

import { useState } from 'react';
import { X, Plus, Sparkles, User, Clapperboard, Coins, FileText } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface CreateB2BProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: {
    id: string;
    title: string;
    genre: string;
    episodesCount: number;
    assignedCreator: string;
    budgetVnd: number;
    synopsis: string;
  }) => void;
}

export function CreateB2BProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateB2BProjectModalProps) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Sci-Fi / Cyberpunk');
  const [episodesCount, setEpisodesCount] = useState(5);
  const [assignedCreator, setAssignedCreator] = useState('Lê Minh Châu (In-house Screenwriter)');
  const [budgetVnd, setBudgetVnd] = useState(150000000);
  const [synopsis, setSynopsis] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Thiếu tên đề tài', 'Vui lòng nhập tên đề tài dự án phim mới.');
      return;
    }

    onProjectCreated({
      id: `proj-${Date.now()}`,
      title: title.trim(),
      genre,
      episodesCount,
      assignedCreator,
      budgetVnd,
      synopsis: synopsis.trim() || 'Đề tài kịch bản định hướng mới cho nền tảng OTT.',
    });

    toast.success(
      'Khởi Tạo Dự Án Thành Công!',
      `Đề tài "${title}" đã được bàn giao cho ${assignedCreator} để tiến hành soạn thảo kịch bản phân cảnh.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#111420] border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Khởi Tạo Đề Tài Dự Án Mới</h3>
              <p className="text-xs text-slate-400">Giao định hướng brief cho In-house Creator soạn thảo kịch bản</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tên đề tài */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200">Tên Đề Tài / Phim Dự Kiến *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Cyber Thăng Long 2088: Trận Chiến Lượng Tử"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#E50914] transition-all"
            />
          </div>

          {/* Grid: Thể loại + Số tập */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-200">Thể Loại Điện Ảnh</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-xl bg-[#0D1017] border border-white/[0.08] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E50914] cursor-pointer"
              >
                <option value="Sci-Fi / Cyberpunk">Sci-Fi / Cyberpunk</option>
                <option value="Hành Động / Kỹ Xảo AI">Hành Động / Kỹ Xảo AI</option>
                <option value="Huyền Bí / Thần Thoại Số">Huyền Bí / Thần Thoại Số</option>
                <option value="Kinh Dị / Tâm Lý Sinh Học">Kinh Dị / Tâm Lý Sinh Học</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-200">Số Tập Dự Kiến (Episodes)</label>
              <input
                type="number"
                min={1}
                max={24}
                value={episodesCount}
                onChange={(e) => setEpisodesCount(Number(e.target.value))}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          {/* Phân công In-house Creator */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200">Giao Cho In-house Screenwriter Phụ Trách</label>
            <select
              value={assignedCreator}
              onChange={(e) => setAssignedCreator(e.target.value)}
              className="w-full rounded-xl bg-[#0D1017] border border-white/[0.08] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E50914] cursor-pointer"
            >
              <option value="Lê Minh Châu (In-house Screenwriter)">Lê Minh Châu (Chuyên kịch bản Sci-Fi & Worldbuilding)</option>
              <option value="Nguyễn Hoàng Nam (Senior Screenwriter)">Nguyễn Hoàng Nam (Chuyên kịch bản Hành Động & Phân cảnh AI)</option>
              <option value="Trần Mỹ Linh (Creative Lead)">Trần Mỹ Linh (Chuyên kịch bản Tâm lý & Kịch tính)</option>
            </select>
          </div>

          {/* Ngân sách sản xuất dự kiến */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200">Ngân Sách Gia Công Dự Kiến (VND)</label>
            <input
              type="number"
              step={10000000}
              value={budgetVnd}
              onChange={(e) => setBudgetVnd(Number(e.target.value))}
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E50914]"
            />
          </div>

          {/* Định hướng kịch bản */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200">Mô Tả Định Hướng / Brief Sơ Bộ</label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Gợi ý concept bối cảnh, nhân vật chính, xung đột trung tâm để biên kịch triển khai kịch bản phân cảnh..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E50914] resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:bg-white/5 font-semibold transition-all cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#B81D24] text-white font-bold shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Khởi Tạo & Giao Kịch Bản</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
