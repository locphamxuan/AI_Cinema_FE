/** The logo and tagline above the sign-in / sign-up form. */
export default function AuthBrand() {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-ruby via-ruby-dark to-slate-950 border border-ruby/40 mb-3 shadow-xl shadow-ruby/25 ring-4 ring-ruby/10">
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-sm font-black text-white tracking-wider">AI</span>
          <span className="text-[8px] font-black text-rose-200 tracking-widest uppercase">CINEMA</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground">AI Cinema</h2>
      <p className="text-xs text-slate-500 dark:text-muted-light mt-1">Nền tảng xem phim do AI tạo, dành cho người từ 18 tuổi.</p>
    </div>
  );
}
