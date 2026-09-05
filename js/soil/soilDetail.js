/**
 * ClimaPulse — Soil Detail page init
 */

import { getSoilIntelligence } from "../services/mockData.js";
import { createSeededRandom, seedFromLocation, pickRandom } from "../seededRandom.js";
import { iconMarkup } from "../navigation.js";

const SOIL_INFO = {
  moisture: {
    label: "Soil Moisture", unit: "%", icon: "droplet",
    explanation: "Soil moisture measures the water present in the soil profile available to plants. It fluctuates with rainfall, irrigation, evapotranspiration, and drainage. Optimal moisture supports germination and growth, while deficits cause drought stress and excess leads to waterlogging and anoxia.",
    impacts: [
      { icon: "sprout", title: "Crop Yield", text: "Insufficient or excess moisture directly limits nutrient uptake, root development, and final yield." },
      { icon: "waves", title: "Hydrology", text: "Moisture balance governs runoff, groundwater recharge, and erosion susceptibility." },
      { icon: "leaf-icon", title: "Microbiology", text: "Soil organisms require moisture; extremes suppress decomposition and nutrient cycling." },
      { icon: "dollar", title: "Farm Economics", text: "Irrigation costs and drought losses are the largest moisture-driven financial risks." },
    ],
    actions: [
      "Adjust irrigation scheduling based on soil moisture readings and evapotranspiration.",
      "Mulch to reduce evaporation and maintain even surface moisture.",
      "Use drip or deficit irrigation to stretch limited water supplies.",
      "Plant drought-tolerant cultivars in moisture-limiting zones.",
      "Install drainage in low areas to avoid waterlogging during wet spells.",
    ],
  },
  ph: {
    label: "Soil pH", unit: "", icon: "scale",
    explanation: "Soil pH measures the acidity or alkalinity of the soil solution on a 0–14 scale, with 6–7 generally optimal for most crops. pH controls the solubility and availability of nutrients and the activity of soil microbes. Extreme values cause nutrient tie-up and toxicity.",
    impacts: [
      { icon: "leaf-icon", title: "Nutrient Availability", text: "Iron, phosphorus, and many micronutrients become less available in alkaline soils; aluminum becomes toxic in very acidic soils." },
      { icon: "sprout", title: "Crop Suitability", text: "Each crop has an optimal pH range; mismatched pH reduces vigor and yield." },
      { icon: "activity", title: "Microbial Activity", text: "Bacteria and fungi thrive within specific pH bands affecting nitrogen fixation and decomposition." },
      { icon: "dollar", title: "Amendment Cost", text: "Lime or sulfur applications to correct pH add recurring input costs." },
    ],
    actions: [
      "Apply agricultural lime to raise pH of acidic soils, following soil-test guidance.",
      "Use sulfur or acidifying amendments to lower excessively alkaline pH.",
      "Choose crop varieties adapted to the native soil pH where practical.",
      "Retest soil pH every 2–3 years to guide amendments.",
      "Incorporate organic matter which buffers and stabilizes pH over time.",
    ],
  },
  carbon: {
    label: "Soil Organic Carbon", unit: "%", icon: "leaf-icon",
    explanation: "Soil organic carbon is the carbon stored in soil organic matter. It is central to fertility, water retention, soil structure, and the global carbon cycle. Increasing it both improves agricultural productivity and sequesters atmospheric CO₂, supporting climate mitigation.",
    impacts: [
      { icon: "globe", title: "Climate Mitigation", text: "Soils are a major carbon sink; building organic carbon removes CO₂ from the atmosphere." },
      { icon: "droplets", title: "Water Retention", text: "Higher organic carbon improves water-holding capacity and drought resilience." },
      { icon: "leaf-icon", title: "Fertility", text: "Organic carbon releases nutrients slowly and supports beneficial soil life." },
      { icon: "dollar", title: "Long-term Value", text: "Carbon-rich soils sustain yields with fewer external inputs, boosting farm economics." },
    ],
    actions: [
      "Adopt no-till or reduced-till to slow carbon loss from cultivation.",
      "Grow cover crops year-round to add residues and protect soil.",
      "Apply compost and manure to add stable organic carbon.",
      "Rotate crops and retain crop residues to build organic matter.",
      "Consider carbon-market programs that reward soil carbon sequestration.",
    ],
  },
};

