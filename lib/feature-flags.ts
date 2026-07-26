/**
 * Public booking is enabled only when this is exactly "true".
 * Missing or any other value ("false", unset, etc.) puts the public
 * site in catalog-only mode: no prices, no reservation flow, every
 * CTA routes to WhatsApp. Flip NEXT_PUBLIC_BOOKING_ENABLED back to
 * "true" to restore direct online booking.
 */
export const BOOKING_ENABLED = process.env.NEXT_PUBLIC_BOOKING_ENABLED === "true";
