import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShowroomSettings, MetalType } from '../types';
import {
  Phone,
  MapPin,
  Clock,
  Search,
  Lock,
  Menu,
  X,
  Sparkles,
  Calculator,
  Compass,
  MessageCircle,
  Gem,
  Award,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  settings: ShowroomSettings | null;
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
  onOpenVaddiTools: () => void;
  onOpenSearch: () => void;
  selectedMetal: MetalType;
  onSelectMetal: (metal: MetalType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeSection,
  onNavigate,
  onOpenAdmin,
  onOpenVaddiTools,
  onOpenSearch,
  selectedMetal,
  onSelectMetal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const phone = settings?.phone || '+91 9650052262';
  const whatsappUrl = `https://wa.me/${(settings?.whatsapp || '919650052262').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    language === 'te'
      ? 'నమస్కారం వధి జ్యువెలరీ, నేను మీ షోరూమ్ కలెక్షన్ గురించి సమాచారం తెలుసుకోవాలనుకుంటున్నాను.'
      : 'Hello VADDI Jewellery, I would like to inquire about your jewellery showroom collection.'
  )}`;

  const navItems = [
    { id: 'catalog', labelKey: 'nav_home' as const },
    { id: 'gold', labelKey: 'nav_gold' as const, metal: 'Gold' as MetalType },
    { id: 'silver', labelKey: 'nav_silver' as const, metal: 'Silver' as MetalType },
    { id: 'why-vaddi', labelKey: 'nav_about' as const },
    { id: 'reviews', labelKey: 'nav_reviews' as const },
    { id: 'location', labelKey: 'nav_location' as const },
  ];

  const handleNavClick = (id: string, metal?: MetalType) => {
    if (metal) {
      onSelectMetal(metal);
      onNavigate('catalog');
    } else {
      onNavigate(id);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-md border-b border-[#E5E1DA] shadow-xs">
      {/* Top Heritage Utility Bar */}
      <div className="bg-[#1A1A1A] text-[#E5E1DA] text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left info: Address & Timings */}
          <div className="flex items-center gap-4 sm:gap-6 truncate">
            <div className="flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-[#C5A869] shrink-0" />
              <span className="truncate hidden sm:inline">
                {language === 'te'
                  ? 'వి.ఎన్.ఆర్ కాంప్లెక్స్, సర్వకట్ట, ప్రొద్దుటూరు'
                  : 'VNR Complex, Sarvakatta, Proddatur'}
              </span>
              <span className="sm:hidden">{language === 'te' ? 'ప్రొద్దుటూరు' : 'Proddatur, AP'}</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-stone-400">
              <Clock className="w-3.5 h-3.5 text-[#C5A869] shrink-0" />
              <span>{t('opening_hours_short')}</span>
            </div>
          </div>

          {/* Right info: BIS Trust & Language Switcher & Call */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-1 text-[#C5A869] font-medium text-[11px] tracking-wide uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>100% BIS Hallmarked</span>
            </div>

            {/* Bilingual Language Switcher */}
            <div
              id="language-switcher-header"
              className="flex items-center bg-stone-800/90 rounded-md p-0.5 border border-stone-700 text-[11px] font-semibold"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#C5A869] text-[#1A1A1A] font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <span className="text-stone-600 px-0.5">|</span>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2 py-0.5 rounded transition-all font-telugu cursor-pointer ${
                  language === 'te'
                    ? 'bg-[#C5A869] text-[#1A1A1A] font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="తెలుగు భాషకు మారండి"
              >
                తెలుగు
              </button>
            </div>

            {/* Quick Call Button */}
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 text-[#FDFCFB] hover:text-[#C5A869] transition-colors font-medium text-xs bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700"
            >
              <Phone className="w-3 h-3 text-[#C5A869]" />
              <span className="hidden sm:inline">{phone}</span>
              <span className="sm:hidden">{t('call_showroom')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Luxury Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Emblem */}
          <div
            onClick={() => handleNavClick('catalog')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {/* Heritage Emblem */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border-2 border-[#C5A869] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-9 h-9 rounded-full border border-[#C5A869]/40 flex items-center justify-center">
                <span className="font-serif-luxury text-[#C5A869] font-bold text-xl tracking-tighter">V</span>
              </div>
            </div>

            {/* Brand Typography */}
            <div className="flex flex-col">
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wider text-[#1A1A1A] uppercase leading-none">
                {language === 'te' ? 'వడ్డీ జ్యువెలరీ' : 'VADDI'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#9A9483] uppercase mt-0.5">
                {language === 'te' ? 'తరతరాల నమ్మకమైన షోరూమ్ • ప్రొద్దుటూరు' : 'Jewellery • Proddatur'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 2xl:gap-2">
            {navItems.map((item) => {
              const isSelected =
                activeSection === item.id ||
                (item.metal && activeSection === 'catalog' && selectedMetal === item.metal);
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id, item.metal)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'text-[#1A1A1A] font-bold bg-[#C5A869]/15 border-b-2 border-[#C5A869]'
                      : 'text-[#555] hover:text-[#1A1A1A] hover:bg-stone-100/60'
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}

            {/* Vaddi Tools trigger button */}
            <button
              id="nav-vaddi-tools-btn"
              onClick={onOpenVaddiTools}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100/80 rounded-lg border border-amber-200/80 transition-all ml-1 cursor-pointer"
              title="Vaddi Interest Calculator & Pawn Ledger"
            >
              <Calculator className="w-4 h-4 text-amber-700" />
              <span>{t('nav_vaddi_tools')}</span>
            </button>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              id="header-search-btn"
              type="button"
              onClick={onOpenSearch}
              className="p-2.5 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="Search Jewellery"
              title={t('search_placeholder')}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Direct WhatsApp CTA Button */}
            <a
              id="header-whatsapp-cta"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-3.5 py-2 rounded-lg font-medium text-xs shadow-xs transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{t('whatsapp_us')}</span>
            </a>

            {/* Admin Portal Link */}
            <button
              id="header-admin-portal-btn"
              type="button"
              onClick={onOpenAdmin}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Showroom Admin"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden md:inline">{t('nav_admin')}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#FDFCFB] border-b border-[#E5E1DA] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          {/* Language Switcher in Mobile Drawer */}
          <div className="flex items-center justify-between bg-stone-100 p-2.5 rounded-lg border border-stone-200">
            <span className="text-xs font-semibold text-stone-700">Language / భాష:</span>
            <div className="flex gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded ${
                  language === 'en' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-stone-700 border border-stone-300'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-3 py-1 rounded font-telugu ${
                  language === 'te' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-stone-700 border border-stone-300'
                }`}
              >
                తెలుగు
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onSelectMetal('All');
                handleNavClick('catalog');
              }}
              className={`p-2.5 rounded-lg text-left text-sm font-semibold flex items-center justify-between ${
                selectedMetal === 'All' && activeSection === 'catalog'
                  ? 'bg-[#C5A869]/20 text-[#1A1A1A] border border-[#C5A869]'
                  : 'bg-stone-50 text-stone-800'
              }`}
            >
              <span>{t('metal_all')}</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onSelectMetal('Gold');
                handleNavClick('catalog');
              }}
              className={`p-2.5 rounded-lg text-left text-sm font-semibold flex items-center justify-between ${
                selectedMetal === 'Gold' && activeSection === 'catalog'
                  ? 'bg-amber-100 text-amber-950 border border-amber-400'
                  : 'bg-amber-50/70 text-amber-900'
              }`}
            >
              <span>{t('nav_gold')}</span>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={() => {
                onSelectMetal('Silver');
                handleNavClick('catalog');
              }}
              className={`p-2.5 rounded-lg text-left text-sm font-semibold flex items-center justify-between ${
                selectedMetal === 'Silver' && activeSection === 'catalog'
                  ? 'bg-slate-200 text-slate-900 border border-slate-400'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <span>{t('nav_silver')}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenVaddiTools();
              }}
              className="p-2.5 rounded-lg text-left text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>{t('nav_vaddi_tools')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="border-t border-stone-200 pt-2 space-y-1">
            {navItems.slice(3).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 flex items-center justify-between"
              >
                <span>{t(item.labelKey)}</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href={`tel:${phone}`}
              className="w-full py-2.5 bg-[#1A1A1A] text-white rounded-lg text-center font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#C5A869]" />
              <span>{t('call_showroom')}: {phone}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#10B981] text-white rounded-lg text-center font-semibold text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{t('whatsapp_us')}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
