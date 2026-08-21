import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShowroomSettings } from '../types';
import { Coins, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

interface LiveRatesTickerProps {
  settings: ShowroomSettings | null;
  onRefreshRates?: () => Promise<void> | void;
  onOpenAdminRates?: () => void;
}

export const LiveRatesTicker: React.FC<LiveRatesTickerProps> = ({ settings, onRefreshRates, onOpenAdminRates }) => {
  const { language, t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const rate24K = Number(settings?.gold_rate_24k) || 7650;
  const rate22K = Number(settings?.gold_rate_22k) || 7020;
  const rate18K = Number(settings?.gold_rate_18k) || 5750;
  const rateSilver = Number(settings?.silver_rate) || 98;

  const todayStr = new Date().toLocaleDateString(language === 'te' ? 'te-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleManualRefresh = async () => {
    if (!onRefreshRates || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshRates();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <div className="bg-[#1A1A1A] text-[#FDFCFB] border-y border-[#333] py-3 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* Left: Ticker Title & Date & Dynamic Sync Notice */}
        <div className="flex items-center gap-2.5 shrink-0 justify-center md:justify-start">
          <div className="w-8 h-8 rounded-full bg-[#C5A869]/20 border border-[#C5A869]/40 flex items-center justify-center">
            <Coins className="w-4 h-4 text-[#C5A869]" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span className="font-serif-luxury font-bold text-sm text-[#C5A869] tracking-wider uppercase">
                {t('live_rates_title')}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-syncs catalog prices</span>
              </span>
              {onRefreshRates && (
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-1 text-stone-400 hover:text-[#C5A869] transition-colors rounded-full hover:bg-stone-800 cursor-pointer"
                  title="Refresh Today's Rates"
                  aria-label="Refresh Today's Rates"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C5A869]' : ''}`} />
                </button>
              )}
              {onOpenAdminRates && (
                <button
                  type="button"
                  onClick={onOpenAdminRates}
                  className="text-[10px] text-stone-400 hover:text-[#C5A869] transition-colors underline cursor-pointer"
                >
                  {language === 'te' ? 'రేట్లు సవరించు' : 'Adjust Rates'}
                </button>
              )}
            </div>
            <span className="text-[11px] text-stone-400">
              {todayStr} • {t('rates_disclaimer')}
            </span>
          </div>
        </div>

        {/* Right: The 4 Metal Rates Pill Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
          {/* 24K Gold */}
          <div
            onClick={onOpenAdminRates}
            className={`bg-stone-900/80 border border-stone-800 rounded-lg px-3 py-2 text-center md:text-left transition-colors ${
              onOpenAdminRates ? 'cursor-pointer hover:border-amber-500/50' : ''
            }`}
          >
            <span className="text-[10px] text-amber-300 font-semibold block uppercase tracking-wider">
              {t('rate_24k_gold')}
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-1 mt-0.5">
              <span className="text-sm font-extrabold text-amber-100">₹{rate24K.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-stone-400">/g</span>
            </div>
          </div>

          {/* 22K Gold (Hallmarked) */}
          <div
            onClick={onOpenAdminRates}
            className={`bg-[#2A2416] border border-[#C5A869]/50 rounded-lg px-3 py-2 text-center md:text-left relative shadow-xs transition-colors ${
              onOpenAdminRates ? 'cursor-pointer hover:border-[#C5A869]' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#F3E5AB] font-bold block uppercase tracking-wider">
                {t('rate_22k_gold')}
              </span>
              <span className="text-[8px] bg-[#C5A869] text-stone-950 font-extrabold px-1 rounded">
                BIS 916
              </span>
            </div>
            <div className="flex items-baseline justify-center md:justify-start gap-1 mt-0.5">
              <span className="text-sm font-extrabold text-[#FFF0BA]">₹{rate22K.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-amber-200/80">/g</span>
            </div>
          </div>

          {/* 18K Gold */}
          <div
            onClick={onOpenAdminRates}
            className={`bg-stone-900/80 border border-stone-800 rounded-lg px-3 py-2 text-center md:text-left transition-colors ${
              onOpenAdminRates ? 'cursor-pointer hover:border-stone-600' : ''
            }`}
          >
            <span className="text-[10px] text-stone-300 font-semibold block uppercase tracking-wider">
              {t('rate_18k_gold')}
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-1 mt-0.5">
              <span className="text-sm font-extrabold text-stone-100">₹{rate18K.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-stone-400">/g</span>
            </div>
          </div>

          {/* 92.5 Pure Silver */}
          <div
            onClick={onOpenAdminRates}
            className={`bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-center md:text-left transition-colors ${
              onOpenAdminRates ? 'cursor-pointer hover:border-slate-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-300 font-semibold block uppercase tracking-wider">
                {t('rate_silver')}
              </span>
              <span className="text-[8px] bg-slate-700 text-slate-200 font-bold px-1 rounded">
                92.5
              </span>
            </div>
            <div className="flex items-baseline justify-center md:justify-start gap-1 mt-0.5">
              <span className="text-sm font-extrabold text-slate-100">₹{rateSilver.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400">/g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
