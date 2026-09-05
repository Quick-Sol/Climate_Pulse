/**
 * ClimaPulse — Deterministic Mock Data System
 *
 * Same location always generates consistent demo data via seeded RNG.
 * Location -> hash -> seed -> PRNG -> climate data.
 */

import {
  createSeededRandom,
  seedFromLocation,
  randBetween,
  randInt,
  pickRandom,
} from "../seededRandom.js";

export const KNOWN_LOCATIONS = [
  { name: "New York", country: "USA" },
  { name: "London", country: "UK" },
  { name: "Mumbai", country: "India" },
  { name: "Delhi", country: "India" },
  { name: "Jaipur", country: "India" },
  { name: "Tokyo", country: "Japan" },
  { name: "Berlin", country: "Germany" },
  { name: "São Paulo", country: "Brazil" },
  { name: "Punjab", country: "India" },
  { name: "Iowa", country: "USA" },
  { name: "Nairobi", country: "Kenya" },
  { name: "Andalusia", country: "Spain" },
];

const CONDITIONS = [
  "Sunny", "Partly Cloudy", "Cloudy", "Overcast", "Light Rain", "Clear Skies",
  "Hazy", "Light Wind", "Rain Showers", "Foggy", "Misty", "Breezy",
];

const AQI_CATEGORIES = [
  { max: 50, label: "Good", color: "#10b981", tone: "good" },
  { max: 100, label: "Moderate", color: "#f59e0b", tone: "moderate" },
  { max: 150, label: "Unhealthy for Sensitive Groups", color: "#facc15", tone: "sensitive" },
  { max: 200, label: "Unhealthy", color: "#f97316", tone: "unhealthy" },
  { max: 300, label: "Very Unhealthy", color: "#f43f5e", tone: "very-unhealthy" },
  { max: Infinity, label: "Hazardous", color: "#dc2626", tone: "hazardous" },
];

export function getAqiCategoryInfo(aqi) {
  for (const cat of AQI_CATEGORIES) {
    if (aqi <= cat.max) return cat;
  }
  return AQI_CATEGORIES[AQI_CATEGORIES.length - 1];
}

const POLLUTANTS = [
  {
    key: "co", symbol: "CO", name: "Carbon Monoxide", unit: "ppb",
    safeMax: 35, base: [150, 900], type: "gas",
  },
  {
    key: "no2", symbol: "NO₂", name: "Nitrogen Dioxide", unit: "ppb",
    safeMax: 100, base: [10, 60], type: "gas",
  },
  {
    key: "so2", symbol: "SO₂", name: "Sulfur Dioxide", unit: "ppb",
    safeMax: 75, base: [4, 40], type: "gas",
  },
  {
    key: "pm25", symbol: "PM2.5", name: "Particulate Matter 2.5", unit: "µg/m³",
    safeMax: 35, base: [8, 70], type: "particulate",
  },
  {
    key: "pm10", symbol: "PM10", name: "Particulate Matter 10", unit: "µg/m³",
    safeMax: 75, base: [15, 120], type: "particulate",
  },
];

export { POLLUTANTS };

function makeLocationRand(location, salt = "") {
  const seed = seedFromLocation(location, salt);
  return createSeededRandom(seed);
}

/**
 * Full climate data bundle for a location (deterministic).
 */