export default function initSoilDetail() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("soil");
  const info = SOIL_INFO[key];
  const container = document.getElementById("soil-detail-root");

  if (!info) {
    container.innerHTML = `
      <div class="text-center py-20">
        <p class="text-4xl mb-3">🌱</p>
        <h2 class="text-xl font-bold text-slate-800 mb-2">Soil indicator not found</h2>
        <a class="btn btn-primary" href="soil.html">Back to Soil Intelligence</a>
      </div>`;
    return;
  }

  const location = "Iowa"; // deterministic base region for detail demo
  const base = getSoilIntelligence(location);
  const indicator = base.indicators[key];
  const rand = createSeededRandom(seedFromLocation(location, "soil-detail-" + key));

  const stColor = statusColor(indicator.status);

  const policies = [
    { name: pickRandom(rand, ["Healthy Soils Initiative", "Organic Carbon Program", "Conservation Stewardship"]), region: pickRandom(rand, ["State Agriculture Dept", "Federal Program", "Regional Authority"]), status: pickRandom(rand, ["Enforced", "On Track", "Pending"]), summary: "Incentivizes practices that build soil organic carbon and improve soil health." },
    { name: "Water Quality Buffer Rules", region: "Municipal/Regional", status: "Enforced", summary: "Requires vegetative buffers to reduce nutrient and sediment runoff into waterways." },
  ];
  const subsidies = [
    { name: pickRandom(rand, ["Carbon Farming Rebate", "Cover Crop Assistance", "Soil Health Grant"]), region: pickRandom(rand, ["Federal", "State" ]), value: pickRandom(rand, ["Up to $30/acre", "Up to $5,000", "Up to €3,000"]), description: "Financial support for practices that improve soil health and carbon sequestration." },
  ];

  container.innerHTML = `
    <div class="page-hero rounded-3xl p-8 bg-white border border-slate-200 relative mb-6">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="w-20 h-20 rounded-2xl hero-card-gradient-sky flex items-center justify-center text-emerald-700">${iconMarkup(info.icon, 40)}</div>
          <div>
            <p class="text-sm font-semibold text-emerald-600">Soil Intelligence</p>
            <h1 class="text-3xl font-extrabold text-slate-900">${info.label}</h1>
            <span class="status-pill mt-1" style="background:${stColor}1c;color:${stColor}"><span class="dot" style="background:${stColor}"></span>${indicator.status} in ${location}</span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm text-slate-500">Current Value</p>
          <div class="flex items-baseline gap-1">
            <span class="text-5xl font-extrabold text-slate-900">${indicator.value}</span>
            <span class="text-slate-500">${indicator.unit}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="clima-card p-6 mb-6">
      <h3 class="section-title mb-3">Scientific Explanation</h3>
      <p class="text-sm text-slate-600 leading-relaxed">${info.explanation}</p>
    </div>

    <h2 class="text-xl font-bold text-slate-900 mb-4">Impact Engine</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      ${info.impacts.map((imp, i) => `
        <div class="clima-card p-5 anim-slide-up anim-delay-${i + 1}">
          <span class="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 hero-card-gradient-sky mb-3">${iconMarkup(imp.icon, 20)}</span>
          <h4 class="font-bold text-slate-800 mb-1.5">${imp.title}</h4>
          <p class="text-sm text-slate-500 leading-relaxed">${imp.text}</p>
        </div>`).join("")}
    </div>

    <h2 class="text-xl font-bold text-slate-900 mb-4">Farmer Actions</h2>
    <div class="clima-card p-6 mb-8">
      <ol class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${info.actions.map((a, i) => `
          <li class="flex gap-3 border border-slate-100 rounded-xl p-3.5">
            <span class="w-6 h-6 shrink-0 rounded-full text-emerald-700 bg-emerald-50 text-xs font-bold flex items-center justify-center">${i + 1}</span>
            <span class="text-sm text-slate-600">${a}</span>
          </li>`).join("")}
      </ol>
    </div>

    <h2 class="text-xl font-bold text-slate-900 mb-4">Policy Tracker & Subsidies</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div>
        <h3 class="font-bold text-slate-800 mb-3">Policies</h3>
        <div class="space-y-3">
          ${policies.map((p) => `
            <div class="clima-card p-4">
              <p class="font-bold text-slate-800 text-sm">${p.name}</p>
              <p class="text-xs text-slate-400">${p.region}</p>
              <p class="text-sm text-slate-500 mt-1">${p.summary}</p>
            </div>`).join("")}
        </div>
      </div>
      <div>
        <h3 class="font-bold text-slate-800 mb-3">Subsidies</h3>
        <div class="space-y-3">
          ${subsidies.map((s) => `
            <div class="clima-card p-4">
              <div class="flex items-center justify-between">
                <p class="font-bold text-slate-800 text-sm">${s.name}</p>
                <span class="text-emerald-600 font-extrabold text-sm">${s.value}</span>
              </div>
              <p class="text-xs text-slate-400">${s.region}</p>
              <p class="text-sm text-slate-500 mt-1">${s.description}</p>
            </div>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function statusColor(status) {
  const map = { Dry: "#f97316", Optimal: "#10b981", Saturated: "#0284c7", Acidic: "#f97316", Neutral: "#10b981", Alkaline: "#0284c7", Low: "#d97706", Moderate: "#f59e0b", Good: "#10b981" };
  return map[status] || "#64748b";
}
