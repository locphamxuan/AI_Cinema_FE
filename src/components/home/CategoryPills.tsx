'use client';

import { useAppStore } from '@/store/useAppStore';

interface CategoryPillsProps {
  onSelectCategory?: (category: string) => void;
}

function CategoryIcon({ category, className = 'w-3.5 h-3.5' }: { category: string; className?: string }) {
  switch (category) {
    case 'Tất cả':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'Khoa học viễn tưởng':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="6" />
          <path d="M3 12c0-3.5 8-6 18-6" />
          <path d="M3 12c0 3.5 8 6 18 6" />
        </svg>
      );
    case 'Hành động':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'Tâm lý':
    case 'Bí ẩn':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function CategoryPills({ onSelectCategory }: CategoryPillsProps) {
  const { selectedGenre, setSelectedGenre, genres } = useAppStore();
  const categories = ['Tất cả', ...genres.map((g) => g.name)];

  const handleSelect = (cat: string) => {
    setSelectedGenre(cat);
    onSelectCategory?.(cat);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      {categories.map((cat) => {
        const isActive = selectedGenre === cat || (selectedGenre === 'Tất cả' && cat === 'Tất cả');

        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-ruby text-white font-bold shadow-md shadow-ruby/30 scale-105 border border-ruby'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 shadow-sm'
            }`}
          >
            <CategoryIcon category={cat} className="w-3.5 h-3.5" />
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
