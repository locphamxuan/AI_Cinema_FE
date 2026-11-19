import Image from 'next/image';
import { Clapperboard } from 'lucide-react';

const R2 = 'https://pub-a25bed12bf0f4514910fbf5cba32666f.r2.dev/ai-film/posters';

/** Posters of AI films released on the platform (AI_Film catalogue on R2): what this back office runs. */
const POSTERS: [string, string][] = [
  ['nexus', 'Nexus'],
  ['quy-chua-thuc-tinh', 'Quỷ chúa thức tỉnh'],
  ['jackpot', 'JACKPOT'],
  ['mac-ngon-tam-dong', 'Mạc ngôn tâm động'],
  ['nha-tu-tu-than', 'Nhà tù tử thần'],
  ['hitoner', 'Hitoner'],
];

/**
 * The brand panel beside the sign-in form, on the black of the dashboard: what the back office is, the Admin
 * dashboard itself in a browser frame, and posters of the AI films it publishes.
 */
export default function AuthBrand() {
  return (
    <aside className="hero-ink relative order-2 hidden h-full flex-col justify-between gap-8 overflow-hidden rounded-3xl p-10 lg:flex">
      <div className="relative max-w-md space-y-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#121212]">
          <Clapperboard className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-4xl leading-tight font-semibold tracking-tight">Cổng quản trị &amp; sản xuất nội bộ</h2>
        <p className="text-sm text-white/70">Từ ý tưởng, kịch bản, hợp đồng Studio tới phát hành phim có gắn nhãn AI.</p>
      </div>

      <figure className="relative -mr-24 [transform:perspective(1800px)_rotateY(-9deg)] motion-reduce:transform-none">
        <div className="overflow-hidden rounded-xl border border-white/15 bg-[#0B0D12] shadow-2xl shadow-black/60">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
            <span className="ml-3 rounded-md bg-white/5 px-3 py-0.5 text-[11px] text-white/45">aicinema.vn/admin</span>
          </div>
          <Image
            src="/login/dashboard-preview.webp"
            alt="Trang Tổng quan của Admin: việc chờ duyệt, hợp đồng chờ ký và phim chờ phát hành"
            width={1440}
            height={600}
            sizes="(min-width: 1024px) 50vw, 0px"
            priority
            className="h-auto w-full"
          />
        </div>
      </figure>

      <div className="relative space-y-3">
        <p className="text-sm text-white/70">Phim AI đang phát hành trên nền tảng</p>
        <ul className="flex gap-3">
          {POSTERS.map(([slug, title]) => (
            <li key={slug} className="w-[15%] min-w-0 shrink-0">
              <Image
                src={`${R2}/${slug}.jpg`}
                alt={`Poster phim ${title}`}
                width={160}
                height={240}
                sizes="8vw"
                className="aspect-[2/3] w-full rounded-lg object-cover ring-1 ring-white/15"
              />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
