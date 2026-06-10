/**
 * @file date-timezone.util.ts
 * @description Pure TypeScript utility for defensive UTC parsing and Thailand local time (ICT) formatting.
 */

/**
 * Checks if the incoming string ends with 'Z' or contains a timezone offset.
 * If not, appends 'Z' to treat the unspecified date baseline as UTC.
 */
function ensureUtcString(dateString: string): string {
  if (!dateString) return dateString;
  const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/i.test(dateString);
  return hasTimezone ? dateString : `${dateString}Z`;
}

/**
 * Formats a UTC date string into a 24-hour layout HH:mm:ss in th-TH locale (ICT).
 */
export function formatToLocalTime(utcString: string | null | undefined): string {
  if (!utcString) return '';
  const date = new Date(ensureUtcString(utcString));
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
  }).format(date);
}

/**
 * Formats a UTC date string into long Thai date text using the Gregorian calendar (e.g. "11 มิถุนายน 2026").
 */
export function formatToLocalDate(utcString: string | null | undefined): string {
  if (!utcString) return '';
  const date = new Date(ensureUtcString(utcString));
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    timeZone: 'Asia/Bangkok'
  }).format(date);
}

/**
 * Formats a UTC date string into combined Thai date and time (e.g. "11 มิถุนายน 2026 เวลา 18:15").
 */
export function formatToLocalDateTime(utcString: string | null | undefined): string {
  if (!utcString) return '';
  const cleanStr = ensureUtcString(utcString);
  const date = new Date(cleanStr);
  const datePart = formatToLocalDate(cleanStr);
  const timePart = new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
  }).format(date);
  return `${datePart} เวลา ${timePart}`;
}
