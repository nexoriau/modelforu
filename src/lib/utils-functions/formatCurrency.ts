/**
 * Currency Formatting Utility
 *
 * Formats numeric values as USD currency strings.
 * Handles invalid inputs gracefully by returning $0.00.
 *
 * @param amount - Numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 *
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(NaN) // "$0.00"
 */
export const formatCurrency = (amount: number): string => {
  // Handle invalid numbers gracefully
  if (isNaN(amount)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