export function generateClimateData(location) {
  const rand = makeLocationRand(location);

  const baseTemp = randBetween(rand, 4, 32);
  const humidity = randBetween(rand, 30, 88);
  const windSpeed = randBetween(rand, 2, 38);
  const windDegrees = randBetween(rand, 0, 360);
  const uvIndex = randBetween(rand, 0, 11);
  const precipitation = randBetween(rand, 0, 22);
  const rainProb = randBetween(rand, 0, 95);
  const visibility = randBetween(rand, 2, 24);
  const pressure = randBetween(rand, 985, 1035);
  const condition = pickRandom(rand, CONDITIONS);

  const aqiBase = randBetween(rand, 30, 250);
  const dominantPk = pickRandom(rand, ["pm25", "pm10", "no2", "so2", "co"]);
  const dominantIdx = POLLUTANTS.findIndex((p) => p.key === dominantPk);
  const pollutants = POLLUTANTS.map((p, i) => {
    const value = i === dominantIdx
      ? aqiBase * randBetween(rand, 0.8, 1.2)
      : randBetween(rand, p.base[0], p.base[1]);
    const pct = Math.min(100, (value / p.safeMax) * 100);
    return {
      key: p.key,
      symbol: p.symbol,
      name: p.name,
      unit: p.unit,
      value: Math.round(value * 10) / 10,
      severity: severityFromPercent(pct),
      percentage: Math.round(pct),
    };
  });

  const aqi = Math.min(500, Math.max(12, Math.round(
    pollutants.reduce((sum, p) => sum + p.percentage, 0) / pollutants.length + randBetween(rand, 0, 20)
  )));

  // sunrise/sunset based on location hash
  const sunrise = `${randInt(rand, 5, 7)}:${randInt(rand, 0, 59).toString().padStart(2, "0")} AM`;
  const sunset = `${randInt(rand, 5, 8)}:${randInt(rand, 0, 59).toString().padStart(2, "0")} PM`;

  const anomaly = Math.round(randBetween(rand, 0.3, 2.1) * 10) / 10;
  const anomalyDirection = rand() > 0.15 ? "+" : "-";

  const weather = {
    condition,
    temperature: Math.round(baseTemp * 10) / 10,
    feelsLike: Math.round((baseTemp + (humidity > 70 ? 2 : 0) - (windSpeed > 25 ? 2 : 0)) * 10) / 10,
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed * 10) / 10,
    windDirection: degToDir(windDegrees),
    windDegrees: Math.round(windDegrees),
    uvIndex: Math.round(uvIndex * 10) / 10,
    uvLabel: uvLabel(uvIndex),
    precipitation: Math.round(precipitation * 10) / 10,
    rainProbability: Math.round(rainProb),
    visibility: Math.round(visibility * 10) / 10,
    pressure: Math.round(pressure),
    sunrise,
    sunset,
  };

  const airQuality = {
    aqi,
    category: getAqiCategoryInfo(aqi).label,
    color: getAqiCategoryInfo(aqi).color,
    tone: getAqiCategoryInfo(aqi).tone,
    dominantPollutant: dominantPk.toUpperCase() === "PK" ? dominantPk : (POLLUTANTS.find((p) => p.key === dominantPk)?.symbol || dominantPk),
    pollutants,
  };

  const snapshot = {
    anomaly: `${anomalyDirection}${anomaly.toFixed(1)}°C`,
    direction: anomalyDirection === "+" ? "warming" : "cooling",
    anomalyValue: anomalyDirection === "+" ? anomaly : -anomaly,
    explanation: pickRandom(rand, [
      `Temperatures in ${location} are running above the 1901–2000 average, consistent with the regional warming trend observed over the past several decades.`,
      `Recent readings in ${location} exceed the long-term baseline, reflecting a persistent warming signal across the region.`,
      `Climate records for ${location} show a sustained upward drift relative to the 20th-century mean, influenced by broader atmospheric patterns.`,
    ]),
    context: pickRandom(rand, [
      "This anomaly is within the upper range of natural variability but trends upward over the last 30 years.",
      "Model projections indicate continued warming unless greenhouse gas emissions are reduced regionally.",
      "Coastal and low-lying areas in this region are particularly exposed to the compounding effects of warming.",
    ]),
  };

  return { weather, airQuality, snapshot, location };
}

export function degToDir(degrees) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const i = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16;
  return dirs[i];
}

export function uvLabel(uv) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

export function severityFromPercent(pct) {
  if (pct <= 40) return { label: "Low", color: "#10b981", tone: "low" };
  if (pct <= 60) return { label: "Moderate", color: "#f59e0b", tone: "moderate" };
  if (pct <= 75) return { label: "Elevated", color: "#f97316", tone: "unhealthy" };
  if (pct <= 90) return { label: "High", color: "#f43f5e", tone: "very-unhealthy" };
  return { label: "Severe", color: "#dc2626", tone: "hazardous" };
}

