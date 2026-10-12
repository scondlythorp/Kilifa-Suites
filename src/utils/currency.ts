/**
 * Kilifa Suites — Central Currency & Price Formatting Utilities
 *
 * Primary Business Currency: Gambian Dalasi (GMD)
 * Standard Display Notation: D 2,500 / night or GMD 2,500
 */

export const PRIMARY_CURRENCY = 'GMD' as const;
export const CURRENCY_SYMBOL = 'D' as const;
export const STANDARD_ROOM_PRICE_GMD = 2500;

export interface PriceFormatOptions {
  /**
   * Style of the currency symbol.
   * - 'symbol': "D 2,500" (Default & recommended standard)
   * - 'code': "GMD 2,500"
   * - 'none': "2,500"
   */
  style?: 'symbol' | 'code' | 'none';
  /**
   * Include the per-night suffix. E.g. "D 2,500 / night"
   */
  includePerNight?: boolean;
  /**
   * Minimum fraction digits (defaults to 0 for GMD integers)
   */
  minimumFractionDigits?: number;
  /**
   * Maximum fraction digits (defaults to 0 for GMD integers)
   */
  maximumFractionDigits?: number;
}

/**
 * Format an amount in Gambian Dalasi (GMD)
 * @param amount Numeric monetary value
 * @param options Formatting options
 * @returns Formatted currency string, e.g. "D 2,500", "D 2,500 / night", or "GMD 2,500"
 */
export function formatGMD(amount: number | null | undefined, options: PriceFormatOptions = {}): string {
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const {
    style = 'symbol',
    includePerNight = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  const formattedNumber = new Intl.NumberFormat('en-GM', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericAmount);

  let result = '';
  switch (style) {
    case 'symbol':
      result = `D ${formattedNumber}`;
      break;
    case 'code':
      result = `GMD ${formattedNumber}`;
      break;
    case 'none':
      result = formattedNumber;
      break;
    default:
      result = `D ${formattedNumber}`;
  }

  if (includePerNight) {
    result += ' / night';
  }

  return result;
}

/**
 * Convenience helper for standard nightly price display:
 * E.g. "D 2,500 / night"
 */
export function formatNightlyRate(amount: number | null | undefined): string {
  return formatGMD(amount, { style: 'symbol', includePerNight: true });
}

/**
 * Convenience helper for total booking price:
 * E.g. "D 7,500"
 */
export function formatBookingTotal(amount: number | null | undefined): string {
  return formatGMD(amount, { style: 'symbol', includePerNight: false });
}

/**
 * Explicit code format for official invoices / formal receipts:
 * E.g. "GMD 2,500"
 */
export function formatFormalGMD(amount: number | null | undefined): string {
  return formatGMD(amount, { style: 'code', includePerNight: false });
}

/**
 * Safely calculate total stay price without floating point rounding errors
 * @param pricePerNight Nightly rate in GMD (standard 2,500)
 * @param nights Number of nights
 * @returns Total stay price in GMD
 */
export function calculateStayTotal(pricePerNight: number, nights: number): number {
  const rate = Math.round(Number(pricePerNight) || STANDARD_ROOM_PRICE_GMD);
  const duration = Math.max(1, Math.round(Number(nights) || 1));
  return rate * duration;
}
