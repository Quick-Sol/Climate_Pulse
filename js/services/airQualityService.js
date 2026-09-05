/**
 * ClimaPulse — Air Quality Service
 */

import { generateClimateData, getHourlyTrends, getWeeklyTrends } from "./mockData.js";

/**
 * Get current air quality for a location (deterministic mock).
 */
export function getCurrent(location) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateClimateData(location);
      resolve(data.airQuality);
    }, 400);
  });
}

/** Get the climate snapshot (temperature anomaly). */
export function getClimateSnapshot(location) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateClimateData(location);
      resolve(data.snapshot);
    }, 400);
  });
}

/** Get hourly trends (24 points). */
export function getHourly(location) {
  return Promise.resolve(getHourlyTrends(location));
}

/** Get weekly trends (7 days). */
export function getWeekly(location) {
  return Promise.resolve(getWeeklyTrends(location));
}
