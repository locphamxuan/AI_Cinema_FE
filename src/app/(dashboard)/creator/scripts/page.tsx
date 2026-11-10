'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ArrowUpRight,
  ArrowRight,
  Film,
  Plus,
  Search,
  Download,
  Edit3,
  FileText,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { productionService } from '@/services/productionService';
import { scriptService } from '@/services/scriptService';
import { Modal } from '@/components/ui/Modal';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';

interface ScriptLibraryItem {
  id: string;
  projectId: string;
  projectTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  scenesCount: number;
  pagesCount: number;
  status: 'APPROVED' | 'IN_REVIEW' | 'DRAFT';
  version: string;
  lastEdited: string;
  logline: string;
}

const SCRIPTS_DATA: ScriptLibraryItem[] = [
  {
    id: 'script-cyber-ep1',
    projectId: 'proj-cyber-saigon',
    projectTitle: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077',
    episodeNumber: 1,
    episodeTitle: 'Tập 1: Bóng Đêm Neon',
    scenesCount: 24,
    pagesCount: 38,
    status: 'APPROVED',
    version: 'v3.2 Final',
    lastEdited: '08/11/2026',
    logline: 'Điều tra viên Quân thâm nhập khu chợ đen Tân Định để truy vết lõi lượng tử bị đánh cắp.',
  },
  {
    id: 'script-cyber-ep2',
    projectId: 'proj-cyber-saigon',
    projectTitle: 'Kỷ Nguyên Vô Tận: Cyber Saigon 2077',
    episodeNumber: 2,
    episodeTitle: 'Tập 2: Tín Hiệu Lạc',
    scenesCount: 19,
    pagesCount: 32,
    status: 'APPROVED',
    version: 'v2.8 Final',
    lastEdited: '07/11/2026',
    logline: 'Băng đảng người máy phát hiện ra danh tính gián điệp, mở màn cuộc săn lùng xuyên đêm trên cầu Ba Son.',
  },
  {
    id: 'script-neo-hanoi-ep3',
    projectId: 'proj-neo-hanoi',
    projectTitle: 'Mạng Lưới Sinh Học: Neo Hanoi 2085',
    episodeNumber: 3,
    episodeTitle: 'Tập 3: Mã Nguồn Cấm',
    scenesCount: 22,
    pagesCount: 35,
    status: 'IN_REVIEW',
    version: 'v1.4 Draft',
    lastEdited: '06/11/2026',
    logline: 'Tiến sĩ Lan phát hiện mã gen nhân bản bất hợp pháp ẩn giấu ngay trong kho lưu trữ quốc gia.',
  },
  {
    id: 'script-ares-ep1',
    projectId: 'proj-ares-mars',
    projectTitle: 'Biên Niên Sử Sao Hỏa: Ares-7',
    episodeNumber: 1,
    episodeTitle: 'Tập 1: Bão Bụi Đỏ',
    scenesCount: 16,
    pagesCount: 28,
    status: 'DRAFT',
    version: 'v0.9 Bản thảo',
    lastEdited: '05/11/2026',
    logline: 'Tàu thám hiểm Ares-7 gặp nạn tại hẻm núi Valles Marineris và phát hiện di tích ngoài hành tinh.',
  },
];

