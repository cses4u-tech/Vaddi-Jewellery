import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Award, ShieldCheck, Gem, Scale, Sparkles, HeartHandshake } from 'lucide-react';

interface WhyChooseVaddiProps {
  onExploreCatalog?: () => void;
}

export const WhyChooseVaddi: React.FC<WhyChooseVaddiProps> = ({ onExploreCatalog }) => {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: <Award className="w-6 h-6 text-[#C5A869]" />,
      titleKey: 'pillar1_title' as const,
      descKey: 'pillar1_desc' as const,
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-slate-700" />,
      titleKey: 'pillar2_title' as const,
      descKey: 'pillar2_desc' as const,
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C5A869]" />,
      titleKey: 'pillar3_title' as const,
      descKey: 'pillar3_desc' as const,
    },
    {
      icon: <Scale className="w-6 h-6 text-[#10B981]" />,
      titleKey: 'pillar4_title' as const,
      descKey: 'pillar4_desc' as const,
    },
    {
      icon: <Gem className="w-6 h-6 text-amber-700" />,
      titleKey: 'pillar5_title' as const,
      descKey: 'pillar5_desc' as const,
    },
  ];

  return (
    <section id="why-vaddi-section" className="py-16 bg-[#F8F6F0] border-y border-[#E5E1DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#C5A869]/20 text-[#8C6D23] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Trust & Legacy in Proddatur</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            {t('why_title')}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            {t('why_subtitle')}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md hover:border-[#C5A869]/60 transition-all text-center flex flex-col items-center justify-start space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center shadow-inner mb-1">
                {pillar.icon}
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900 leading-snug">
                {t(pillar.titleKey)}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {t(pillar.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
