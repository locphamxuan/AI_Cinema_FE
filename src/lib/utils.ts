/**
 * AI Cinema - Utility Functions
 */

/**
 * Format numbers with Vietnamese locale separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN');
}

/**
 * Format coin amount with proper sign and label
 */
export function formatCoin(amount: number, type: 'main' | 'bonus' = 'main'): string {
  const formatted = formatNumber(amount);
  return type === 'bonus' ? `+${formatted} Coin` : `${formatted} Coin`;
}

/**
 * Format VND currency
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format duration from minutes or seconds to readable text (e.g. 1h 45m or 45m)
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 phút';
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours > 0 && remainingMins > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  if (hours > 0) {
    return `${hours} giờ`;
  }
  return `${remainingMins} phút`;
}

/**
 * Format date to Vietnamese display format (DD/MM/YYYY or DD/MM/YYYY HH:mm)
 */
export function formatDate(dateString: string, includeTime: boolean = false): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (includeTime) {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Combine multiple classnames cleanly
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
