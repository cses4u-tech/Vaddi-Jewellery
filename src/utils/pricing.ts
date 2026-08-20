import { Product, ShowroomSettings } from '../types';

export interface PriceBreakdown {
  ratePerGram: number;
  rateLabel: string;
  purityBadge: string;
  weightGrams: number;
  metalBasePrice: number;
  wastagePercent: number;
  wastageAmount: number;
  labourCost: number;
  totalPrice: number;
  formattedTotal: string;
}

/**
 * Returns today's active rate per gram for a given product based on its metal and purity.
 * Gold:
 *   - 24K (999): gold_rate_24k (e.g. ₹7,650)
 *   - 18K: gold_rate_18k (e.g. ₹5,750)
 *   - 22K (916 / default): gold_rate_22k (e.g. ₹7,020)
 * Silver:
 *   - silver_rate (e.g. ₹98)
 */
export function getProductGramRate(
  product: { metal?: string; purity?: string },
  settings: ShowroomSettings | null
): { rate: number; label: string; purityBadge: string } {
  const isGold = (product.metal || '').toLowerCase() === 'gold';
  const purity = (product.purity || '').toUpperCase();

  if (isGold) {
    if (purity.includes('24K') || purity.includes('999')) {
      const r = Number(settings?.gold_rate_24k) || 7650;
      return { rate: r, label: '24K Gold Rate (999.9)', purityBadge: '24K 999.9' };
    }
    if (purity.includes('18K')) {
      const r = Number(settings?.gold_rate_18k) || 5750;
      return { rate: r, label: '18K Gold Rate', purityBadge: '18K BIS' };
    }
    // Default 22K BIS 916
    const r = Number(settings?.gold_rate_22k) || 7020;
    return { rate: r, label: '22K BIS 916 Gold Rate', purityBadge: '22K 916' };
  } else {
    // Silver
    const r = Number(settings?.silver_rate) || 98;
    return { rate: r, label: '92.5 Sterling Silver Rate', purityBadge: '92.5 Silver' };
  }
}

/**
 * Calculates the exact dynamic live price and transparent breakdown for any jewellery / pooja item.
 * Formula:
 *  Total = (Weight in grams * Today's Gram Rate) + Wastage Price (VA) + Labour / Making Charges
 */
export function calculateProductPriceBreakdown(
  product: Partial<Product> & { metal?: string; purity?: string; weight?: number },
  settings: ShowroomSettings | null
): PriceBreakdown {
  const { rate, label, purityBadge } = getProductGramRate(
    { metal: product.metal || 'Gold', purity: product.purity || '22K BIS 916' },
    settings
  );

  const weight = Math.max(0, Number(product.weight) || 0);
  const metalBasePrice = Math.round(weight * rate);

  // Wastage (VA) calculation
  let wastagePercent = Number(product.wastage_percent) || 0;
  let wastageAmount = 0;

  if (product.wastage_cost !== undefined && product.wastage_cost !== null && Number(product.wastage_cost) > 0) {
    wastageAmount = Math.round(Number(product.wastage_cost));
    if (metalBasePrice > 0 && wastagePercent === 0) {
      wastagePercent = Number(((wastageAmount / metalBasePrice) * 100).toFixed(1));
    }
  } else if (wastagePercent > 0) {
    wastageAmount = Math.round((metalBasePrice * wastagePercent) / 100);
  }

  // Labour / Making Charges calculation
  let labourCost = 0;
  if (product.labour_cost !== undefined && product.labour_cost !== null && Number(product.labour_cost) > 0) {
    labourCost = Math.round(Number(product.labour_cost));
  } else if (product.making_charge_per_gram && Number(product.making_charge_per_gram) > 0) {
    labourCost = Math.round(weight * Number(product.making_charge_per_gram));
  }

  // Total price = Metal Base Price + Wastage Amount + Labour Cost
  const totalPrice = metalBasePrice + wastageAmount + labourCost;

  return {
    ratePerGram: rate,
    rateLabel: label,
    purityBadge,
    weightGrams: weight,
    metalBasePrice,
    wastagePercent,
    wastageAmount,
    labourCost,
    totalPrice,
    formattedTotal: `₹${totalPrice.toLocaleString('en-IN')}`,
  };
}

/**
 * Returns just the total calculated price number based on today's live rate and product attributes.
 */
export function getCalculatedProductPrice(
  product: Partial<Product>,
  settings: ShowroomSettings | null
): number {
  return calculateProductPriceBreakdown(product, settings).totalPrice;
}