export default function ScreenplayLibraryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'IN_REVIEW' | 'DRAFT'>('ALL');
  const [realScripts, setRealScripts] = useState<ScriptLibraryItem[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [scriptContent, setScriptContent] = useState('');
  const [scriptNote, setScriptNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await productionService.listProjects({ page: 1, limit: 20 });
        if (mounted && res?.data?.data && res.data.data.length > 0) {
          const mapped: ScriptLibraryItem[] = res.data.data.map((p) => ({
            id: `script-${p.id}`,
            projectId: p.id,
            projectTitle: p.title,
            episodeNumber: 1,
            episodeTitle: 'Tập 1: Khởi nguồn',
            scenesCount: 20,
            pagesCount: 35,
            status:
              p.status === 'COMPLETED'
                ? 'APPROVED'
                : p.status === 'UNDER_REVISION'
                  ? 'IN_REVIEW'
                  : 'DRAFT',
            version: 'v1.0 Final',
            lastEdited: new Date(p.updatedAt).toLocaleDateString('vi-VN'),
            logline: 'Kịch bản phân cảnh chuẩn hóa theo quy trình sản xuất AI Cinema OTT.',
          }));
          setRealScripts(mapped);
          setSelectedProjectId(res.data.data[0].id);
        }
      } catch (e) {
        console.warn('Real scripts fetch note:', e);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const activeScripts = realScripts.length > 0 ? realScripts : SCRIPTS_DATA;
  const filtered = activeScripts.filter((item) => {
    if (filter !== 'ALL' && item.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.projectTitle.toLowerCase().includes(q) ||
        item.episodeTitle.toLowerCase().includes(q) ||
        item.logline.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportPdf = (title: string, version: string) => {
    toast.success(
      'Xuất kịch bản phân cảnh PDF',
      `Đang tải xuống bản in "${title}" (${version}) chuẩn định dạng Final Draft.`
    );
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptContent.trim()) return;
    setSubmitting(true);
    try {
      const targetId = selectedProjectId || activeScripts[0]?.projectId || 'proj-cyber-saigon';
      await scriptService.submitVersion(targetId, {
        content: scriptContent.trim(),
        note: scriptNote.trim() || undefined,
      });
      toast.success(
        'Đã nộp kịch bản phân cảnh!',
        'Bản thảo đã được chuyển vào hàng đợi thẩm định của Reviewer.'
      );
      setComposeOpen(false);
      setScriptContent('');
      setScriptNote('');
    } catch (err) {
      toast.error('Không thể nộp kịch bản', err instanceof Error ? err.message : 'Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ScriptLibraryItem['status']) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          ĐÃ DUYỆT FINAL
        </span>
      );
    }
    if (status === 'IN_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          ĐANG THẨM ĐỊNH
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10">
        <FileText className="w-3.5 h-3.5" />
        BẢN THẢO
      </span>
    );
  };

  const filterOptions: { key: typeof filter; label: string }[] = [
    { key: 'ALL', label: 'Tất cả kịch bản' },
    { key: 'APPROVED', label: 'Đã thông qua' },
    { key: 'IN_REVIEW', label: 'Đang thẩm định' },
    { key: 'DRAFT', label: 'Bản thảo' },
  ];

  const featuredTitle =
    realScripts.length > 0 ? realScripts[0].projectTitle : 'KỶ NGUYÊN VÔ TẬN: CYBER SAIGON';

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] dark:bg-[#090B10] text-[#111827] dark:text-slate-100 font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
        {/* ── B. KHUNG HEADER TRANG (CONTRA / JITTER STYLE) ── */}
        <div className="space-y-6">
          {/* Top Utility Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/creator/projects"
              title="Đóng"
              className="w-9 h-9 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-[#111827] dark:hover:text-white hover:shadow-xs transition-all"
            >
              <X className="w-4 h-4" />
            </Link>

            <Link
              href="/creator/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#111827] dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <span>Quay lại Dự án</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Author & Project Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111420] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#121212] dark:bg-white text-white dark:text-[#121212] flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                <Film className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#111827] dark:text-white">
                  Dự Án Kịch Bản: {realScripts.length > 0 ? realScripts[0].projectTitle : 'Cyber Saigon 2077'}
                </h1>
                <p className="text-sm text-[#64748B] dark:text-slate-400">
                  Biên soạn bởi: <span className="font-medium text-[#111827] dark:text-slate-200">In-house Creator Team</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={
                  activeScripts[0]?.projectId
                    ? `/creator/projects/${activeScripts[0].projectId}`
                    : '/creator/projects'
                }
                className="border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all"
              >
                Xem chi tiết
              </Link>
              <button
                type="button"
                onClick={() => setComposeOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#121212] dark:bg-white text-white dark:text-[#121212] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-black dark:hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Soạn kịch bản mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── C. THANH FILTER & TÌM KIẾM DẠNG PILL ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((opt) => {
              const active = filter === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFilter(opt.key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-xs'
                      : 'bg-white dark:bg-white/[0.04] text-[#64748B] dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên phim, tập, phân cảnh..."
              className="w-full rounded-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 pl-9 pr-4 py-1.5 text-sm text-[#111827] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#121212] dark:focus:border-white/40 transition-all"
            />
          </div>
        </div>

        {/* ── D. KHUNG SHOWCASE KỊCH BẢN NỔI BẬT (CONTRA DARK HERO CARD) ── */}
        <section className="rounded-3xl bg-[#0E1117] p-8 sm:p-10 text-white relative overflow-hidden shadow-md">
          {/* Decorative subtle glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase bg-white/10 text-slate-200 border border-white/15">
              <Film className="w-3.5 h-3.5 text-slate-300" />
              DỰ ÁN TRỌNG ĐIỂM SẮP CHUYỂN GIAO STUDIO
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">
              {featuredTitle}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              5 Tập • Đã hoàn thiện 100% phân cảnh & lời thoại • Đang lập hợp đồng mẫu cho Studio ngoài
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setComposeOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-[#121212] rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
              >
                <span>Mở Trình Soạn Kịch Bản</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── E. DANH SÁCH CÁC KỊCH BẢN KHÁC (GRID 2 CỘT CONTRA CARDS) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111827] dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#64748B]" />
              <span>Danh sách kịch bản phân cảnh ({filtered.length})</span>
            </h3>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/70 dark:border-white/[0.08] p-12 text-center space-y-2 shadow-sm">
              <p className="text-sm font-semibold text-[#111827] dark:text-white">
                Không tìm thấy kịch bản phù hợp
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400 truncate">
                          {item.projectTitle}
                        </p>
                        <h4 className="text-base font-bold text-[#111827] dark:text-white leading-snug">
                          {item.episodeTitle}
                        </h4>
                      </div>
                      <div className="shrink-0">{getStatusBadge(item.status)}</div>
                    </div>

                    {/* Logline */}
                    <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed line-clamp-2">
                      {item.logline}
                    </p>

                    {/* Clean Metadata Line */}
                    <div className="pt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                      Số phân cảnh: <strong className="text-[#111827] dark:text-white">{item.scenesCount} Scenes</strong> • Độ dài:{' '}
                      <strong className="text-[#111827] dark:text-white">{item.pagesCount} Trang</strong> • Phiên bản:{' '}
                      <strong className="text-[#111827] dark:text-white">{item.version}</strong>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      Cập nhật: {item.lastEdited}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportPdf(item.episodeTitle, item.version)}
                        className="inline-flex items-center gap-1.5 border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Xuất PDF</span>
                      </button>
                      <Link
                        href={`/creator/projects/${item.projectId}?tab=episodes`}
                        className="inline-flex items-center gap-1.5 bg-[#121212] dark:bg-white text-white dark:text-[#121212] rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-black dark:hover:bg-slate-100 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh sửa</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal Soạn Kịch Bản Mới */}
      {composeOpen && (
        <Modal
          open
          onClose={() => setComposeOpen(false)}
          title="Soạn & Nộp Kịch Bản Phân Cảnh"
          subtitle="Biên soạn phân cảnh, lời thoại và nộp lên Reviewer thẩm định nội dung."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleComposeSubmit} className="space-y-4">
            {realScripts.length > 0 && (
              <FormField label="Dự án áp dụng">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className={fieldInputClass}
                >
                  {realScripts.map((s) => (
                    <option key={s.projectId} value={s.projectId}>
                      {s.projectTitle}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <FormField label="Nội dung kịch bản phân cảnh (Scene, Dialogue, Concept)">
              <textarea
                rows={7}
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                placeholder="CẢNH 1 — NỘI. KHU CHỢ ĐÊM TÂN ĐỊNH — ĐÊM&#10;&#10;Ánh đèn neon hắt xuống mặt đường ướt mưa..."
                required
                className={fieldTextareaClass}
              />
            </FormField>
            <FormField label="Ghi chú phiên bản (không bắt buộc)">
              <input
                type="text"
                value={scriptNote}
                onChange={(e) => setScriptNote(e.target.value)}
                placeholder="Ví dụ: Hoàn thiện lời thoại hồi 1 và mô tả bối cảnh AI"
                className={fieldInputClass}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="border border-slate-300 bg-white text-slate-800 rounded-full px-4 py-2 text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting || !scriptContent.trim()}
                className="bg-[#121212] text-white rounded-full px-5 py-2 text-xs font-semibold hover:bg-black disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Đang gửi...' : 'Nộp Thẩm Định'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
