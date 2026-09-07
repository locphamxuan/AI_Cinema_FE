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
                ? 'bg-white text-black font-bold shadow-lg shadow-white/20 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-muted-light hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
