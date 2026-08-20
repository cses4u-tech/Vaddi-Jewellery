import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category, MetalType } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedMetal: MetalType;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedMetal,
}) => {
  const { language, t } = useLanguage();

  const filteredCategories = categories.filter((cat) => {
    if (selectedMetal === 'All') return true;
    return cat.metal.toLowerCase() === selectedMetal.toLowerCase();
  });

  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-stone-300">
      <div className="flex items-center gap-2 min-w-max px-1">
        {/* All Categories Button */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          {t('all_categories')}
        </button>

        {/* Dynamic Category Chips */}
        {filteredCategories.map((cat) => {
          const isSelected = selectedCategory === cat.name || selectedCategory === cat.name_te;
          const displayName = language === 'te' ? cat.name_te : cat.name;

          return (
            <button
              key={cat.id}
              type="button"
              id={`cat-btn-${cat.slug}`}
              onClick={() => onSelectCategory(cat.name)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? cat.metal === 'Gold'
                    ? 'bg-amber-100 text-amber-950 border border-amber-400 font-bold shadow-xs'
                    : 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cat.metal === 'Gold' ? 'bg-amber-500' : 'bg-slate-400'
                }`}
              />
              <span>{displayName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
