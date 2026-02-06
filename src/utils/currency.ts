/**
 * Currency formatting utilities
 * Centralized currency formatting for the entire application
 */

export const CURRENCY_SYMBOL = '₹'; // Indian Rupee
export const CURRENCY_CODE = 'INR';

/**
 * Format a number as currency with the configured symbol
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: false)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_SYMBOL}0`;
  }
  
  const formatted = showDecimals 
    ? amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('en-IN');
  
  return `${CURRENCY_SYMBOL}${formatted}`;
}

/**
 * Format currency with full locale support
 * @param amount - The amount to format
 * @returns Formatted currency string with locale
 */
export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency for display (compact version)
 * @param amount - The amount to format
 * @returns Compact formatted currency string (e.g., "₹1.2K", "₹3.5M")
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) {
    return `${CURRENCY_SYMBOL}${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `${CURRENCY_SYMBOL}${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `${CURRENCY_SYMBOL}${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Parse currency string to number
 * @param currencyString - String like "₹1,234" or "1234"
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  const cleaned = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}
