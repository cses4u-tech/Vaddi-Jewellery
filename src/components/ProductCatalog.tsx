import React from 'react';
import { Product, Category, ShowroomSettings, MetalType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from './ProductCard';
import { CategoryBar } from './CategoryBar';
import { MetalSelector } from './MetalSelector';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Award,
  Gem,
  X
} from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  settings: ShowroomSettings | null;
  selectedMetal: MetalType;
  onSelectMetal: (metal: MetalType) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedPurity: string;
  onSelectPurity: (purity: string) => void;
  selectedAvailability: string;
  onSelectAvailability: (avail: string) => void;
  featuredOnly: boolean;
  onToggleFeatured: () => void;
  newArrivalsOnly: boolean;
  onToggleNewArrivals: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  onViewProductDetails: (product: Product) => void;
  onOpenZoom: (product: Product) => void;
  isLoading?: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  settings,
  selectedMetal,
  onSelectMetal,
  selectedCategory,
  onSelectCategory,
  selectedPurity,
  onSelectPurity,
  selectedAvailability,
  onSelectAvailability,
  featuredOnly,
  onToggleFeatured,
  newArrivalsOnly,
  onToggleNewArrivals,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onResetFilters,
  onViewProductDetails,
  onOpenZoom,
  isLoading = false,
}) => {
  const { language, t } = useLanguage();

  const goldCount = products.filter((p) => p.metal.toLowerCase() === 'gold').length;
  const silverCount = products.filter((p) => p.metal.toLowerCase() === 'silver').length;

  return (
    <section id="catalog-section" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 3 Metal Selector Tabs (All, 22K/24K Gold, 92.5 Sterling Silver) */}
      <MetalSelector
        selectedMetal={selectedMetal}
        onSelectMetal={onSelectMetal}
        goldCount={goldCount}
        silverCount={silverCount}
        totalCount={products.length}
      />

      {/* Horizontal Category Bar */}
      <div className="mb-6">
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          selectedMetal={selectedMetal}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs mb-8 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="catalog-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A869] focus:bg-white text-stone-900 placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Purity Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedPurity}
              onChange={(e) => onSelectPurity(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C5A869]"
            >
              <option value="all">{t('all_purities')}</option>
              <option value="22K BIS 916">22K BIS 916</option>
              <option value="24K Pure Gold (999)">24K Pure Gold (999)</option>
              <option value="92.5 Sterling Silver">92.5 Sterling Silver</option>
              <option value="99.9 Pure Silver">99.9 Pure Silver</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedAvailability}
              onChange={(e) => onSelectAvailability(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C5A869]"
            >
              <option value="all">{t('all_availabilities')}</option>
              <option value="In Stock">{t('availability_in_stock')}</option>
              <option value="Custom Order">{t('availability_custom')}</option>
              <option value="Out of Stock">{t('availability_out')}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C5A869]"
            >
              <option value="featured">{t('sort_featured')}</option>
              <option value="newest">{t('sort_newest')}</option>
              <option value="price_asc">{t('sort_price_low')}</option>
              <option value="price_desc">{t('sort_price_high')}</option>
              <option value="weight_asc">{t('sort_weight_low')}</option>
              <option value="weight_desc">{t('sort_weight_high')}</option>
              <option value="name_asc">{t('sort_name_az')}</option>
              <option value="name_desc">{t('sort_name_za')}</option>
            </select>
          </div>
        </div>

        {/* Bottom Tag Filter Toggles & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Featured Only Pill */}
            <button
              type="button"
              onClick={onToggleFeatured}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                featuredOnly
                  ? 'bg-[#C5A869] text-[#1A1A1A] font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('filter_featured_only')}</span>
            </button>

            {/* New Arrivals Only Pill */}
            <button
              type="button"
              onClick={onToggleNewArrivals}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                newArrivalsOnly
                  ? 'bg-rose-700 text-white font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t('filter_new_arrivals')}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-500 font-medium">
              {t('showing_items', { count: products.length })}
            </span>

            {(selectedCategory !== 'all' ||
              selectedPurity !== 'all' ||
              selectedAvailability !== 'all' ||
              featuredOnly ||
              newArrivalsOnly ||
              searchQuery) && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-stone-600 hover:text-stone-950 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('reset_filters')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {products.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif-luxury text-xl font-bold text-stone-800">
            {t('no_products_found')}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {t('no_products_hint')}
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-all cursor-pointer"
          >
            {t('reset_filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              settings={settings}
              onViewDetails={onViewProductDetails}
              onOpenZoom={onOpenZoom}
            />
          ))}
        </div>
      )}
    </section>
  );
};
