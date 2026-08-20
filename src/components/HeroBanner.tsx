import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShowroomSettings, MetalType } from '../types';
import { Award, ShieldCheck, Sparkles, MapPin, ArrowRight, MessageCircle } from 'lucide-react';

interface HeroBannerProps {
  settings: ShowroomSettings | null;
  onExploreCatalog: () => void;
  onSelectMetal: (metal: MetalType) => void;
  onOpenEnquiryModal: () => void;
  onScrollToLocation: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  onExploreCatalog,
  onSelectMetal,
  onOpenEnquiryModal,
  onScrollToLocation,
}) => {
  const { language, t } = useLanguage();

  const title =
    language === 'te'
      ? settings?.hero_title_te || t('hero_title')
      : settings?.hero_title || t('hero_title');

  const subtitle =
    language === 'te'
      ? settings?.hero_subtitle_te || t('hero_subtitle')
      : settings?.hero_subtitle || t('hero_subtitle');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDFCFB] via-[#F8F6F0] to-[#FDFCFB] border-b border-[#E5E1DA] pt-8 pb-12 sm:py-14 lg:py-16">
      {/* Subtle luxury geometric background motif */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C5A869_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle, Trust Badges, and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Heritage Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 bg-[#C5A869]/15 border border-[#C5A869]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#8C6D23]">
              <Sparkles className="w-3.5 h-3.5 text-[#B38F4D]" />
              <span>
                {language === 'te'
                  ? 'ప్రొద్దుటూరు సుప్రసిద్ధ బంగారు & వెండి షోరూమ్'
                  : 'Prestigious Heritage Showroom • Proddatur'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] leading-[1.15] tracking-tight">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-[#555] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {subtitle}
            </p>

            {/* Trust Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200/80 shadow-2xs">
                <Award className="w-5 h-5 text-[#B38F4D] shrink-0" />
                <span className="text-xs font-bold text-stone-800 leading-tight">
                  {t('badge_bis_hallmark')}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200/80 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-slate-600 shrink-0" />
                <span className="text-xs font-bold text-stone-800 leading-tight">
                  {t('badge_pure_silver')}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200/80 shadow-2xs">
                <Sparkles className="w-5 h-5 text-[#B38F4D] shrink-0" />
                <span className="text-xs font-bold text-stone-800 leading-tight">
                  {t('badge_heritage')}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200/80 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
                <span className="text-xs font-bold text-stone-800 leading-tight">
                  {t('badge_transparent')}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                id="hero-explore-catalog-btn"
                type="button"
                onClick={onExploreCatalog}
                className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-6 py-3.5 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <span>{t('hero_cta_browse')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-custom-order-btn"
                type="button"
                onClick={onOpenEnquiryModal}
                className="flex items-center gap-2 bg-[#C5A869] hover:bg-[#B38F4D] text-[#1A1A1A] px-5 py-3.5 rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('hero_cta_custom')}</span>
              </button>

              <button
                id="hero-visit-showroom-btn"
                type="button"
                onClick={onScrollToLocation}
                className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 px-4 py-3.5 rounded-lg font-semibold text-sm border border-stone-300 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#B38F4D]" />
                <span>{t('hero_cta_visit')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Featured Showroom Hero Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Decorative luxury backdrop glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#C5A869]/20 via-[#B38F4D]/10 to-transparent rounded-2xl filter blur-xl opacity-70" />

              {/* Main Luxury Showcase Card */}
              <div className="relative bg-white rounded-2xl border border-[#E5E1DA] p-5 shadow-lg space-y-4">
                {/* Header in card */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      {language === 'te' ? 'ప్రత్యేక షోరూమ్ సేకరణ' : 'Signature Collection'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#8C6D23] bg-[#C5A869]/15 px-2 py-0.5 rounded">
                    22K BIS 916 & 92.5 Silver
                  </span>
                </div>

                {/* Split Dual Showcase (Gold & Silver side by side) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Gold Showcase Box */}
                  <div
                    onClick={() => onSelectMetal('Gold')}
                    className="group bg-[#FFFDF7] p-3 rounded-xl border border-amber-200/70 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer text-center"
                  >
                    <div className="w-full h-36 bg-amber-50/50 rounded-lg p-2 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                      <img
                        src="/images/jewellery/vd_g001_gold_lakshmi_haram.svg"
                        alt="22K Gold Lakshmi Kasu Haram"
                        className="w-full h-full object-contain drop-shadow-sm"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 block truncate">
                      {language === 'te' ? '22K లక్ష్మీ కాసుల హారం' : '22K Lakshmi Kasu Haram'}
                    </span>
                    <span className="text-[10px] text-amber-700/80 font-medium block">
                      {language === 'te' ? 'బంగారు హారాలు' : '22K Gold Collection'}
                    </span>
                  </div>

                  {/* Silver Showcase Box */}
                  <div
                    onClick={() => onSelectMetal('Silver')}
                    className="group bg-slate-50/80 p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer text-center"
                  >
                    <div className="w-full h-36 bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                      <img
                        src="/images/jewellery/vd_s001_silver_ganesha_idol.svg"
                        alt="92.5 Silver Ganesha Idol"
                        className="w-full h-full object-contain drop-shadow-sm"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 block truncate">
                      {language === 'te' ? '92.5 వెండి వినాయక విగ్రహం' : '92.5 Silver Ganesha Idol'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium block">
                      {language === 'te' ? 'దేవుడి విగ్రహాలు' : 'Sterling Silver Idols'}
                    </span>
                  </div>
                </div>

                {/* Bottom Showroom Guarantee Bar */}
                <div className="bg-stone-50 rounded-xl p-2.5 text-center text-xs text-stone-600 flex items-center justify-center gap-2">
                  <Award className="w-4 h-4 text-[#B38F4D]" />
                  <span>
                    {language === 'te'
                      ? 'ప్రతి నగకు ఖచ్చితమైన లేజర్ హాల్‌మార్కింగ్ సర్టిఫికేషన్'
                      : 'Every ornament laser-hallmarked with HUID guarantee'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
