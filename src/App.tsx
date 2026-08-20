import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from './context/LanguageContext';
import {
  Product,
  Category,
  Review,
  ShowroomSettings,
  MetalType,
} from './types';
import {
  fetchSettings,
  fetchCategories,
  fetchProducts,
  fetchReviews,
} from './services/api';

// Showroom Components
import { Header } from './components/Header';
import { LiveRatesTicker } from './components/LiveRatesTicker';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { WhyChooseVaddi } from './components/WhyChooseVaddi';
import { CustomerReviews } from './components/CustomerReviews';
import { StoreLocationGuide } from './components/StoreLocationGuide';
import { Footer } from './components/Footer';

// Modals
import { ProductDetailModal } from './components/ProductDetailModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { EnquiryModal } from './components/EnquiryModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { VaddiCalculatorModal } from './components/VaddiCalculatorModal';

export function App() {
  const { language, t } = useLanguage();

  // Showroom Global State
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // Filters & Search State
  const [activeSection, setActiveSection] = useState<string>('catalog');
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPurity, setSelectedPurity] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Modals State
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [zoomProduct, setZoomProduct] = useState<Product | null>(null);
  const [zoomIndex, setZoomIndex] = useState<number>(0);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [isVaddiToolsOpen, setIsVaddiToolsOpen] = useState<boolean>(false);

  // Refs for smooth section scrolling
  const catalogRef = useRef<HTMLDivElement>(null);
  const whyVaddiRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Fetch initial showroom settings, categories, products, and reviews
  const loadShowroomData = useCallback(async () => {
    try {
      const [settingsData, categoriesData, reviewsData] = await Promise.all([
        fetchSettings().catch(() => null),
        fetchCategories().catch(() => []),
        fetchReviews().catch(() => []),
      ]);
      if (settingsData) setSettings(settingsData);
      setCategories(categoriesData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error loading showroom data:', err);
    }
  }, []);

  const handleSettingsUpdated = useCallback(async (newSettings: ShowroomSettings) => {
    setSettings(newSettings);
    try {
      const fresh = await fetchSettings();
      if (fresh) setSettings(fresh);
    } catch (err) {
      console.warn('Could not re-fetch settings, keeping updated state:', err);
    }
  }, []);

  const loadCatalogProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const prods = await fetchProducts({
        metal: selectedMetal === 'All' ? undefined : selectedMetal.toLowerCase(),
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        purity: selectedPurity === 'all' ? undefined : selectedPurity,
        availability: selectedAvailability === 'all' ? undefined : selectedAvailability,
        featured: featuredOnly,
        new_arrival: newArrivalsOnly,
        search: searchQuery.trim() || undefined,
        sort: sortBy,
      });
      setProducts(prods);
    } catch (err) {
      console.error('Error loading catalog products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [
    selectedMetal,
    selectedCategory,
    selectedPurity,
    selectedAvailability,
    featuredOnly,
    newArrivalsOnly,
    searchQuery,
    sortBy,
  ]);

  useEffect(() => {
    loadShowroomData();
    // Auto-refresh settings every 30s to keep live rates updated
    const interval = setInterval(() => {
      fetchSettings().then((s) => {
        if (s) setSettings(s);
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [loadShowroomData]);

  useEffect(() => {
    loadCatalogProducts();
  }, [loadCatalogProducts]);

  // Reset filters handler
  const handleResetFilters = () => {
    setSelectedMetal('All');
    setSelectedCategory('all');
    setSelectedPurity('all');
    setSelectedAvailability('all');
    setFeaturedOnly(false);
    setNewArrivalsOnly(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  // Navigation router
  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === 'gold') {
      setSelectedMetal('Gold');
      setSelectedCategory('all');
      catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'silver') {
      setSelectedMetal('Silver');
      setSelectedCategory('all');
      catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'catalog') {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'why-vaddi') {
      whyVaddiRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'reviews') {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'location') {
      locationRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectMetal = (metal: MetalType) => {
    setSelectedMetal(metal);
    setSelectedCategory('all');
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#C5A869]/30 selection:text-stone-900">
      {/* 1. Header with Language Switcher, Contacts & Navigation */}
      <Header
        settings={settings}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        onOpenVaddiTools={() => setIsVaddiToolsOpen(true)}
        onOpenSearch={() => {
          catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        selectedMetal={selectedMetal}
        onSelectMetal={handleSelectMetal}
      />

      {/* 2. Live Rates Ticker (Today's Gold & Silver per gram) */}
      <LiveRatesTicker
        settings={settings}
        onRefreshRates={loadShowroomData}
      />

      {/* 3. Hero Banner (Heritage Proddatur Showroom) */}
      <HeroBanner
        settings={settings}
        onExploreCatalog={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onSelectMetal={handleSelectMetal}
        onOpenEnquiryModal={() => {
          setEnquiryProduct(null);
          setIsEnquiryModalOpen(true);
        }}
        onScrollToLocation={() => locationRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* 4. Product Catalog Section */}
      <div ref={catalogRef}>
        <ProductCatalog
          products={products}
          categories={categories}
          settings={settings}
          selectedMetal={selectedMetal}
          onSelectMetal={setSelectedMetal}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPurity={selectedPurity}
          onSelectPurity={setSelectedPurity}
          selectedAvailability={selectedAvailability}
          onSelectAvailability={setSelectedAvailability}
          featuredOnly={featuredOnly}
          onToggleFeatured={() => setFeaturedOnly((prev) => !prev)}
          newArrivalsOnly={newArrivalsOnly}
          onToggleNewArrivals={() => setNewArrivalsOnly((prev) => !prev)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
          onViewProductDetails={(prod: Product) => setDetailProduct(prod)}
          onOpenZoom={(prod: Product) => {
            setZoomProduct(prod);
            setZoomIndex(0);
          }}
          isLoading={isLoadingProducts}
        />
      </div>

      {/* 5. Why Choose VADDI Section */}
      <div ref={whyVaddiRef}>
        <WhyChooseVaddi onExploreCatalog={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>

      {/* 6. Customer Reviews Section */}
      <div ref={reviewsRef}>
        <CustomerReviews
          reviews={reviews}
          onReviewAdded={async () => {
            const updated = await fetchReviews().catch(() => []);
            setReviews(updated);
          }}
        />
      </div>

      {/* 7. Store Location Guide & Map */}
      <div ref={locationRef}>
        <StoreLocationGuide settings={settings} />
      </div>

      {/* 8. Showroom Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        onOpenVaddiTools={() => setIsVaddiToolsOpen(true)}
      />

      {/* MODAL 1: Product Detail View */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          settings={settings}
          onClose={() => setDetailProduct(null)}
          onOpenZoom={(prod: Product, index: number) => {
            setZoomProduct(prod);
            setZoomIndex(index);
          }}
          onOpenEnquiryModal={(prod: Product) => {
            setEnquiryProduct(prod);
            setIsEnquiryModalOpen(true);
          }}
          onScrollToLocation={() => {
            setDetailProduct(null);
            locationRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* MODAL 2: High Resolution Zoom Image Viewer */}
      {zoomProduct && (
        <ImageViewerModal
          product={zoomProduct}
          initialIndex={zoomIndex}
          onClose={() => setZoomProduct(null)}
        />
      )}

      {/* MODAL 3: Custom Enquiry & Order Modal */}
      {isEnquiryModalOpen && (
        <EnquiryModal
          product={enquiryProduct}
          settings={settings}
          onClose={() => {
            setIsEnquiryModalOpen(false);
            setEnquiryProduct(null);
          }}
        />
      )}

      {/* MODAL 4: Admin Portal (Password: vaddi123) */}
      {isAdminPortalOpen && (
        <AdminPortalModal
          isOpen={isAdminPortalOpen}
          onClose={() => setIsAdminPortalOpen(false)}
          settings={settings}
          categories={categories}
          onSettingsUpdated={handleSettingsUpdated}
          onProductsUpdated={() => {
            loadShowroomData();
            loadCatalogProducts();
          }}
          onCategoriesUpdated={() => {
            loadShowroomData();
            loadCatalogProducts();
          }}
        />
      )}

      {/* MODAL 5: Traditional Vaddi Calculator & Gold Valuation */}
      {isVaddiToolsOpen && (
        <VaddiCalculatorModal
          isOpen={isVaddiToolsOpen}
          onClose={() => setIsVaddiToolsOpen(false)}
          settings={settings}
        />
      )}
    </div>
  );
}
