export type Language = 'en' | 'te';

export type MetalType = 'All' | 'Gold' | 'Silver';

export interface Product {
  id: number;
  code: string;
  title: string;
  title_te?: string;
  metal: 'Gold' | 'Silver';
  category: string;
  category_te?: string;
  product_type: string;
  purity: string;
  description: string;
  description_te?: string;
  weight: number; // in grams
  size?: string;
  price?: number;
  show_price?: number; // 0: Price on request, 1: Show price
  wastage_percent?: number; // VA % (e.g. 10 for 10%)
  wastage_cost?: number; // Flat wastage amount in ₹
  labour_cost?: number; // Making charges / Labour cost in ₹
  making_charge_per_gram?: number; // Making charges per gram in ₹/g
  availability: 'In Stock' | 'Custom Order' | 'Out of Stock';
  featured: number; // 0 or 1
  new_arrival: number; // 0 or 1
  image_path: string;
  image_paths: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  name_te: string;
  metal: 'Gold' | 'Silver';
  slug: string;
  image_path?: string;
  sort_order: number;
  product_count?: number;
}

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email?: string;
  product_id?: number;
  product_code?: string;
  product_title?: string;
  message?: string;
  status: 'New' | 'Contacted' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at?: string;
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  review: string;
  review_te?: string;
  verified: number;
  date: string;
  created_at?: string;
}

export interface ShowroomSettings {
  shop_name: string;
  shop_name_te?: string;
  tagline: string;
  tagline_te?: string;
  address: string;
  address_te?: string;
  city_state_pincode: string;
  city_state_pincode_te?: string;
  phone: string;
  whatsapp: string;
  google_maps_url: string;
  opening_hours: string;
  opening_hours_te?: string;
  gold_rate_24k: string;
  gold_rate_22k: string;
  gold_rate_18k: string;
  silver_rate: string;
  hero_title: string;
  hero_title_te?: string;
  hero_subtitle: string;
  hero_subtitle_te?: string;
  [key: string]: string | undefined;
}

// ----------------------------------------------------
// Traditional Vaddi & Gold Loan Types (Preserved & Enhanced)
// ----------------------------------------------------
export type InterestType = 'simple' | 'compound';
export type CompoundingFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
export type GoldPurity = '24K' | '22K' | '18K' | '14K' | 'silver';

export interface RetailEstimateItem {
  id: string;
  name: string;
  purity: GoldPurity;
  weightGrams: number;
  wastagePercent: number;
  makingChargePerGram: number;
  stoneCharge: number;
}

export interface PledgedItem {
  id: string;
  name: string;
  purity: GoldPurity;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  marketValue: number;
  itemImage?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  type: 'interest' | 'principal' | 'settlement';
  notes?: string;
  receiptNumber: string;
}

export interface GoldLoan {
  id: string;
  tokenNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerIdProof?: string;
  principalAmount: number;
  monthlyInterestRate: number;
  annualInterestRate: number;
  interestType: InterestType;
  compoundingFrequency?: CompoundingFrequency;
  startDate: string;
  dueDate?: string;
  closedDate?: string;
  status: 'active' | 'settled' | 'overdue';
  items: PledgedItem[];
  totalGrossWeight: number;
  totalNetWeight: number;
  totalMarketValue: number;
  maxLoanOffered: number;
  payments: PaymentRecord[];
  notes?: string;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  licenseNumber: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  cityState: string;
  goldRate24K: number;
  goldRate22K: number;
  goldRate18K: number;
  silverRate: number;
  defaultMonthlyInterest: number;
  defaultLTV: number;
  currencySymbol: string;
}

export interface VaddiCalculationResult {
  principal: number;
  monthlyRate: number;
  annualRate: number;
  interestType: InterestType;
  startDate: string;
  endDate: string;
  totalDays: number;
  years: number;
  months: number;
  remainingDays: number;
  totalInterest: number;
  totalAmount: number;
  dailyInterest: number;
  monthlyInterest: number;
  breakdown: {
    period: string;
    principalAtStart: number;
    interestAccrued: number;
    closingBalance: number;
  }[];
}
