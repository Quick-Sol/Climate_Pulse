/**
 * ClimaPulse — Weather Service
 */

import { generateClimateData } from "./mockData.js";

/**
 * Get current weather for a location (deterministic mock).
 * Async to simulate a real API call.
 */
export function getCurrent(location) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateClimateData(location);
      resolve(data.weather);
    }, 400);
  });
}

export { generateClimateData };
