import React, { useState } from 'react';
import { Product, ShowroomSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { calculateProductPriceBreakdown } from '../utils/pricing';
import {
  X,
  Award,
  MessageCircle,
  Phone,
  ZoomIn,
  ShieldCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
  Calendar,
  Zap,
  Calculator,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  settings: ShowroomSettings | null;
  onClose: () => void;
  onOpenZoom: (product: Product, index: number) => void;
  onOpenEnquiryModal: (product: Product) => void;
  onScrollToLocation: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
  onOpenZoom,
  onOpenEnquiryModal,
  onScrollToLocation,
}) => {
  const { language, t } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const images =
    product.image_paths && product.image_paths.length > 0
      ? product.image_paths
      : [product.image_path];

  const currentImage = images[activeImageIndex] || product.image_path;

  const title = language === 'te' ? product.title_te || product.title : product.title;
  const category = language === 'te' ? product.category_te || product.category : product.category;
  const description =
    language === 'te'
      ? product.description_te || product.description
      : product.description;

  const phone = settings?.phone || '+91 9650052262';
  const whatsappNumber = (settings?.whatsapp || '919650052262').replace(/[^0-9]/g, '');

  // Calculate dynamic auto-calculated price breakdown
  const shopName = language === 'te' ? (settings?.shop_name_te || 'వద్ధి జ్యువెలరీ') : (settings?.shop_name || 'VADDI Jewellery');
  const shopAddressShort = language === 'te' ? (settings?.city_state_pincode_te || 'ప్రొద్దుటూరు') : (settings?.city_state_pincode?.split(',')[0] || 'Proddatur');

  const breakdown = calculateProductPriceBreakdown(product, settings);

  const whatsappMessage =
    language === 'te'
      ? `నమస్కారం ${shopName}, నేను ఈ ఆభరణం గురించి పూర్తి వివరాలు మరియు ప్రస్తుత లైవ్ రేటు ప్రకారం కొటేషన్ కోరుతున్నాను:\n\n💎 ఆభరణం: ${title}\n🏷️ కోడ్: ${product.code}\n⚖️ తూకం: ${product.weight} గ్రాములు\n✨ స్వచ్ఛత: ${product.purity}\n💰 ప్రస్తుత ధర: ₹${breakdown.totalPrice.toLocaleString('en-IN')} (తరుగు: ${breakdown.wastagePercent}%, మజూరీ: ₹${breakdown.labourCost.toLocaleString('en-IN')})\n📂 కేటగిరీ: ${category}\n\nదయచేసి త్వరగా సమాధానం ఇవ్వగలరు.`
      : `Hello ${shopName}, I would like to enquire about this jewellery piece from your showroom catalog:\n\n💎 Product: ${title}\n🏷️ Code: ${product.code}\n⚖️ Weight: ${product.weight}g\n✨ Purity: ${product.purity}\n💰 Today's Auto Price: ₹${breakdown.totalPrice.toLocaleString('en-IN')} (VA: ${breakdown.wastagePercent}%, Labour: ₹${breakdown.labourCost.toLocaleString('en-IN')})\n📂 Category: ${category}\n\nPlease let me know the showroom availability and purchase details.`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const showPrice = product.show_price !== 0;

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-card"
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 relative my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          {/* Left Column: Image Viewer Gallery */}
          <div className="md:col-span-6 flex flex-col space-y-4">
            {/* Main Image Frame (Strictly object-fit: contain - never cropped) */}
            <div
              onClick={() => onOpenZoom(product, activeImageIndex)}
              className="relative w-full h-80 sm:h-96 bg-[#FBF9F5] rounded-xl border border-stone-200 p-6 flex items-center justify-center cursor-zoom-in overflow-hidden group shadow-inner"
            >
              {/* Hallmark Watermark Badge */}
              <div className="absolute top-3 left-3 bg-[#1A1A1A]/90 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5 border border-stone-700">
                <Award className="w-3.5 h-3.5 text-[#C5A869]" />
                <span>{product.purity}</span>
              </div>

              <img
                src={currentImage}
                alt={title}
                className="jewellery-img-contain w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />

              {/* Click to Zoom Pill */}
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="inline-flex items-center gap-1.5 bg-white/95 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-stone-200 group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                  <ZoomIn className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{t('click_to_zoom')}</span>
                </span>
              </div>
            </div>

            {/* Thumbnail Selectors (if multiple images) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg border-2 p-1 bg-[#FBF9F5] overflow-hidden transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#C5A869] ring-2 ring-[#C5A869]/30'
                        : 'border-stone-200 hover:border-stone-400 opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Banner in modal */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>{language === 'te' ? 'వద్ధి జ్యువెలరీ స్వచ్ఛత గ్యారెంటీ' : 'VADDI Showroom Authenticity'}</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {language === 'te'
                  ? 'ప్రతి ఆభరణం ప్రభుత్వ నిబంధనల ప్రకారం 100% లేజర్ హాల్‌మార్కింగ్ మరియు ఖచ్చితమైన డిజిటల్ తూకంతో అందించబడుతుంది.'
                  : 'Every item is laser hallmarked with individual HUID authentication and certified for 100% purity.'}
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Specifications and Price Breakdown */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Product Code & Tags */}
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-stone-900 text-white px-2.5 py-1 rounded">
                  {product.code}
                </span>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                  {category}
                </span>
                {product.featured === 1 && (
                  <span className="text-xs font-bold text-[#8C6D23] bg-[#C5A869]/20 px-2.5 py-1 rounded">
                    {t('badge_featured')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-950 leading-tight">
                {title}
              </h2>

              {/* TRANSPARENT PRICING BREAKDOWN BOX */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                {showPrice ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between border-b border-stone-200 pb-2.5">
                      <div>
                        <span className="text-[11px] text-stone-500 block font-semibold">
                          {language === 'te' ? 'నేటి లైవ్ రేటు ప్రకారం సుమారు ధర' : "Today's Live Showroom Price"}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-extrabold text-stone-950">
                            ₹{breakdown.totalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded-full border border-amber-300">
                        <Zap className="w-3.5 h-3.5 text-amber-700" />
                        <span>Live Auto-Sync</span>
                      </span>
                    </div>

                    {/* Breakdown details */}
                    <div className="space-y-1.5 text-xs text-stone-700 bg-white p-3 rounded-lg border border-stone-200">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">
                          Metal Value ({breakdown.weightGrams}g × ₹{breakdown.ratePerGram.toLocaleString('en-IN')}/g):
                        </span>
                        <span className="font-bold text-stone-900">
                          ₹{breakdown.metalBasePrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">
                          Wastage Charges (తరుగు / VA {breakdown.wastagePercent}%):
                        </span>
                        <span className="font-bold text-amber-900">
                          +₹{breakdown.wastageAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">
                          Labour / Making Cost (మజూరీ ఖర్చులు):
                        </span>
                        <span className="font-bold text-stone-900">
                          +₹{breakdown.labourCost.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="border-t border-stone-200 pt-1.5 flex items-center justify-between font-extrabold text-stone-950 text-sm">
                        <span>Total Showroom Estimation:</span>
                        <span className="text-[#8C6D23]">
                          ₹{breakdown.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-stone-500 leading-tight">
                      * {language === 'te' ? 'ధర నేటి మార్కెట్ రేట్ ఆధారంగా ఆటోమేటిక్ గా లెక్కించబడింది. GST వర్తించును.' : 'Price auto-calculated based on daily Proddatur bullion rate, wastage & labour charges. GST as applicable.'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-[#8C6D23] bg-[#C5A869]/15 px-3 py-1 rounded inline-block">
                      {t('price_on_request')}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1.5 leading-tight">{t('price_note')}</p>
                  </div>
                )}
              </div>

              {/* Specifications Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-stone-100 px-3.5 py-2 font-bold text-stone-800 border-b border-stone-200 flex items-center justify-between">
                  <span>{t('specifications')}</span>
                  <span className="text-[10px] text-stone-500 font-normal">Official Showroom Specs</span>
                </div>
                <div className="divide-y divide-stone-100">
                  <div className="grid grid-cols-2 px-3.5 py-2">
                    <span className="text-stone-500">{t('metal_type')}</span>
                    <span className="font-semibold text-stone-900">{product.metal}</span>
                  </div>
                  <div className="grid grid-cols-2 px-3.5 py-2">
                    <span className="text-stone-500">{t('product_purity')}</span>
                    <span className="font-semibold text-stone-900">{product.purity}</span>
                  </div>
                  <div className="grid grid-cols-2 px-3.5 py-2">
                    <span className="text-stone-500">{t('gross_weight')}</span>
                    <span className="font-bold text-stone-950 text-sm">
                      {product.weight} {t('grams')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 px-3.5 py-2">
                    <span className="text-stone-500">Wastage (VA %)</span>
                    <span className="font-semibold text-amber-900">{breakdown.wastagePercent}%</span>
                  </div>
                  <div className="grid grid-cols-2 px-3.5 py-2">
                    <span className="text-stone-500">Labour Cost</span>
                    <span className="font-semibold text-stone-900">₹{breakdown.labourCost.toLocaleString('en-IN')}</span>
                  </div>
                  {product.size && (
                    <div className="grid grid-cols-2 px-3.5 py-2">
                      <span className="text-stone-500">{t('dimensions_size')}</span>
                      <span className="font-semibold text-stone-900">{product.size}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 px-3.5 py-2">
                    <span className="text-stone-500">{t('filter_availability')}</span>
                    <span className="font-semibold text-emerald-800">{product.availability}</span>
                  </div>
                  <div className="grid grid-cols-2 px-3.5 py-2">
                    <span className="text-stone-500">{t('certification')}</span>
                    <span className="font-semibold text-stone-900 flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('bis_verified')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {language === 'te' ? 'విశేషాలు' : 'Description'}
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
                    {description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons Container */}
            <div className="space-y-2.5 pt-2">
              <a
                id="modal-whatsapp-enquire-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('enquire_whatsapp')}</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="modal-custom-order-btn"
                  onClick={() => {
                    onClose();
                    onOpenEnquiryModal(product);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#C5A869] hover:bg-[#B38F4D] text-[#1A1A1A] py-2.5 px-3 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="truncate">{t('order_custom_item')}</span>
                </button>

                <a
                  href={`tel:${phone}`}
                  className="w-full flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-700" />
                  <span className="truncate">{t('call_to_enquire')}</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScrollToLocation();
                }}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-900 underline transition-colors cursor-pointer py-1"
              >
                {t('book_visit')} • {shopAddressShort}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
