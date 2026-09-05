/**
 * ClimaPulse — Geocode Service
 *
 * Resolves a search query to a deterministic location object.
 * Known locations use fixed coordinates; unknown locations get
 * deterministic coordinates derived from the query hash.
 */

import { createSeededRandom, seedFromLocation, randBetween } from "../seededRandom.js";
import { KNOWN_LOCATIONS } from "./mockData.js";

const KNOWN_COORDS = {
  "new york": { lat: 40.7128, lon: -74.006, country: "USA", region: "New York" },
  "london": { lat: 51.5074, lon: -0.1278, country: "UK", region: "England" },
  "mumbai": { lat: 19.076, lon: 72.8777, country: "India", region: "Maharashtra" },
  "delhi": { lat: 28.7041, lon: 77.1025, country: "India", region: "National Capital Territory" },
  "jaipur": { lat: 26.9124, lon: 75.7873, country: "India", region: "Rajasthan" },
  "tokyo": { lat: 35.6762, lon: 139.6503, country: "Japan", region: "Kantō" },
  "berlin": { lat: 52.52, lon: 13.405, country: "Germany", region: "Berlin" },
  "são paulo": { lat: -23.5505, lon: -46.6333, country: "Brazil", region: "São Paulo" },
  "sao paulo": { lat: -23.5505, lon: -46.6333, country: "Brazil", region: "São Paulo" },
  "punjab": { lat: 31.1471, lon: 75.3412, country: "India", region: "Punjab" },
  "iowa": { lat: 42.0329, lon: -93.5818, country: "USA", region: "Iowa" },
  "nairobi": { lat: -1.2921, lon: 36.8219, country: "Kenya", region: "Nairobi" },
  "andalusia": { lat: 37.3828, lon: -5.9963, country: "Spain", region: "Andalusia" },
};

/** Search for location suggestions matching a query. */
export function search(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];

  const exact = KNOWN_COORDS[q];
  const results = [];

  if (exact) {
    results.push({
      name: toTitle(q),
      country: exact.country,
      region: exact.region,
      lat: exact.lat,
      lon: exact.lon,
    });
  }

  for (const k of Object.keys(KNOWN_COORDS)) {
    if (k !== q && k.toLowerCase().includes(q) && results.length < 5) {
      const c = KNOWN_COORDS[k];
      results.push({
        name: toTitle(k),
        country: c.country,
        region: c.region,
        lat: c.lat,
        lon: c.lon,
      });
    }
  }
  return results;
}

/**
 * Resolve an arbitrary query to a full location object.
 * Unknown locations get deterministic coordinates.
 */
export function geocode(query) {
  const q = (query || "").trim();
  const lc = q.toLowerCase();
  const known = KNOWN_COORDS[lc];
  if (known) {
    return {
      name: toTitle(lc),
      country: known.country,
      region: known.region,
      lat: known.lat,
      lon: known.lon,
      isKnown: true,
    };
  }

  // Deterministic unknown location
  const rand = createSeededRandom(seedFromLocation(q || "unknown"));
  const lat = randBetween(rand, -55, 60);
  const lon = randBetween(rand, -130, 160);
  const name = q || "Unknown location";
  return {
    name,
    country: "Unknown",
    region: "",
    lat: Math.round(lat * 10000) / 10000,
    lon: Math.round(lon * 10000) / 10000,
    isKnown: false,
  };
}

function toTitle(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Known suggestion list for autocomplete chips. */
export function getSuggestions() {
  return KNOWN_LOCATIONS.map((l) => ({
    name: l.name,
    country: l.country,
  }));
}
