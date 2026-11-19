import { Clapperboard } from 'lucide-react';

const ROLES: [string, string][] = [
  ['Admin', 'Dự án, hợp đồng, phát hành và tài chính'],
  ['Reviewer · Creator', 'Kịch bản, thẩm định video Master, nhãn AI'],
  ['Staff', 'Hỗ trợ Member và tra cứu vận hành'],
];

/** The brand panel beside the sign-in form: the lit marquee of the screening room, and who works behind it. */
export default function AuthBrand() {
  return (
    <aside className="marquee relative order-2 hidden h-full overflow-hidden rounded-3xl lg:flex">
      <div className="absolute top-14 space-y-4 px-10">
        <Clapperboard className="size-10 text-highlight" aria-hidden="true" />
        <h2 className="max-w-lg font-display text-6xl leading-[0.9] font-bold tracking-wide">Phòng điều hành của AI Cinema</h2>
        <p className="max-w-md text-base text-white/80">Từ ý tưởng, kịch bản, hợp đồng Studio tới phát hành phim có gắn nhãn AI.</p>
      </div>
      <dl className="absolute bottom-10 grid w-full grid-cols-3 gap-6 px-10 text-sm">
        {ROLES.map(([role, text]) => (
          <div key={role} className="space-y-1 border-l-2 border-highlight/70 pl-3">
            <dt className="font-semibold text-highlight">{role}</dt>
            <dd className="text-white/75">{text}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
