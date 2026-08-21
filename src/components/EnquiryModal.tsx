import React, { useState } from 'react';
import { Product, ShowroomSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { submitEnquiry } from '../services/api';
import { X, Sparkles, Send, CheckCircle2, MessageCircle, Phone, AlertCircle } from 'lucide-react';

interface EnquiryModalProps {
  product?: Product | null;
  settings: ShowroomSettings | null;
  onClose: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  product,
  settings,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    product
      ? language === 'te'
        ? `నేను ${product.title_te || product.title} (${product.code}, ${product.weight}g) గురించి కొటేషన్ మరియు కస్టమ్ ఆర్డర్ వివరాలు తెలుసుకోవాలనుకుంటున్నాను.`
        : `I would like to inquire about pricing, custom weight options, or availability for ${product.title} (${product.code}, ${product.weight}g).`
      : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg(language === 'te' ? 'దయచేసి మీ పేరు మరియు ఫోన్ నంబర్ నమోదు చేయండి.' : 'Please provide your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await submitEnquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        product_id: product?.id,
        product_code: product?.code,
        product_title: product ? (language === 'te' ? product.title_te || product.title : product.title) : undefined,
        message: message.trim(),
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please call or WhatsApp us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = (settings?.whatsapp || '919650052262').replace(/[^0-9]/g, '');

  return (
    <div
      id="enquiry-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="enquiry-modal-card"
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
              {language === 'te' ? 'విచారణ విజయవంతంగా చేరింది!' : 'Enquiry Received!'}
            </h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto">
              {t('enquiry_success')}
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-all cursor-pointer"
              >
                {t('close_viewer')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-[#8C6D23] font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'te' ? 'వద్ధి షోరూమ్ కస్టమ్ ఆర్డర్' : 'VADDI Custom Goldsmithing'}</span>
              </div>
              <h3 className="font-serif-luxury text-2xl font-bold text-stone-950">
                {t('enquiry_title')}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {t('enquiry_subtitle')}
              </p>
            </div>

            {/* Product context chip if attached */}
            {product && (
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <img
                  src={product.image_path}
                  alt={product.title}
                  className="w-12 h-12 object-contain bg-white rounded-lg border border-stone-200 p-1"
                />
                <div className="text-xs truncate">
                  <span className="font-mono font-bold text-stone-900 block">{product.code}</span>
                  <span className="font-medium text-stone-800 truncate block">
                    {language === 'te' ? product.title_te || product.title : product.title}
                  </span>
                  <span className="text-stone-500 text-[11px]">{product.purity} • {product.weight}g</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('your_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'te' ? 'ఉదా: వెంకటేశ్వర్లు' : 'e.g. Ramesh Kumar'}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A869] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('your_phone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A869] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('your_email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A869] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('your_message')}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    language === 'te'
                      ? 'మీకు కావలసిన తూకం, సైజు లేదా ప్రత్యేక ఆర్డర్ వివరాలు...'
                      : 'Provide details about weight, size, or custom design specifications...'
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A869] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#1A1A1A] hover:bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#C5A869]" />
                    <span>{t('submit_enquiry')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
