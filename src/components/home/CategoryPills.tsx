'use client';

import { useState } from 'react';
import { genreCategories } from '@/mocks/mockData';

interface CategoryPillsProps {
  onSelectCategory?: (category: string) => void;
}

export default function CategoryPills({ onSelectCategory }: CategoryPillsProps) {
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const handleSelect = (cat: string) => {
    setActiveCategory(cat);
    onSelectCategory?.(cat);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      {genreCategories.map((cat) => {
        const isActive = activeCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-ruby text-white font-bold shadow-md shadow-ruby/30 scale-105 border border-ruby'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 shadow-sm'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
