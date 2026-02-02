/**
 * Formats a number as a currency string with digit grouping (commas)
 * @param amount The numeric amount to format
 * @param currency The currency code (e.g., 'NGN', 'ATH', 'USD')
 * @param locale Optional locale for formatting
 * @returns Formatted string (e.g., "1,000")
 */
export function formatCurrency(amount: number | string, currency?: string, locale: string = 'en-US'): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) return '0';

    // We use en-US by default to get the comma as thousands separator
    // If no currency is provided, we just return the formatted number
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numericAmount);
}

/**
 * Formats a number with commas but no currency specifics
 * @param val Number or string to format
 */
export function formatNumber(val: number | string): string {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) return '0';
    return n.toLocaleString('en-US');
}
