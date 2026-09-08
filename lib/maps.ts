/**
 * Google's free "Universal Cross-Platform Maps URL" scheme — just a deep link, not the paid Maps
 * JavaScript/Geocoding API. No API key, no billing account, nothing to configure. Opens Google
 * Maps in the browser on desktop and deep-links into the native app on mobile.
 */
export function directionsUrl(...parts: (string | undefined)[]): string {
  const query = parts.filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
