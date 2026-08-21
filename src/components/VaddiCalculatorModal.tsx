import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShowroomSettings } from '../types';
import {
  Calculator,
  Gem,
  BookOpen,
  X,
  Sparkles,
  Calendar,
  IndianRupee,
  Scale,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface VaddiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShowroomSettings | null;
}

export const VaddiCalculatorModal: React.FC<VaddiCalculatorModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'calculator' | 'valuation' | 'quick'>('calculator');

  // Interest Calculator States
  const [principal, setPrincipal] = useState<number>(100000);
  const [interestRatePerHundred, setInterestRatePerHundred] = useState<number>(1.5); // ₹1.50 per ₹100 / month
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');
  const [compoundMonths, setCompoundMonths] = useState<number>(12); // compounded every 12 months
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Direct Duration state (optional toggle)
  const [durationMode, setDurationMode] = useState<'dates' | 'duration'>('dates');
  const [inputMonths, setInputMonths] = useState<number>(12);
  const [inputDays, setInputDays] = useState<number>(0);

  // Gold Valuation Estimator States
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(10); // Standard 10 grams
  const [purity, setPurity] = useState<'24K' | '22K' | '18K' | 'silver'>('22K');
  const [wastagePercent, setWastagePercent] = useState<number>(8); // 8% wastage (Kadippu/Vaddi)
  const [makingChargePerGram, setMakingChargePerGram] = useState<number>(350);
  const [stoneCharges, setStoneCharges] = useState<number>(0);
  const [customRatePerGram, setCustomRatePerGram] = useState<number>(0);

  if (!isOpen) return null;

  // Rate helper
  const getBaseRate = (): number => {
    if (customRatePerGram > 0) return customRatePerGram;
    if (purity === '24K') return Number(settings?.gold_rate_24k) || 8650;
    if (purity === '22K') return Number(settings?.gold_rate_22k) || 7950;
    if (purity === '18K') return Number(settings?.gold_rate_18k) || 6500;
    if (purity === 'silver') return Number(settings?.silver_rate) || 102;
    return 7950;
  };

  // Interest Calculation Math
  let totalMonths = 0;
  let totalDays = 0;
  let durationFormatted = '';

  if (durationMode === 'dates') {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const totalDiffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const y = Math.floor(totalDiffDays / 365);
    const remDaysAfterYear = totalDiffDays % 365;
    const m = Math.floor(remDaysAfterYear / 30);
    const d = remDaysAfterYear % 30;

    totalMonths = (totalDiffDays / 30);
    totalDays = totalDiffDays;
    durationFormatted = `${y > 0 ? `${y} ${y === 1 ? 'Year' : 'Years'} ` : ''}${m} Months, ${d} Days (${totalDiffDays} days)`;
  } else {
    totalMonths = inputMonths + inputDays / 30;
    totalDays = Math.round(inputMonths * 30 + inputDays);
    durationFormatted = `${inputMonths} Months, ${inputDays} Days`;
  }

  // Monthly interest per ₹100 = interestRatePerHundred %
  // Monthly interest = Principal * (interestRatePerHundred / 100)
  let calculatedInterest = 0;
  if (interestType === 'simple') {
    calculatedInterest = principal * (interestRatePerHundred / 100) * totalMonths;
  } else {
    // Compound interest according to Andhra traditional compounding (Chakravaddi)
    const cycles = totalMonths / compoundMonths;
    const ratePerCycle = (interestRatePerHundred / 100) * compoundMonths;
    const totalAmount = principal * Math.pow(1 + ratePerCycle, cycles);
    calculatedInterest = totalAmount - principal;
  }

  const monthlyInterestAmount = principal * (interestRatePerHundred / 100);
  const totalPayable = principal + calculatedInterest;

  // Valuation Math
  const activeRate = getBaseRate();
  const rawMetalValue = goldWeightGrams * activeRate;
  const wastageValue = rawMetalValue * (wastagePercent / 100);
  const makingChargesTotal = goldWeightGrams * makingChargePerGram;
  const subtotalBeforeGst = rawMetalValue + wastageValue + makingChargesTotal + stoneCharges;
  const gstAmount = subtotalBeforeGst * 0.03; // 3% GST on jewellery
  const totalRetailEstimate = subtotalBeforeGst + gstAmount;

  // Loan LTV (usually 75% of raw gold market value)
  const maxLoanEligible = Math.round(rawMetalValue * 0.75);

  return (
    <div
      id="vaddi-tools-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        id="vaddi-tools-modal-card"
        className="bg-[#F8F6F0] rounded-2xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-stone-300 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white px-5 py-3.5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A869]/20 border border-[#C5A869]/40 flex items-center justify-center text-[#C5A869]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury font-bold text-base text-[#FDFCFB]">
                  {language === 'te' ? 'వడ్డీ కాలిక్యులేటర్ & బంగారం మూల్యాంకనం' : 'Traditional Vaddi & Gold Valuation'}
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                  PRODDATUR
                </span>
              </div>
              <span className="text-[11px] text-stone-400 block">
                {language === 'te'
                  ? 'రూపాయి వడ్డీ లెక్కలు (నెలవారీ వడ్డీ), ఆభరణాల తయారీ అంచనా & తాకట్టు లెక్క'
                  : 'Traditional Rupee Interest (వడ్డీ లెక్కలు), Making & Wastage Estimator'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-stone-200/90 border-b border-stone-300 px-4 py-2 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#C5A869]" />
            <span>{language === 'te' ? 'వడ్డీ లెక్కలు (Rupee Interest)' : 'Rupee Interest (వడ్డీ)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('valuation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'valuation'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Gem className="w-4 h-4 text-amber-600" />
            <span>{language === 'te' ? 'బంగారు మూల్యాంకనం (Gold Valuation)' : 'Jewellery Estimation'}</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'calculator' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Form */}
              <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <IndianRupee className="w-4 h-4 text-[#C5A869]" />
                  <span>Loan & Interest Parameters</span>
                </h3>

                {/* Principal */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'te' ? 'అసలు మొత్తం (Principal Amount - ₹)' : 'Principal Amount (₹)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-bold">₹</span>
                    <input
                      type="number"
                      value={principal || ''}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg text-sm font-semibold focus:outline-hidden focus:border-[#C5A869] focus:ring-1 focus:ring-[#C5A869]"
                      placeholder="e.g. 100000"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {[25000, 50000, 100000, 200000, 500000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPrincipal(preset)}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          principal === preset
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        ₹{(preset / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rate per Hundred */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'te'
                      ? 'నెలవారీ నూటికి వడ్డీ (Interest per ₹100 / Month)'
                      : 'Monthly Interest per ₹100 (రూపాయిల వడ్డీ)'}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-bold">₹</span>
                      <input
                        type="number"
                        step="0.25"
                        value={interestRatePerHundred || ''}
                        onChange={(e) => setInterestRatePerHundred(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg text-sm font-semibold focus:outline-hidden focus:border-[#C5A869]"
                        placeholder="e.g. 1.50"
                      />
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      (= {(interestRatePerHundred * 12).toFixed(1)}% p.a.)
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {[1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setInterestRatePerHundred(rate)}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          interestRatePerHundred === rate
                            ? 'bg-amber-700 text-white border-amber-700'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        ₹{rate.toFixed(2)} ({rate === 1 ? '1 రూపాయి' : `${rate} రూ`})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interest Calculation Type */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Interest Mode</label>
                    <select
                      value={interestType}
                      onChange={(e) => setInterestType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold bg-white"
                    >
                      <option value="simple">Simple Interest (సాధారణ వడ్డీ)</option>
                      <option value="compound">Compound Interest (చక్రవడ్డీ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Duration Input Mode</label>
                    <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setDurationMode('dates')}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          durationMode === 'dates' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                        }`}
                      >
                        Calendar Dates
                      </button>
                      <button
                        type="button"
                        onClick={() => setDurationMode('duration')}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          durationMode === 'duration' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                        }`}
                      >
                        Months / Days
                      </button>
                    </div>
                  </div>
                </div>

                {/* Date / Duration pickers */}
                {durationMode === 'dates' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'te' ? 'ప్రారంభ తేదీ (Start Date)' : 'Loan Taken Date'}
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {language === 'te' ? 'ముగింపు తేదీ (End Date)' : 'Settlement Date'}
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Number of Months</label>
                      <input
                        type="number"
                        min="0"
                        value={inputMonths}
                        onChange={(e) => setInputMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Additional Days</label>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={inputDays}
                        onChange={(e) => setInputDays(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Result Summary Card */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#1C1A17] to-[#2D2821] text-white rounded-xl p-5 border border-amber-900/40 shadow-md">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">Calculation Breakdown</span>
                    <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                      {interestType === 'simple' ? 'Simple Vaddi' : 'Chakra Vaddi'}
                    </span>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Total Duration:</span>
                      <span className="font-semibold text-stone-200">{durationFormatted}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Monthly Interest:</span>
                      <span className="font-semibold text-stone-200">₹{monthlyInterestAmount.toLocaleString('en-IN')}/mo</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Principal (అసలు):</span>
                      <span className="font-semibold text-stone-200">₹{principal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                      <span className="text-amber-300 font-bold">Total Interest (వడ్డీ):</span>
                      <span className="font-bold text-amber-300 font-mono">₹{Math.round(calculatedInterest).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 mt-3">
                      <span className="block text-[11px] text-stone-400 uppercase tracking-wider mb-1">
                        Total Settlement Amount (మొత్తం చెల్లింపు)
                      </span>
                      <span className="text-2xl font-bold font-serif-luxury text-[#E5D2A8] font-mono">
                        ₹{Math.round(totalPayable).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-stone-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>Calculated according to standard Proddatur jewellery market conventions.</span>
                </div>
              </div>
            </div>
          ) : (
            /* Jewellery Valuation Tab */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Gem className="w-4 h-4 text-amber-600" />
                  <span>Jewellery Specification & Rates</span>
                </h3>

                {/* Purity & Metal */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Purity / Metal</label>
                    <select
                      value={purity}
                      onChange={(e) => setPurity(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold bg-white"
                    >
                      <option value="22K">22K Gold (916 BIS Hallmark) - ₹{settings?.gold_rate_22k || 7950}/g</option>
                      <option value="24K">24K Pure Gold (999) - ₹{settings?.gold_rate_24k || 8650}/g</option>
                      <option value="18K">18K Studded Gold (750) - ₹{settings?.gold_rate_18k || 6500}/g</option>
                      <option value="silver">92.5 Fine Silver - ₹{settings?.silver_rate_1g || 102}/g</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Gross Weight (Grams / 10g Units)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={goldWeightGrams || ''}
                        onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                        placeholder="e.g. 10.0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">grams</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-stone-500 font-medium">
                        = {goldWeightGrams ? (goldWeightGrams / 10).toFixed(2) : '0'} × 10g Units ({goldWeightGrams || 0} grams)
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {[5, 10, 20, 30, 50, 100].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setGoldWeightGrams(w)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            goldWeightGrams === w
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {w}g {w % 10 === 0 ? `(${w / 10}×10g)` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wastage & Making Charges */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Wastage / Kadippu (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={wastagePercent}
                        onChange={(e) => setWastagePercent(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                        placeholder="e.g. 8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Making Charge (₹ / gram)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        value={makingChargePerGram}
                        onChange={(e) => setMakingChargePerGram(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                        placeholder="e.g. 350"
                      />
                    </div>
                  </div>
                </div>

                {/* Stone Charges */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Stone / Enamel / Pearl Value (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">₹</span>
                    <input
                      type="number"
                      value={stoneCharges}
                      onChange={(e) => setStoneCharges(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Valuation Breakdown */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#1C1A17] to-[#2D2821] text-white rounded-xl p-5 border border-amber-900/40 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">Estimated Invoice Breakdown</span>
                    <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                      {purity} @ ₹{activeRate}/g
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Pure Metal Value ({goldWeightGrams}g):</span>
                      <span className="font-semibold text-stone-200">₹{Math.round(rawMetalValue).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-stone-400">Wastage ({wastagePercent}%):</span>
                      <span className="font-semibold text-stone-200">+ ₹{Math.round(wastageValue).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-stone-400">Making Charges:</span>
                      <span className="font-semibold text-stone-200">+ ₹{Math.round(makingChargesTotal).toLocaleString('en-IN')}</span>
                    </div>

                    {stoneCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Stone Charges:</span>
                        <span className="font-semibold text-stone-200">+ ₹{stoneCharges.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-white/10 text-stone-300">
                      <span>GST (3%):</span>
                      <span>+ ₹{Math.round(gstAmount).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 mt-3">
                      <span className="block text-[11px] text-stone-400 uppercase tracking-wider mb-1">
                        Total Estimated Showroom Price
                      </span>
                      <span className="text-2xl font-bold font-serif-luxury text-[#E5D2A8] font-mono">
                        ₹{Math.round(totalRetailEstimate).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-500/20 mt-2">
                      <span className="block text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                        Pledged Loan Appraisal Limit (75% LTV)
                      </span>
                      <span className="text-lg font-bold text-amber-200 font-mono">
                        ₹{maxLoanEligible.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-stone-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exact final invoice depends on final craftsmanship weight and stones.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
