'use client';

import { useState } from 'react';
import { X, FileText, Plus, Building2, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { productionService } from '@/services/productionService';
import type { ScriptProjectItem } from './types';

interface RegisterProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectRegistered: (project: ScriptProjectItem) => void;
}

const GENRE_SUGGESTIONS = ['Sci-Fi', 'Cyberpunk', 'Trinh Thám', 'Bio-Thriller', 'Kỳ Ảo', 'Space Opera', 'Hành Động'];

export function RegisterProjectModal({ isOpen, onClose, onProjectRegistered }: RegisterProjectModalProps) {
  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [targetStudio, setTargetStudio] = useState('');
  const [episodesCount, setEpisodesCount] = useState(5);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Sci-Fi', 'Cyberpunk']);
  const [adminBrief, setAdminBrief] = useState('Định hướng kịch bản phân cảnh tiêu chuẩn OTT từ Admin System');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên dự án kịch bản');
      return;
    }

    setIsSubmitting(true);
    try {
      let backendId = `new-script-${Date.now()}`;
      try {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);
        const deadlineStr = deadline.toISOString().split('T')[0];

        const createdRes = await productionService.createProject({
          title: title.trim(),
          ideaDescription: logline.trim() || 'Kịch bản phân cảnh sản xuất phim OTT.',
          genreIds: [],
          defaultLanguage: 'vi',
          seasons: [
            {
              title: 'Phần 1',
              episodeProductionCost: 50,
              episodes: Array.from({ length: Math.max(1, episodesCount) }).map((_, i) => ({
                title: `Tập ${i + 1}`,
                targetDurationSeconds: 600,
                deliveryDeadline: deadlineStr,
              })),
            },
          ],
        });
        if (createdRes?.data?.id) {
          backendId = createdRes.data.id;
        }
      } catch (err) {
        console.warn('Backend project creation fallback:', err);
      }

      const newProject: ScriptProjectItem = {
        id: backendId,
        title: title.trim(),
        tagline: logline.trim() || 'Dự án kịch bản phân cảnh mới khởi tạo.',
        conceptArtUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        status: 'DRAFT',
        movieStatus: 'DRAFT',
        statusLabel: 'BẢN NHÁP KỊCH BẢN',
        genreTags: selectedGenres.length > 0 ? selectedGenres : ['Sci-Fi'],
        totalEpisodes: episodesCount,
        completedScriptEpisodes: 0,
        assignedBy: 'Admin System',
        assignedDate: new Date().toLocaleDateString('vi-VN'),
        partnerStudioName: targetStudio.trim() || 'Chưa chuyển giao Studio',
        contractStatus: 'Bản thảo kịch bản',
        reviewerName: 'Chưa phân công',
        lastUpdatedText: 'Vừa xong',
        notes: adminBrief.trim() || 'Khởi tạo kịch bản phân cảnh',
        approvedEpisodes: 0,
        revenueCoin: 0,
        studioName: targetStudio.trim() || 'Chưa chọn Studio',
        complianceBadge: {
          status: 'DRAFT',
          label: 'Bản nháp kịch bản phân cảnh',
        },
      };

      onProjectRegistered(newProject);
      toast.success('Đã tạo hồ sơ kịch bản phân cảnh mới!');
      onClose();
    } catch {
      toast.error('Không thể tạo hồ sơ kịch bản, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-[#111420] border border-white/[0.12] p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-[#E50914] flex items-center justify-center text-white shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Soạn Thảo Kịch Bản Mới</h2>
            <p className="text-xs text-slate-400">
              Khởi tạo hồ sơ kịch bản phân cảnh theo brief định hướng của Admin
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Script Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên Dự Án Kịch Bản <span className="text-[#E50914]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Kỷ Nguyên Vô Tận: Cyber Saigon 2077"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
            />
          </div>

          {/* Logline / Plot outline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ý Tưởng / Tóm Tắt Cốt Truyện (Logline)
            </label>
            <textarea
              rows={2}
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="Tóm tắt ngắn gọn tiền đề kịch bản, xung đột trung tâm và thế giới nghệ thuật..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
            />
          </div>

          {/* Studio Target & Episodes Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Studio Đề Xuất Chuyển Giao
              </label>
              <input
                type="text"
                value={targetStudio}
                onChange={(e) => setTargetStudio(e.target.value)}
                placeholder="VD: Studio Saigon VFX (hoặc để trống)"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E50914]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Số Tập Phân Cảnh
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={episodesCount}
                onChange={(e) => setEpisodesCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Thể Loại Kịch Bản
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_SUGGESTIONS.map((genre) => {
                const selected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#E50914] text-white shadow-xs font-bold'
                        : 'bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Brief Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Định Hướng Từ Admin System
            </label>
            <input
              type="text"
              value={adminBrief}
              onChange={(e) => setAdminBrief(e.target.value)}
              placeholder="Yêu cầu định hướng phân cảnh, thông điệp kịch bản..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E50914]"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E50914] hover:bg-[#B81D24] shadow-md shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tạo...' : 'Tạo Kịch Bản Phân Cảnh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
