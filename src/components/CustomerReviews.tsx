import React, { useState } from 'react';
import { Review } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { submitReview } from '../services/api';
import { Star, CheckCircle, MessageSquarePlus, X, Send, AlertCircle, Quote } from 'lucide-react';

interface CustomerReviewsProps {
  reviews: Review[];
  onReviewAdded: () => void;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ reviews, onReviewAdded }) => {
  const { language, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) {
      setErrorMsg(language === 'te' ? 'దయచేసి మీ పేరు మరియు సమీక్షను రాయండి.' : 'Please enter your name and review text.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await submitReview({
        name: name.trim(),
        rating,
        review: reviewText.trim(),
        review_te: reviewText.trim(),
      });
      setSuccessMsg(t('review_success'));
      setName('');
      setReviewText('');
      setRating(5);
      onReviewAdded();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews-section" className="py-16 bg-[#FDFCFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and "Share Experience" CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[#8C6D23] font-bold text-xs uppercase tracking-wider">
              <Star className="w-4 h-4 fill-current text-[#C5A869]" />
              <span>Customer Trust & Testimonials</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              {t('reviews_title')}
            </h2>
            <p className="text-stone-600 text-sm">
              {t('reviews_subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 bg-[#1A1A1A] hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#C5A869]" />
            <span>{t('write_review')}</span>
          </button>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((rev) => {
            const displayText =
              language === 'te' && rev.review_te ? rev.review_te : rev.review;

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
              >
                <Quote className="w-8 h-8 text-stone-200 absolute top-4 right-4 -z-0 pointer-events-none" />

                <div className="space-y-3 z-10">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-stone-700 leading-relaxed italic">
                    "{displayText}"
                  </p>
                </div>

                {/* Author & Verification */}
                <div className="border-t border-stone-100 pt-3 flex items-center justify-between z-10">
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">
                      {rev.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {rev.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>{t('verified_buyer')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative my-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif-luxury text-2xl font-bold text-stone-950 mb-1">
              {t('write_review')}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {language === 'te'
                ? 'వధి జ్యువెలరీతో మీ అనుభవాన్ని సమీక్ష రూపంలో తెలియజేయండి.'
                : 'Share your genuine shopping experience at VADDI Jewellery.'}
            </p>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg mb-4 text-center">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('your_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('review_name_placeholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C5A869] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('rating_label')}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-600 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'te' ? 'మీ సమీక్ష' : 'Your Review'} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t('review_text_placeholder')}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C5A869] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#1A1A1A] hover:bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#C5A869]" />
                <span>{isSubmitting ? 'Publishing...' : t('submit_review')}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
