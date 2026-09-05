/**
 * ClimaPulse — Industrial Service
 *
 * Deterministic industrial zone data per location.
 */

import { createSeededRandom, seedFromLocation, randBetween, randInt, pickRandom } from "../seededRandom.js";

export function getIndustrialData(location) {
  const rand = createSeededRandom(seedFromLocation(location, "industrial"));

  const zones = [
    {
      id: "zone1",
      name: "Riverside Industrial Park",
      type: "Chemical / Petrochemical",
      distance: `${Math.round(randBetween(rand, 1, 9))} km`,
      facilityCount: randInt(rand, 16, 32),
      compliance: pickRandom(rand, ["High", "Moderate", "Screening"]),
      impactScore: randInt(rand, 45, 92),
      emissions: {
        co2: Math.round(randBetween(rand, 120, 480)),
        no2: Math.round(randBetween(rand, 20, 90)),
        so2: Math.round(randBetween(rand, 12, 55)),
        pm25: Math.round(randBetween(rand, 8, 40)),
      },
      factories: [
        { name: "Northgate Chemicals", output: randBetween(rand, 35, 90), share: randInt(rand, 18, 40), status: "Flagged" },
        { name: "Polymer Refining Co.", output: randBetween(rand, 25, 80), share: randInt(rand, 10, 30), status: "Compliant" },
        { name: "Apex Solvents Ltd.", output: randBetween(rand, 15, 60), share: randInt(rand, 6, 20), status: "Monitored" },
      ],
    },
    {
      id: "zone2",
      name: "East Port Manufacturing Belt",
      type: "Heavy Manufacturing / Steel",
      distance: `${Math.round(randBetween(rand, 4, 18))} km`,
      facilityCount: randInt(rand, 14, 28),
      compliance: pickRandom(rand, ["Moderate", "Screening", "High"]),
      impactScore: randInt(rand, 50, 95),
      emissions: {
        co2: Math.round(randBetween(rand, 200, 650)),
        no2: Math.round(randBetween(rand, 30, 120)),
        so2: Math.round(randBetween(rand, 18, 70)),
        pm25: Math.round(randBetween(rand, 12, 55)),
      },
      factories: [
        { name: "Ironworks & Steel", output: randBetween(rand, 40, 100), share: randInt(rand, 25, 45), status: "Flagged" },
        { name: "Seaport Foundry", output: randBetween(rand, 20, 70), share: randInt(rand, 8, 25), status: "Monitored" },
        { name: "Metro Metal Works", output: randBetween(rand, 15, 55), share: randInt(rand, 5, 18), status: "Compliant" },
      ],
    },
    {
      id: "zone3",
      name: "Valley Agro-Industrial Estate",
      type: "Food / Textiles",
      distance: `${Math.round(randBetween(rand, 2, 14))} km`,
      facilityCount: randInt(rand, 18, 38),
      compliance: pickRandom(rand, ["High", "Moderate"]),
      impactScore: randInt(rand, 30, 75),
      emissions: {
        co2: Math.round(randBetween(rand, 60, 260)),
        no2: Math.round(randBetween(rand, 12, 55)),
        so2: Math.round(randBetween(rand, 6, 30)),
        pm25: Math.round(randBetween(rand, 6, 28)),
      },
      factories: [
        { name: "Greenline Food Processors", output: randBetween(rand, 20, 70), share: randInt(rand, 12, 30), status: "Compliant" },
        { name: "Textile Dyeing Unit No. 4", output: randBetween(rand, 15, 60), share: randInt(rand, 8, 22), status: "Monitored" },
        { name: "AgroCrop Packaging", output: randBetween(rand, 12, 50), share: randInt(rand, 5, 18), status: "Compliant" },
      ],
    },
  ];

  const totals = zones.reduce(
    (acc, z) => {
      acc.co2 += z.emissions.co2;
      acc.no2 += z.emissions.no2;
      acc.so2 += z.emissions.so2;
      acc.pm25 += z.emissions.pm25;
      acc.facilities += z.facilityCount;
      acc.flagged += z.factories.filter((f) => f.status === "Flagged").length;
      return acc;
    },
    { co2: 0, no2: 0, so2: 0, pm25: 0, facilities: 0, flagged: 0 }
  );

  return { zones, totals, location };
}
