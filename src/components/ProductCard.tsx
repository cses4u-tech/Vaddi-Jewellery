import React, { useState } from 'react';
import { Product, ShowroomSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { calculateProductPriceBreakdown } from '../utils/pricing';
import { Award, MessageCircle, Eye, Sparkles, ZoomIn, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  settings: ShowroomSettings | null;
  onViewDetails: (product: Product) => void;
  onOpenZoom: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onViewDetails,
  onOpenZoom,
}) => {
  const { language, t } = useLanguage();
  const [imgLoaded, setImgLoaded] = useState(false);

  const title = language === 'te' ? product.title_te || product.title : product.title;
  const category = language === 'te' ? product.category_te || product.category : product.category;

  const isGold = product.metal.toLowerCase() === 'gold';
  const whatsappNumber = (settings?.whatsapp || '919650052262').replace(/[^0-9]/g, '');

  // Calculate dynamic auto-price based on today's rates, weight, wastage %, and labour cost
  const breakdown = calculateProductPriceBreakdown(product, settings);

  const whatsappMessage =
    language === 'te'
      ? `నమస్కారం వధి జ్యువెలరీ, నేను ఈ నగ వివరాలు మరియు ధర తెలుసుకోవాలనుకుంటున్నాను:\n\n💎 నగ: ${title}\n🏷️ కోడ్: ${product.code}\n⚖️ తూకం: ${product.weight}g\n✨ స్వచ్ఛత: ${product.purity}\n💰 ప్రస్తుత ధర: ₹${breakdown.totalPrice.toLocaleString('en-IN')} (తరుగు: ${breakdown.wastagePercent}%, మజూరీ: ₹${breakdown.labourCost})\n\nదయచేసి లైవ్ కొటేషన్ మరియు లభ్యత తెలియజేయండి.`
      : `Hello VADDI Jewellery, I am interested in inquiring about this jewellery piece:\n\n💎 Item: ${title}\n🏷️ Code: ${product.code}\n⚖️ Weight: ${product.weight}g\n✨ Purity: ${product.purity}\n💰 Today's Auto Price: ₹${breakdown.totalPrice.toLocaleString('en-IN')} (VA: ${breakdown.wastagePercent}%, Labour: ₹${breakdown.labourCost})\n\nPlease confirm latest pricing and showroom availability.`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Availability badge styling
  let availBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let availText = t('availability_in_stock');
  if (product.availability === 'Custom Order') {
    availBg = 'bg-amber-50 text-amber-800 border-amber-300';
    availText = t('availability_custom');
  } else if (product.availability === 'Out of Stock') {
    availBg = 'bg-stone-100 text-stone-700 border-stone-300';
    availText = t('availability_out');
  }

  const showPrice = product.show_price !== 0;

  return (
    <div
      id={`product-card-${product.code}`}
      className="group bg-white rounded-xl border border-[#E5E1DA] hover:border-[#C5A869]/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Top Badges (Purity & Featured/New Arrival) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        {/* Left: Hallmark / Purity pill */}
        <div className="flex items-center gap-1 bg-[#1A1A1A]/90 backdrop-blur-xs text-[#FDFCFB] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs border border-stone-700">
          <Award className="w-3 h-3 text-[#C5A869]" />
          <span>{product.purity}</span>
        </div>

        {/* Right: Featured / New Arrival Tag */}
        <div className="flex items-center gap-1">
          {product.featured === 1 && (
            <span className="bg-[#C5A869] text-[#1A1A1A] font-extrabold text-[10px] px-2 py-0.5 rounded shadow-xs">
              {t('badge_featured')}
            </span>
          )}
          {product.new_arrival === 1 && product.featured !== 1 && (
            <span className="bg-rose-700 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow-xs">
              {t('badge_new')}
            </span>
          )}
        </div>
      </div>

      {/* Product Image Frame (STRICT object-fit: contain - NEVER CROPPED) */}
      <div
        onClick={() => onViewDetails(product)}
        className="relative w-full h-56 sm:h-64 bg-[#FBF9F5] p-4 flex items-center justify-center cursor-pointer overflow-hidden border-b border-stone-100"
      >
        <img
          src={product.image_path}
          alt={title}
          className={`jewellery-img-contain w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-90'
          }`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />

        {/* Zoom Overlay Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenZoom(product);
          }}
          className="absolute bottom-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-stone-800 rounded-full shadow-md transition-transform transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer"
          title={t('click_to_zoom')}
          aria-label={t('click_to_zoom')}
        >
          <ZoomIn className="w-4 h-4 text-[#8C6D23]" />
        </button>
      </div>

      {/* Card Content Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Code & Category Tag */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-mono font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
              {product.code}
            </span>
            <span className="text-[11px] font-medium text-stone-600 truncate max-w-[140px]">
              {category}
            </span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-serif-luxury text-base sm:text-lg font-bold text-stone-900 line-clamp-1 hover:text-[#8C6D23] transition-colors cursor-pointer"
            title={title}
          >
            {title}
          </h3>

          {/* Specs Bar: Weight & Availability */}
          <div className="flex items-center justify-between pt-1.5 text-xs">
            <div className="flex items-baseline gap-1">
              <span className="text-stone-500">{t('gross_weight')}:</span>
              <span className="font-bold text-stone-900 text-sm">
                {product.weight} {t('grams')}
              </span>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${availBg}`}>
              {availText}
            </span>
          </div>

          {/* Auto-Calculated Price Display with Wastage & Labour Breakdown */}
          <div className="pt-2.5 mt-2 border-t border-stone-100 space-y-1">
            {showPrice ? (
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-extrabold text-stone-950">
                      ₹{breakdown.totalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      (Live Rate)
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <Zap className="w-2.5 h-2.5 text-amber-600" />
                    <span>Auto-calc</span>
                  </div>
                </div>

                {/* Wastage & Labour breakdown pills */}
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-medium pt-0.5">
                  <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                    VA: <strong>{breakdown.wastagePercent}%</strong>
                  </span>
                  <span>•</span>
                  <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                    Labour: <strong>₹{breakdown.labourCost.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C6D23] bg-[#C5A869]/10 px-2 py-0.5 rounded inline-block">
                  {t('price_on_request')}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>BIS 916</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: View Details & WhatsApp Enquiry */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="truncate">{t('view_details')}</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-2xs transition-all cursor-pointer"
            title={t('enquire_whatsapp')}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="truncate">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
