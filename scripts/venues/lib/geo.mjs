// Geo helpers: geohash encoding and great-circle distance. No dependencies.

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function geohash(lat, lng, precision = 7) {
  let latMin = -90, latMax = 90, lngMin = -180, lngMax = 180;
  let hash = "", bits = 0, bit = 0, even = true;
  while (hash.length < precision) {
    if (even) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) { bit = (bit << 1) | 1; lngMin = mid; } else { bit = bit << 1; lngMax = mid; }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) { bit = (bit << 1) | 1; latMin = mid; } else { bit = bit << 1; latMax = mid; }
    }
    even = !even;
    if (++bits === 5) { hash += BASE32[bit]; bits = 0; bit = 0; }
  }
  return hash;
}

export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371008.8;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Plan section 4.2 gate 3: the source point and the address geocode must be within 100 m. */
export const PIN_MAX_METERS = 100;
export function pinCheck(a, b) {
  const meters = haversineMeters(a.lat, a.lng, b.lat, b.lng);
  return { meters, ok: meters <= PIN_MAX_METERS };
}
