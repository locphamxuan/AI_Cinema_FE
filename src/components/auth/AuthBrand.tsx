import { Clapperboard } from 'lucide-react';

const ROLES: [string, string][] = [
  ['Admin', 'Dự án, hợp đồng, phát hành và tài chính'],
  ['Reviewer · Creator', 'Kịch bản, thẩm định video Master, nhãn AI'],
  ['Staff', 'Hỗ trợ Member và tra cứu vận hành'],
];

/** The brand panel beside the sign-in form: who this back office is for, on the primary colour. */
export default function AuthBrand() {
  return (
    <aside className="relative order-2 hidden h-full overflow-hidden rounded-3xl bg-primary text-primary-foreground lg:flex">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[repeating-linear-gradient(135deg,currentColor_0_14px,transparent_14px_28px)] opacity-[0.06]"
      />
      <div className="absolute top-10 space-y-3 px-10">
        <Clapperboard className="size-10" aria-hidden="true" />
        <p className="text-sm font-semibold tracking-[0.2em] opacity-80">AI Cinema</p>
        <h2 className="max-w-md font-heading text-3xl leading-tight font-semibold">Cổng Quản Trị &amp; Sản Xuất Nội Bộ</h2>
        <p className="max-w-md text-sm opacity-80">Từ ý tưởng, kịch bản, hợp đồng Studio tới phát hành phim có gắn nhãn AI.</p>
      </div>
      <dl className="absolute bottom-10 grid w-full grid-cols-3 gap-6 px-10 text-sm">
        {ROLES.map(([role, text]) => (
          <div key={role} className="space-y-1 border-l border-primary-foreground/30 pl-3">
            <dt className="font-semibold">{role}</dt>
            <dd className="opacity-80">{text}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
