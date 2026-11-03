'use client';

import { useAppStore } from '@/store/useAppStore';

const countryOptions = ['Tất cả quốc gia', 'Việt Nam AI', 'Âu Mỹ', 'Hàn Quốc', 'Nhật Bản', 'Trung Quốc'];
const yearOptions = ['Tất cả năm', '2026', '2025', '2024'];

interface FilterDropdownProps {
  label: string;
  selected: string;
  /** The "all" option as shown in the list, stored as plain "Tất cả". */
  allOption: string;
  options: string[];
  widthClass: string;
  onSelect: (value: string) => void;
}

function FilterDropdown({ label, selected, allOption, options, widthClass, onSelect }: FilterDropdownProps) {
  return (
    <div className="relative group/filter">
      <button className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
        <span>{selected === 'Tất cả' ? label : selected}</span>
        <span className="text-[10px] text-slate-400">▾</span>
      </button>

      <div
        className={`absolute top-full left-0 mt-1 ${widthClass} bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-2 hidden group-hover/filter:block z-50 animate-scale-in`}
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option.replace(allOption, 'Tất cả'))}
            className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-white/10 font-medium transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Genre, country and year filters of the public catalog header. */
export default function CatalogFilterNav() {
  const { genres, selectedGenre, setSelectedGenre, selectedCountry, setSelectedCountry, selectedYear, setSelectedYear } =
    useAppStore();
  const genreOptions = ['Tất cả thể loại', ...genres.map((g) => g.name)];

  return (
    <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-zinc-300">
      <FilterDropdown
        label="Thể loại"
        selected={selectedGenre}
        allOption="Tất cả thể loại"
        options={genreOptions}
        widthClass="w-48"
        onSelect={setSelectedGenre}
      />
      <FilterDropdown
        label="Quốc gia"
        selected={selectedCountry}
        allOption="Tất cả quốc gia"
        options={countryOptions}
        widthClass="w-44"
        onSelect={setSelectedCountry}
      />
      <FilterDropdown
        label="Năm"
        selected={selectedYear}
        allOption="Tất cả năm"
        options={yearOptions}
        widthClass="w-36"
        onSelect={setSelectedYear}
      />
    </nav>
  );
}
