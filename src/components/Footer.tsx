import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShowroomSettings } from '../types';
import {
  Sparkles,
  Award,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  ShieldCheck,
  Lock,
  Calculator,
  ChevronRight,
  Heart
} from 'lucide-react';

interface FooterProps {
  settings: ShowroomSettings | null;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
  onOpenVaddiTools: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onOpenAdmin,
  onOpenVaddiTools,
}) => {
  const { language, t } = useLanguage();

  const phone = settings?.phone || '+91 9650052262';
  const shopName = language === 'te' ? (settings?.shop_name_te || 'వద్ధి జ్యువెలరీ') : (settings?.shop_name || 'VADDI Jewellery');
  const shopCity = language === 'te' ? (settings?.city_state_pincode_te || 'ప్రొద్దుటూరు • ఆంధ్రప్రదేశ్') : (settings?.city_state_pincode || 'Proddatur • Andhra Pradesh');
  const shopFullAddress = language === 'te'
    ? `${settings?.address_te || 'వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట'}, ${settings?.city_state_pincode_te || 'ప్రొద్దుటూరు 516360'}`
    : `${settings?.address || 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta'}, ${settings?.city_state_pincode || 'Proddatur, AP 516360'}`;
  const shopHours = language === 'te' ? (settings?.opening_hours_te || 'ఉదయం 10:00 - రాత్రి 9:30 (అన్ని 7 రోజులు)') : (settings?.opening_hours || '10:00 AM - 9:30 PM (All 7 Days)');

  const whatsappUrl = `https://wa.me/${(settings?.whatsapp || '919650052262').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    language === 'te'
      ? `నమస్కారం ${shopName}, నేను మీ షోరూమ్ కలెక్షన్ గురించి సమాచారం తెలుసుకోవాలనుకుంటున్నాను.`
      : `Hello ${shopName}, I would like to inquire about your jewellery showroom collection.`
  )}`;

  return (
    <footer className="bg-[#141414] text-stone-300 border-t border-stone-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-stone-800/80">
          {/* Col 1: Brand & Heritage */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E2B755] to-[#9C782B] flex items-center justify-center text-stone-950 font-serif-luxury font-black text-xl shadow-xs">
                V
              </div>
              <div>
                <span className="font-serif-luxury font-bold text-lg text-[#FDFCFB] tracking-wide block">
                  {shopName}
                </span>
                <span className="text-[10px] text-[#C5A869] font-bold uppercase tracking-widest block">
                  {shopCity}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed font-normal">
              {language === 'te'
                ? (settings?.tagline_te ? `${settings.tagline_te}. 100% BIS హాల్మార్క్ బంగారం & 92.5 స్వచ్ఛమైన వెండి.` : 'ప్రొద్దుటూరులో తరతరాల నమ్మకంతో 100% BIS హాల్మార్క్ బంగారు ఆభరణాలు మరియు 92.5 స్వచ్ఛమైన వెండి వస్తువుల షోరూమ్.')
                : (settings?.tagline ? `${settings.tagline}. Authentic 100% BIS Hallmarked Gold & 92.5 Fine Silver.` : 'Prestigious heritage jewellery showroom in Proddatur, renowned for 100% BIS Hallmarked gold craftsmanship and 92.5 fine sterling silver articles.')}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#C5A869]" />
              <span>100% BIS Hallmarked & Tested</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-[#FDFCFB] tracking-wider uppercase">
              {language === 'te' ? 'త్వరిత లింకులు' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-[#C5A869] transition-colors flex items-center gap-1.5 cursor-pointer text-stone-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{t('nav_home')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('gold')}
                  className="hover:text-[#C5A869] transition-colors flex items-center gap-1.5 cursor-pointer text-stone-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{t('nav_gold')} (22K / 24K)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('silver')}
                  className="hover:text-[#C5A869] transition-colors flex items-center gap-1.5 cursor-pointer text-stone-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{t('nav_silver')} (92.5 Fine Articles)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('why-vaddi')}
                  className="hover:text-[#C5A869] transition-colors flex items-center gap-1.5 cursor-pointer text-stone-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{t('nav_about')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('reviews')}
                  className="hover:text-[#C5A869] transition-colors flex items-center gap-1.5 cursor-pointer text-stone-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{t('nav_reviews')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('location')}
                  className="hover:text-[#C5A869] transition-colors flex items-center gap-1.5 cursor-pointer text-stone-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{t('nav_location')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Showroom Timings & Direct Contact */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-[#FDFCFB] tracking-wider uppercase">
              {language === 'te' ? 'షోరూమ్ వివరాలు' : 'Showroom Visit'}
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A869] shrink-0 mt-0.5" />
                <span>
                  {shopFullAddress}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A869] shrink-0" />
                <span>{shopHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A869] shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white font-bold">
                  {phone}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'te' ? 'వాట్సాప్‌లో సంప్రదించండి' : 'Connect on WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* Col 4: Tools & Staff Login */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-[#FDFCFB] tracking-wider uppercase">
              {language === 'te' ? 'ఉపకరణాలు & అడ్మిన్' : 'Showroom Tools'}
            </h4>
            <p className="text-xs text-stone-400">
              {language === 'te'
                ? 'వడ్డీ లెక్కలు, బంగారు మూల్యాంకనం మరియు రోజువారీ నిర్వహణ'
                : 'Traditional rupee interest calculators, valuation tools & management portal.'}
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onOpenVaddiTools}
                className="w-full flex items-center justify-between px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg text-xs font-bold border border-stone-800 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>Vaddi Calculator & Ledger</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              </button>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="w-full flex items-center justify-between px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-300 rounded-lg text-xs font-bold border border-stone-800 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Showroom Admin Portal</span>
                </span>
                <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">
                  Login
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Accreditation */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% BIS Hallmarked Purity</span>
            <span>•</span>
            <span>Kadapa Gold Heritage</span>
            <span>•</span>
            <span className="text-amber-500/80 font-serif-luxury">శ్రీ లక్ష్మీ ప్రసన్నం</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
