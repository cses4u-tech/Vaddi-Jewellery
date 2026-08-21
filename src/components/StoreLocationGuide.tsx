import React from 'react';
import { ShowroomSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Navigation,
  MessageCircle,
  Building,
  ShieldCheck
} from 'lucide-react';

interface StoreLocationGuideProps {
  settings: ShowroomSettings | null;
}

export const StoreLocationGuide: React.FC<StoreLocationGuideProps> = ({ settings }) => {
  const { language, t } = useLanguage();

  const phone = settings?.phone || '+91 9650052262';
  const shopName = language === 'te' ? (settings?.shop_name_te || 'వద్ధి జ్యువెలరీ') : (settings?.shop_name || 'VADDI Jewellery');
  const mapsUrl =
    settings?.google_maps_url || 'https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9';
  const whatsappUrl = `https://wa.me/${(settings?.whatsapp || '919650052262').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    language === 'te'
      ? `నమస్కారం ${shopName}, నేను మీ షోరూమ్‌కు రావడానికి రూట్ వివరాలు తెలుసుకోవాలనుకుంటున్నాను.`
      : `Hello ${shopName}, I am planning to visit your showroom and would like directions.`
  )}`;

  return (
    <section id="location-section" className="py-16 bg-[#F8F6F0] border-t border-[#E5E1DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[#8C6D23] font-bold text-xs uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Showroom Location & Contact</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            {t('location_title')}
          </h2>
          <p className="text-stone-600 text-sm">
            {t('location_subtitle')}
          </p>
        </div>

        {/* Showroom Information Card with Map Card & Action Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-md">
          {/* Left Column: Address, Phone, Timings */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold text-[#C5A869] uppercase tracking-widest block mb-1">
                Heritage Showroom
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">
                {shopName}
              </h3>
            </div>

            {/* Address Block */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 text-sm block">
                  {t('showroom_address_title')}
                </span>
                <p className="font-medium text-stone-800">
                  {language === 'te'
                    ? (settings?.address_te || 'వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట')
                    : (settings?.address || 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta')}
                </p>
                <p className="font-bold text-stone-900">
                  {language === 'te'
                    ? (settings?.city_state_pincode_te || 'ప్రొద్దుటూరు, వైఎస్ఆర్ కడప జిల్లా, ఆంధ్రప్రదేశ్ 516360, భారతదేశం')
                    : (settings?.city_state_pincode || 'Proddatur, Andhra Pradesh 516360, India')}
                </p>
              </div>
            </div>

            {/* Timings & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Timings */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs text-stone-700 space-y-0.5">
                  <span className="font-bold text-stone-900 block">{t('timings_title')}</span>
                  <p className="text-stone-600 leading-snug">
                    {language === 'te'
                      ? (settings?.opening_hours_te || 'సోమవారం - ఆదివారం: ఉదయం 10:00 – రాత్రి 9:30 (7 రోజులు)')
                      : (settings?.opening_hours || 'Monday - Sunday: 10:00 AM – 9:30 PM (All 7 Days Open)')}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-xs text-stone-700 space-y-0.5">
                  <span className="font-bold text-stone-900 block">{t('contact_phone_title')}</span>
                  <a
                    href={`tel:${phone}`}
                    className="font-bold text-emerald-800 hover:underline block text-sm"
                  >
                    {phone}
                  </a>
                  <span className="text-[10px] text-stone-500">Call for live gold rates & queries</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Google Maps & WhatsApp */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                id="location-google-maps-btn"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-stone-800 text-white px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-[#C5A869]" />
                <span>{t('get_directions')}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 text-stone-400" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('whatsapp_us')}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Map Card with Quick Landmark Highlights */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white space-y-5 border border-stone-800 shadow-xl relative overflow-hidden">
              {/* Background watermark */}
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-[#C5A869]/10 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-xs font-bold text-[#C5A869] uppercase tracking-wider">
                  Proddatur Landmark Guide
                </span>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                  Sarvakatta
                </span>
              </div>

              <div className="space-y-3 text-xs text-stone-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#C5A869] mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Heart of Gold City:</span>
                    <span className="text-stone-400">
                      Located in famous jewellery lane Sarvakatta, Sundaracharyula Street.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#C5A869] mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Convenient Parking:</span>
                    <span className="text-stone-400">
                      Dedicated vehicle parking available at Vaddi Complex for showroom visitors.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Live Digital Scales:</span>
                    <span className="text-stone-400">
                      State-of-the-art gold testing and certified weighing scales at front counter.
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Open Map CTA Box */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-stone-800 hover:bg-stone-700 text-[#FDFCFB] p-3 rounded-xl border border-stone-700 transition-colors cursor-pointer text-xs font-semibold"
              >
                📍 Open Google Maps: VADDI Complex, Proddatur ➔
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