/**
 * Hourly trends — 24 points with realistic daily patterns.
 */
export function getHourlyTrends(location) {
  const rand = makeLocationRand(location, "hourly");
  const data = generateClimateData(location);
  const peakTemp = data.weather.temperature;
  const points = [];

  for (let h = 0; h < 24; h++) {
    // Natural day/night temp curve: coolest ~5am, warmest ~3pm
    const diurnal = Math.cos(((h - 8) / 24) * 2 * Math.PI);
    const temp = peakTemp + diurnal * randBetween(rand, 2, 5) + randBetween(rand, -0.7, 0.7);
    // Traffic peaks morning (7-9) and evening (17-19)
    let aqiBase = data.airQuality.aqi * (0.82 + randBetween(rand, 0, 0.18));
    if (h >= 7 && h <= 9) aqiBase *= randBetween(rand, 1.15, 1.35);
    if (h >= 17 && h <= 19) aqiBase *= randBetween(rand, 1.15, 1.3);
    if (h >= 23 || h <= 4) aqiBase *= randBetween(rand, 0.75, 0.9);
    const humidityH = Math.max(20, Math.min(95, data.weather.humidity - 15 * Math.cos(((h - 16) / 24) * 2 * Math.PI) + randBetween(rand, -4, 4)));
    points.push({
      hour: h,
      hourLabel: `${(h % 24) === 0 ? 12 : (h % 12) || 12} ${h < 12 ? "AM" : "PM"}`,
      temperature: Math.round(temp * 10) / 10,
      aqi: Math.max(0, Math.round(aqiBase)),
      humidity: Math.round(humidityH),
    });
  }
  return points;
}

/**
 * Weekly trends — 7 days.
 */
