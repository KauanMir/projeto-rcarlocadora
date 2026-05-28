export const MIN_RENTAL_DAYS = 1;
export const MAX_RENTAL_DAYS = 30;

/**
 * Returns today's date as YYYY-MM-DD using the browser/server's local timezone.
 * Using .toISOString() would give UTC date, which can be off by 1 day for
 * users in UTC- timezones after midnight UTC but before local midnight.
 */
export function todayLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parses a YYYY-MM-DD string as UTC noon.
 * Using noon (not midnight) prevents DST transitions from shifting the date by 1 day.
 * Using Z (UTC) ensures server and client arithmetic is consistent regardless of
 * the runtime's local timezone.
 */
export function parseDateUTC(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

/** Calculates rental days between two YYYY-MM-DD strings. Minimum MIN_RENTAL_DAYS. */
export function calcRentalDays(pickupDate: string, returnDate: string): number {
  const pickup = parseDateUTC(pickupDate);
  const returnD = parseDateUTC(returnDate);
  const ms = returnD.getTime() - pickup.getTime();
  return Math.max(Math.ceil(ms / 86_400_000), MIN_RENTAL_DAYS);
}

/** Returns true if the rental period is within allowed bounds. */
export function isValidRentalPeriod(pickupDate: string, returnDate: string): boolean {
  const days = calcRentalDays(pickupDate, returnDate);
  return days >= MIN_RENTAL_DAYS && days <= MAX_RENTAL_DAYS;
}
