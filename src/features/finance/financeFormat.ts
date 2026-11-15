const NUMBER = new Intl.NumberFormat('vi-VN');

/** "1.500.000 VND" (the Financial Dashboard spells the currency out). */
export function vnd(n: number | null | undefined): string {
  return n === null || n === undefined ? '—' : `${NUMBER.format(n)} VND`;
}

/** "-20%"; "—" while a film has no production cost (roiPercent null). */
export function roi(percent: number | null | undefined): string {
  return percent === null || percent === undefined ? '—' : `${NUMBER.format(percent)}%`;
}

/** Watch time as hours:minutes, e.g. 3725 s → "1:02". */
export function watchTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Rows `page` of a list the backend sends whole (sorted and searched here). */
export function pageOf<T>(rows: T[], page: number, size: number): T[] {
  return rows.slice((page - 1) * size, page * size);
}
