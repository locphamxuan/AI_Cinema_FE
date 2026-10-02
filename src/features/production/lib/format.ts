const DATE_TIME = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
const DATE = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const NUMBER = new Intl.NumberFormat('vi-VN');

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? DATE_TIME.format(new Date(iso)) : '—';
}

/** A due date: the API stores a calendar day (`@db.Date`), so read it without shifting time zones. */
export function formatDay(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return DATE.format(new Date(y, m - 1, d));
}

export function formatNumber(n: number | null | undefined): string {
  return n === null || n === undefined ? '—' : NUMBER.format(n);
}

/** 1:05:09 / 12:30 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '—';
  const s = Math.abs(Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, '0');
  const sign = seconds < 0 ? '-' : '';
  return h > 0 ? `${sign}${h}:${String(m).padStart(2, '0')}:${rest}` : `${sign}${m}:${rest}`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

/** Value for <input type="date"> as YYYY-MM-DD, in local time. */
export function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

/** YYYY-MM-DD plus `days`, computed on the calendar (no time zone shift). */
export function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** <input type="datetime-local"> value → ISO string with the browser's offset. */
export function localDateTimeToIso(value: string): string {
  return new Date(value).toISOString();
}

/** Triggers a browser download of a fetched file. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
