import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MetalType } from '../types';
import { Sparkles, Gem, Layers } from 'lucide-react';

interface MetalSelectorProps {
  selectedMetal: MetalType;
  onSelectMetal: (metal: MetalType) => void;
  goldCount: number;
  silverCount: number;
  totalCount: number;
}

export const MetalSelector: React.FC<MetalSelectorProps> = ({
  selectedMetal,
  onSelectMetal,
  goldCount,
  silverCount,
  totalCount,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center my-6">
      <div className="inline-flex p-1.5 bg-stone-200/70 backdrop-blur-sm rounded-xl border border-stone-300/80 shadow-inner gap-1 sm:gap-2">
        {/* All Items */}
        <button
          type="button"
          id="metal-filter-all"
          onClick={() => onSelectMetal('All')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedMetal === 'All'
              ? 'bg-[#1A1A1A] text-white shadow-sm'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/60'
          }`}
        >
          <Layers className="w-4 h-4 text-[#C5A869]" />
          <span>{t('metal_all')}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              selectedMetal === 'All' ? 'bg-stone-800 text-stone-200' : 'bg-stone-300 text-stone-700'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* 22K/24K Gold */}
        <button
          type="button"
          id="metal-filter-gold"
          onClick={() => onSelectMetal('Gold')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedMetal === 'Gold'
              ? 'bg-gradient-to-r from-[#DDA92B] to-[#B38F4D] text-[#1A1A1A] shadow-sm font-extrabold'
              : 'text-stone-700 hover:text-amber-900 hover:bg-amber-100/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-900 fill-current" />
          <span>{t('metal_gold')}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              selectedMetal === 'Gold' ? 'bg-amber-950 text-amber-100' : 'bg-stone-300 text-stone-700'
            }`}
          >
            {goldCount}
          </span>
        </button>

        {/* 92.5 Sterling Silver */}
        <button
          type="button"
          id="metal-filter-silver"
          onClick={() => onSelectMetal('Silver')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedMetal === 'Silver'
              ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-sm'
              : 'text-stone-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Gem className="w-4 h-4 text-slate-300" />
          <span>{t('metal_silver')}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              selectedMetal === 'Silver' ? 'bg-slate-950 text-slate-200' : 'bg-stone-300 text-stone-700'
            }`}
          >
            {silverCount}
          </span>
        </button>
      </div>
    </div>
  );
};