export function getWeeklyTrends(location) {
  const rand = makeLocationRand(location, "weekly");
  const data = generateClimateData(location);
  const days = ["Today", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((day) => ({
    day,
    temperature: Math.round((data.weather.temperature + randBetween(rand, -3, 3)) * 10) / 10,
    aqi: Math.max(0, Math.round(data.airQuality.aqi + randBetween(rand, -25, 25))),
    humidity: Math.max(20, Math.min(95, Math.round(data.weather.humidity + randBetween(rand, -10, 10)))),
  }));
}

/**
 * Localized soil intelligence modules (deterministic per location).
 */
export function getSoilIntelligence(location) {
  const rand = makeLocationRand(location, "soil");
  const isAgri = /iowa|punjab|nairobi|andalusia|são paulo|sao paulo/i.test(location);

  const moisture = randBetween(rand, 8, 45);
  const ph = randBetween(rand, 5.2, 8.4);
  const carbon = randBetween(rand, 0.8, 3.4);

  const sources = [
    {
      name: pickRandom(rand, ["Fertilizer blending unit", "Textile dye facility", "Metal foundry", "Tannery complex", "Agro-chemical plant", "Cold storage & food processor"]),
      type: pickRandom(rand, ["Industrial", "Agricultural runoff", "Manufacturing", "Chemical"]),
      distance: `${Math.round(randBetween(rand, 0.5, 25))} km`,
      contaminants: pickRandom(rand, ["nitrates, phosphates", "heavy metals, dyes", "VOCs, particulates", "pesticides, nitrates", "heavy metals, acids"]),
      risk: pickRandom(rand, ["Low", "Moderate", "High", "Severe"]),
    },
    {
      name: pickRandom(rand, ["Municipal landfill (legacy)", "Roadside runoff corridor", "Irrigation canal", "Former mining site", "Processing plant discharge"]),
      type: pickRandom(rand, ["Legacy waste", "Runoff", "Point discharge"]),
      distance: `${Math.round(randBetween(rand, 1, 40))} km`,
      contaminants: pickRandom(rand, ["leachate, heavy metals", "sediment, nitrates", "industrial salts"]),
      risk: pickRandom(rand, ["Low", "Moderate", "High"]),
    },
    {
      name: pickRandom(rand, ["Pesticide application zones", "Intensive irrigation blocks", "Industrial buffer farmland"]),
      type: "Agricultural",
      distance: `${Math.round(randBetween(rand, 0.3, 12))} km`,
      contaminants: pickRandom(rand, ["organophosphates", "glyphosate residues", "chlorpyrifos"]),
      risk: pickRandom(rand, ["Low", "Moderate", "High"]),
    },
  ];

  const heavyMetals = [
    { metal: "Lead", level: randBetween(rand, 0, 30), status: randBetween(rand, 0, 1) > 0.6 ? "Elevated" : "Normal" },
    { metal: "Arsenic", level: randBetween(rand, 0, 22), status: randBetween(rand, 0, 1) > 0.5 ? "Elevated" : "Normal" },
    { metal: "Cadmium", level: randBetween(rand, 0, 15), status: randBetween(rand, 0, 1) > 0.5 ? "Elevated" : "Normal" },
    { metal: "Mercury", level: randBetween(rand, 0, 12), status: randBetween(rand, 0, 1) > 0.7 ? "Elevated" : "Normal" },
  ];

  const rotations = [
    {
      crops: pickRandom(rand, ["Maize → Soybean → Wheat", "Rice → Mustard → Pulses", "Soybean → Winter Wheat → Cover Crops"]),
      carbonBenefits: pickRandom(rand, ["+0.4 t CO₂e/ha/yr", "+0.6 t CO₂e/ha/yr", "+0.3 t CO₂e/ha/yr"]),
      pestBreak: pickRandom(rand, ["Breaks corn rootworm cycle", "Disrupts soil-borne pathogens", "Reduces weed seed bank"]),
    },
  ];

  const resilience = isAgri
    ? {
        drought: [
          "Shift to drought-tolerant cultivars for the coming season.",
          "Adopt drip or deficit irrigation to stretch water reserves.",
          "Increase soil organic matter through cover crops to retain moisture.",
          "Schedule planting earlier to avoid peak heat stress.",
        ],
        rain: [
          "Install field drainage channels to prevent waterlogging.",
          "Use no-till practices to reduce soil erosion on slopes.",
          "Buffer planting of runoff-sensitive crops from waterways.",
          "Implement swales to capture and infiltrate excess rainfall.",
        ],
      }
    : {
        drought: [
          "Rely on mulched, organic soils that resist rapid drying.",
          "Consider rain-barrel and grey-water storage for gardens.",
          "Group drought-tolerant native species together.",
          "Water deeply and less frequently to encourage root depth.",
        ],
        rain: [
          "Ensure gutters and downspouts drain away from foundations.",
          "Add permeable surfaces to reduce runoff and pooling.",
          "Establish rain gardens in low-lying areas.",
          "Maintain drainage ditches and remove blockages.",
        ],
      };

  return {
    location,
    isAgriRegion: isAgri,
    indicators: {
      moisture: { value: Math.round(moisture * 10) / 10, unit: "%", status: moisture < 15 ? "Dry" : moisture < 30 ? "Optimal" : "Saturated" },
      ph: { value: Math.round(ph * 10) / 10, unit: "", status: ph < 6 ? "Acidic" : ph < 7.5 ? "Neutral" : "Alkaline" },
      carbon: { value: Math.round(carbon * 10) / 10, unit: "%", status: carbon < 1.5 ? "Low" : carbon < 2.5 ? "Moderate" : "Good" },
    },
    module1: {
      sources,
      heavyMetals,
      pesticideHistory: pickRandom(rand, [
        "Documented use of organophosphate and pyrethroid pesticides over the past decade.",
        "Moderate pesticide application history with reduced-use programs in recent years.",
        "Limited pesticide use; predominantly organic and integrated pest management practices.",
      ]),
      summary: pickRandom(rand, [
        "Root-zone contamination risk is elevated near point sources; crop-safe in outer zones.",
        "Pollution risk is localized to industrial buffers; adopt dilution practices.",
        "Overall risk is low-to-moderate with seasonal spikes during irrigation season.",
      ]),
    },
    module2: {
      rotations,
      coverCrops: {
        species: pickRandom(rand, ["Crimson clover, rye, vetch", "Cowpea, lablab, millet", "Oats, clover, radish"]),
        window: pickRandom(rand, ["Sep–Nov", "Apr–Jun", "Oct–Dec"]),
        benefits: pickRandom(rand, ["Nitrogen fixation, erosion control", "Soil armor, weed suppression", "Added soil carbon, plant N"]),
      },
      composting: {
        materials: pickRandom(rand, ["Crop residues, manure, kitchen waste", "Straw, poultry litter, green trimmings"]),
        applicationRate: pickRandom(rand, ["10–15 t/ha", "5–8 t/ha", "12–18 t/ha"]),
        carbonImpact: pickRandom(rand, ["+0.5 t CO₂e/ha/yr", "+0.8 t CO₂e/ha/yr"]),
      },
    },
    module3: [
      {
        method: "Mycoremediation",
        mechanism: "Fungi break down hydrocarbons and some pesticides via extracellular enzymes.",
        bestFor: "Hydrocarbon and pesticide hotspots",
        material: "Oyster, turkey-tail, and white-rot fungi",
        timeline: "2–4 seasons",
        steps: "Inoculate contaminated soil; maintain moisture; monitor degradation.",
      },
      {
        method: "Phytoremediation",
        mechanism: "Plants absorb and accumulate heavy metals or degrade organics in their tissues.",
        bestFor: "Trace heavy metals (Pb, As, Cd)",
        material: "Indian mustard, sunflower, poplar, willow",
        timeline: "2–5 years",
        steps: "Sow accumulator species; harvest and dispose of biomass safely; repeat.",
      },
      {
        method: "Biochar",
        mechanism: "Pyrolyzed organic matter sorbs heavy metals and improves soil structure.",
        bestFor: "Heavy metal sorption and carbon sequestration",
        material: "Wood, crop-residue char",
        timeline: "Immediate + ongoing",
        steps: "Apply 5–20 t/ha; incorporate into topsoil; reapply per testing.",
      },
      {
        method: "Vermiremediation",
        mechanism: "Earthworms bioaccumulate metals and accelerate organic decomposition.",
        bestFor: "Organic pollutants and moderate metal loads",
        material: "Eisenia fetida (red wiggler)",
        timeline: "1–3 seasons",
        steps: "Establish vermicompost rows; manage moisture; harvest casts.",
      },
    ],
    resilience,
  };
}

/**
 * Government national scorecards (deterministic, stable).
 */
export function getCountryScorecards() {
  const countries = [
    { name: "Norway", flag: "🇳🇴", score: 91, status: "On Track", target: "55% cut by 2030", notes: "Strong carbon tax and EV adoption; low per-capita sectoral gaps in buildings." },
    { name: "European Union", flag: "🇪🇺", score: 78, status: "On Track", target: "55% net cut by 2030", notes: "ETS and Fit-for-55 driving progress; heavy industry transition lagging." },
    { name: "United Kingdom", flag: "🇬🇧", score: 74, status: "On Track", target: "68% cut by 2030", notes: "Sharp coal phase-out; transport and housing sectors need acceleration." },
    { name: "United States", flag: "🇺🇸", score: 61, status: "Lagging", target: "50-52% by 2030 vs 2005", notes: "IRA incentives strong; state-level divergence and grid constraints limit pace." },
    { name: "China", flag: "🇨🇳", score: 55, status: "Lagging", target: "peak CO₂ before 2030", notes: "Rapid renewables build; coal fleet still expanding in some regions." },
    { name: "India", flag: "🇮🇳", score: 58, status: "Lagging", target: "45% emissions intensity cut by 2030", notes: "Renewables scaling fast; absolute emissions still rising with growth." },
    { name: "Russia", flag: "🇷🇺", score: 34, status: "Non-Compliant", target: "35% relative by 2030", notes: "Fossil-dependent economy; limited verifiable domestic mitigation." },
    { name: "Saudi Arabia", flag: "🇸🇦", score: 38, status: "Non-Compliant", target: "net zero by 2060", notes: "Methane and refinery emissions high; hydrogen ambitions unverified at scale." },
  ];
  return countries;
}

/**
 * Active local policies for a location (deterministic).
 */
export function getLocalPolicies(location) {
  const rand = makeLocationRand(location, "policies");
  const lc = location.toLowerCase();
  const name = typeof location === "string" ? location : "region";

  const common = [
    {
      name: `${name} Building Emissions Standard`,
      jurisdiction: `${name} city authority`,
      category: "Buildings",
      status: pickRandom(rand, ["Enforced", "On Track", "Pending"]),
      year: randInt(rand, 2021, 2026),
      summary: "Caps whole-building emissions with declining limits to drive efficiency retrofits.",
      scope: "Commercial and large residential buildings over set size thresholds.",
      target: "30–40% reduction by 2030",
      penalties: "Fines per tonne of excess emissions; compliance reporting required.",
    },
    {
      name: `${name} Clean Transport Zone`,
      jurisdiction: `${name} metropolitan region`,
      category: "Transport",
      status: pickRandom(rand, ["Enforced", "On Track", "Advisory"]),
      year: randInt(rand, 2019, 2025),
      summary: "Restricts high-emission vehicles in urban core to cut NO₂ and PM.",
      scope: "Central district; phased expansion planned.",
      target: "Cut traffic NO₂ by 20% within 5 years",
      penalties: "Daily charges for non-compliant vehicles.",
    },
    {
      name: `Renewable Procurement Mandate for ${name}`,
      jurisdiction: `${name} government`,
      category: "Energy",
      status: pickRandom(rand, ["On Track", "Pending"]),
      year: randInt(rand, 2022, 2026),
      summary: "Public agencies procure increasing shares of clean generation.",
      scope: "Public buildings and municipal fleets.",
      target: "100% clean electricity for public operations by 2035",
      penalties: "Reporting and audit obligations.",
    },
  ];
  return common;
}

/**
 * Industrial accountability measures (stable, real-world regulatory framing).
 */
export function getIndustrialAccountability() {
  return [
    {
      name: "EU Industrial Emissions Directive",
      target: "Industrial installations",
      jurisdiction: "European Union",
      status: "Enforced",
      summary: "Requires integrated permits based on Best Available Techniques (BAT) and emission limit values for large agro-industrial and manufacturing plants.",
      outcome: "Ongoing enforcement; periodic BAT reference document reviews.",
    },
    {
      name: "EPA Refinery Enforcement Initiative",
      target: "Petroleum refineries",
      jurisdiction: "United States (federal)",
      status: "Enforced",
      summary: "MLP: example of enforcement under the Clean Air Act; legally binding consent decrees require flaring reductions and enhanced monitoring.",
      outcome: "Settlements have required technology upgrades and improved compliance reporting.",
    },
    {
      name: "China Continuous Emissions Monitoring (CEMS)",
      target: "Large stationary emitters",
      jurisdiction: "China",
      status: "Enforced",
      summary: "National requirement for continuous emission monitoring systems at key industrial sources, linked to compliance data platforms.",
      outcome: "Broad installation; data quality and verification challenges persist.",
    },
    {
      name: "EU Carbon Border Adjustment Mechanism (CBAM)",
      target: "Imports of carbon-intensive goods",
      jurisdiction: "European Union",
      status: "Enforced (transitional)",
      summary: "CBAM applies carbon pricing to imported cement, iron, steel, aluminium, fertilisers, electricity and hydrogen in line with EU ETS.",
      outcome: "Transitional reporting phase; definitive regime from 2026 with certificate purchase.",
    },
    {
      name: "Convention on Long-range Transboundary Air Pollution",
      target: "Transboundary air pollutants",
      jurisdiction: "UNECE region",
      status: "Enforced",
      summary: "International framework with protocol-specific emission reduction commitments for SO₂, NOₓ, VOCs and ammonia.",
      outcome: "Regional emission ceilings in force; periodic review cycles.",
    },
  ];
}
