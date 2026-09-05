/**
 * Seeded pseudo-random number generator.
 * Deterministic — same seed always produces the same sequence.
 * Implemented as a mulberry32-style generator.
 */
export function createSeededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string into a 32-bit unsigned integer.
 * djb2-ish hashing, stable across platforms.
 */
export function hashString(str) {
  let hash = 5381;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 33) ^ s.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * Derive a numeric seed from a location name (plus optional salt)
 * so the same location always yields consistent demo data.
 */
export function seedFromLocation(locationName, salt = "") {
  return hashString(`${locationName}:${salt}`);
}

/**
 * Helper: generate a random float between min and max (inclusive) from a rand() function.
 */
export function randBetween(rand, min, max) {
  return min + rand() * (max - min);
}

/**
 * Helper: pick a random integer between min and max (inclusive).
 */
export function randInt(rand, min, max) {
  return Math.floor(min + rand() * (max - min + 1));
}

/**
 * Helper: pick a random element from an array.
 */
export function pickRandom(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}
