'use client';

import { Building2, Sparkles, Film, ArrowRight, ShieldCheck } from 'lucide-react';

interface StudioPartner {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  techStack: string[];
  bannerUrl: string;
  logoInitial: string;
  accentColor: string;
}

const STUDIOS: StudioPartner[] = [
  {
    id: 'cybersaigon',
    name: 'CyberSaigon AI Studios',
    tagline: 'Phim Cyberpunk Viễn Tưởng Độc Quyền',
    badge: 'ĐỐI TÁC HẠNG A+',
    techStack: ['Runway Gen-3', 'Sora Turbo', 'Unreal 5.4'],
    bannerUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    logoInitial: 'CS',
    accentColor: '#8B5CF6',
  },
  {
    id: 'laclong',
    name: 'Lạc Long 3D VFX Lab',
    tagline: 'Hoạt Hình 3D Dân Gian & Sử Thi Việt',
    badge: 'STUDIO 3D HÀNG ĐẦU',
    techStack: ['Luma Dream Machine', 'Midjourney v6', 'Houdini'],
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    logoInitial: 'LL',
    accentColor: '#10B981',
  },
  {
    id: 'astronova',
    name: 'AstroNova AI Studio',
    tagline: 'Vũ Trụ Không Gian & Khoa Học Viễn Tưởng',
    badge: 'CÔNG NGHỆ 4K',
    techStack: ['Kling AI', 'Topaz Video 4K', 'ElevenLabs'],
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    logoInitial: 'AN',
    accentColor: '#38BDF8',
  },
  {
    id: 'dongphuong',
    name: 'Đông Phương AI Animation',
    tagline: 'Võ Lâm Kiếm Hiệp & Thủy Mặc AI',
    badge: 'XUẤT SẮC 2026',
    techStack: ['ComfyUI Custom', 'SDXL Turbo', 'AudioCraft'],
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    logoInitial: 'ĐP',
    accentColor: '#F59E0B',
  },
];

interface StudioPartnerShowcaseProps {
  onSelectStudio: (studioName: string) => void;
}

export default function StudioPartnerShowcase({ onSelectStudio }: StudioPartnerShowcaseProps) {
  return (
    <div className="my-12 px-4 sm:px-8 md:px-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#8B5CF6] to-cyan-500 shadow-md shadow-purple-600/30" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mạng Lưới AI Studio Đối Tác (Maker Network)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Các hãng phim độc lập và Studio đồ họa AI sản xuất và phát hành chính ngạch trên nền tảng
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold transition">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Ký cam kết bản quyền & Tuân thủ Điều 44</span>
        </div>
      </div>

      {/* Grid of Studio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STUDIOS.map((studio) => (
          <div
            key={studio.id}
            onClick={() => onSelectStudio(studio.name)}
            className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-[0_12px_30px_rgba(139,92,246,0.2)] cursor-pointer flex flex-col justify-between shadow-sm"
          >
            {/* Studio Cover Banner */}
            <div className="h-28 relative overflow-hidden bg-black">
              <img
                src={studio.bannerUrl}
                alt={studio.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Studio Badge */}
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/75 border border-white/20 text-[9px] font-bold text-slate-200 backdrop-blur-md">
                {studio.badge}
              </span>
            </div>

            {/* Studio Avatar & Body */}
            <div className="p-4 pt-3.5 relative z-10 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md border-2 border-slate-100 dark:border-white/10 group-hover:scale-105 transition-transform shrink-0"
                  style={{ backgroundColor: studio.accentColor }}
                >
                  {studio.logoInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {studio.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{studio.tagline}</p>
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                {studio.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] text-slate-600 dark:text-slate-300 font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Action Link */}
              <div className="pt-3 mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-semibold">
                <span>Khám phá phim của Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
