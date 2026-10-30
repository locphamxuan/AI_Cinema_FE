import { Calendar, Info, ShieldCheck } from 'lucide-react';
import type { Movie } from '@/types/movie';

/** Article 44 disclosure of a movie: the certified AI label and the age rating. */
export function MovieCompliancePanel({ compliance }: { compliance: Movie['aiCompliance'] }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-emerald-300">
            Chứng Nhận Tuân Thủ Pháp Lý Trí Tuệ Nhân Tạo (AI Compliance)
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Tác phẩm này đã được Ban Thẩm Định nền tảng kiểm tra, cấp mã chứng nhận và gắn nhãn theo{' '}
            <strong>{compliance.complianceArticle}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Nhãn nội dung AI</span>
          </div>
          <p className="text-sm font-bold text-white">{compliance.disclaimer}</p>
          <p className="text-[11px] text-slate-400">Reviewer gắn nhãn cho từng tập sau khi kiểm duyệt nội dung và pháp lý.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Phân loại độ tuổi</span>
          </div>
          <p className="text-sm font-bold text-white">{compliance.contentRating}</p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-400 italic leading-relaxed">
        &ldquo;{compliance.disclaimer}&rdquo;
      </div>
    </div>
  );
}

/** The movie's content brief and how episodes are released on the platform. */
export function MovieBriefPanel({ contentBrief }: { contentBrief?: string | null }) {
  return (
    <div className="space-y-4 animate-fade-in text-xs sm:text-sm text-slate-300 leading-relaxed">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span>Tóm tắt phim</span>
        </h4>
        <p>{contentBrief || 'Chưa có tóm tắt.'}</p>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
        <h4 className="font-bold text-white text-sm">Phát hành trên AI Cinema</h4>
        <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
          <li>Mỗi tập được kiểm duyệt nội dung và pháp lý trước khi phát hành.</li>
          <li>Các tập đầu của mỗi phim xem miễn phí; các tập sau mở khoá bằng Coin.</li>
          <li>Mọi tập đều mang nhãn nội dung AI.</li>
        </ul>
      </div>
    </div>
  );
}
