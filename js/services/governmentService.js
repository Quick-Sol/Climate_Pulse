/**
 * ClimaPulse — Government Service
 *
 * Deterministic national scorecards, local policies and
 * industrial accountability data.
 */

import { getCountryScorecards, getLocalPolicies, getIndustrialAccountability } from "./mockData.js";

export function getScorecards() {
  return Promise.resolve(getCountryScorecards());
}

export function getPolicies(location) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getLocalPolicies(location)), 300);
  });
}

export function getAccountability() {
  return Promise.resolve(getIndustrialAccountability());
}

export const GOVERNMENT_SUGGESTIONS = [
  { name: "NYC", label: "New York City" },
  { name: "London", label: "London" },
  { name: "Berlin", label: "Berlin" },
  { name: "Mumbai", label: "Mumbai" },
  { name: "São Paulo", label: "São Paulo" },
  { name: "Tokyo", label: "Tokyo" },
];
