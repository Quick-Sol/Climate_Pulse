/**
 * ClimaPulse — Water Detail page init
 */

import { getWaterIndicators, waterStatusColor } from "./water.js";
import { createSeededRandom, seedFromLocation, pickRandom } from "../seededRandom.js";
import { iconMarkup } from "../navigation.js";

const WATER_INFO = {
  ph: {
    label: "Water pH", unit: "", icon: "scale",
    explanation: "Water pH indicates the acidity or alkalinity of a water body. Most freshwater aquatic life thrives in a pH range of roughly 6.5–8.5. Deviations affect nutrient availability, metal solubility, and the physiology of fish, invertebrates, and plants.",
    impacts: [
      { icon: "activity", title: "Aquatic Life", text: "Extreme pH stresses fish gills and influences reproduction; many species perish outside their tolerance band." },
      { icon: "waves", title: "Water Chemistry", text: "pH controls the toxicity of ammonia and the solubility of heavy metals such as aluminum and copper." },
      { icon: "droplets", title: "Drinking Water", text: "pH outside 6.5–8.5 can corrode pipes, leach metals, and affect disinfection efficiency." },
      { icon: "leaf-icon", title: "Ecosystems", text: "Alkalinity buffers runoff; acidification from deposition degrades lakes and streams." },
    ],
    precautions: [
      "Test drinking water pH regularly, especially from private wells or corroding plumbing.",
      "Neutralize acidic water with appropriate treatment before human or livestock use.",
      "Avoid introducing acidic or alkaline discharges into local waterways.",
      "Monitor ponds and irrigation sources for pH shifts after heavy rain or runoff.",
      "Contact local authorities if water pH drifts outside safe range.",
    ],
  },
  do: {
    label: "Dissolved Oxygen", unit: "mg/L", icon: "activity",
    explanation: "Dissolved oxygen (DO) is the amount of gaseous oxygen dissolved in water, essential for fish and aerobic organisms. DO is replenished by aeration and photosynthesis and depleted by decomposition, warm temperatures, and organic pollution.",
    impacts: [
      { icon: "activity", title: "Fish Health", text: "Most fish need DO above 5 mg/L; low DO causes stress, suffocation, and fish kills." },
      { icon: "waves", title: "Nutrient Cycling", text: "Low oxygen shifts decomposition to anaerobic pathways, releasing odors and harmful byproducts." },
      { icon: "leaf-icon", title: "Aquatic Ecosystems", text: "Dissolved-oxygen minima create 'dead zones' where aerobic life cannot persist." },
      { icon: "dollar", title: "Economic Impact", text: "Low DO harms fisheries, aquaculture, and recreational water value." },
    ],
    precautions: [
      "Reduce nutrient runoff (fertilizers, waste) that fuels oxygen-depleting algal blooms.",
      "Avoid dumping organic matter or wastewater into water bodies.",
      "Maintain aeration in ponds and aquaculture systems during warm periods.",
      "Monitor DO in morning hours when levels are lowest.",
      "Report algal blooms or fish kills to environmental authorities promptly.",
    ],
  },
  nitrate: {
    label: "Nitrate", unit: "mg/L", icon: "droplets",
    explanation: "Nitrate is a nutrient primarily entering water from agricultural fertilizer, animal waste, and sewage. While essential in small amounts, elevated nitrate harms infant health (methemoglobinemia) and drives eutrophication and algal blooms in receiving waters.",
    impacts: [
      { icon: "heart", title: "Health Impact", text: "High nitrate in drinking water (above 10 mg/L) is dangerous for infants and can impair oxygen transport." },
      { icon: "leaf-icon", title: "Eutrophication", text: "Excess nitrate fuels algal blooms that deplete oxygen and disrupt aquatic food webs." },
      { icon: "waves", title: "Water Supply", text: "Nitrate contamination burdens treatment plants and can force costly well remediation." },
      { icon: "dollar", title: "Economic Impact", text: "Cleanup, treatment, and lost agricultural water rights impose significant costs." },
    ],
    precautions: [
      "Test well and household water for nitrate, especially near farms.",
      "Use certified water treatment (reverse osmosis, ion exchange) if nitrate is elevated.",
      "Follow safe drinking water guidance for infants and pregnant individuals.",
      "Practice nutrient stewardship — apply fertilizer at correct rates and timing.",
      "Establish vegetative buffers to intercept runoff before it reaches water bodies.",
    ],
  },
};

export default function initWaterDetail() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("water");
  // map query key to info key
  const infoKey = { ph: "ph", do: "do", nitrate: "nitrate" }[key];
  const info = infoKey ? WATER_INFO[infoKey] : null;
  const container = document.getElementById("water-detail-root");

  if (!info) {
    container.innerHTML = `
      <div class="text-center py-20">
        <p class="text-4xl mb-3">💧</p>
        <h2 class="text-xl font-bold text-slate-800 mb-2">Water indicator not found</h2>
        <a class="btn btn-primary" href="water.html">Back to Water Intelligence</a>
      </div>`;
    return;
  }

  const location = "New York";
  const indicators = getWaterIndicators(location);
  const indicator = indicators.find((i) => i.key === infoKey);
  const rand = createSeededRandom(seedFromLocation(location, "water-detail-" + infoKey));
  const stColor = waterStatusColor(indicator.status);

  const policies = [
    { name: pickRandom(rand, ["Clean Water Act Discharge Permits", "Nitrate Reduction Program", "Watershed Protection Rules"]), region: pickRandom(rand, ["Federal EPA", "State Water Board", "Regional Authority"]), status: pickRandom(rand, ["Enforced", "On Track"]), summary: "Regulates point-source discharges and sets water quality standards for nutrients and oxygen." },
    { name: "Drinking Water Standard", region: "National/Federal", status: "Enforced", summary: "Enforces maximum contaminant levels, including the 10 mg/L nitrate standard, for public supplies." },
  ];
  const subsidies = [
    { name: pickRandom(rand, ["Water Efficiency Rebate", "Well Testing Grant", "Nutrient Management Support"]), region: pickRandom(rand, ["State", "Municipal"]), value: pickRandom(rand, ["Up to $1,500", "Free testing", "Up to $3,000"]), description: "Financial support for water testing, treatment, and runoff-reduction practices." },
  ];

  container.innerHTML = `
    <div class="page-hero rounded-3xl p-8 bg-white border border-slate-200 relative mb-6">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="w-20 h-20 rounded-2xl hero-card-gradient-sky flex items-center justify-center text-sky-700">${iconMarkup(info.icon, 40)}</div>
          <div>
            <p class="text-sm font-semibold text-sky-600">Water Intelligence</p>
            <h1 class="text-3xl font-extrabold text-slate-900">${info.label}</h1>
            <span class="status-pill mt-1" style="background:${stColor}1c;color:${stColor}"><span class="dot" style="background:${stColor}"></span>${indicator.status}</span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm text-slate-500">Current Level</p>
          <div class="flex items-baseline gap-1">
            <span class="text-5xl font-extrabold text-slate-900">${indicator.value}</span>
            <span class="text-slate-500">${indicator.unit}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">${indicator.range}</p>
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
          <span class="w-10 h-10 rounded-xl flex items-center justify-center text-sky-600 hero-card-gradient-sky mb-3">${iconMarkup(imp.icon, 20)}</span>
          <h4 class="font-bold text-slate-800 mb-1.5">${imp.title}</h4>
          <p class="text-sm text-slate-500 leading-relaxed">${imp.text}</p>
        </div>`).join("")}
    </div>

    <h2 class="text-xl font-bold text-slate-900 mb-4">Personal Precautions</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      ${info.precautions.map((p, i) => `
        <div class="clima-card p-4 flex gap-3 anim-slide-up anim-delay-${i + 1}">
          <span class="w-6 h-6 shrink-0 rounded-full text-sky-700 bg-sky-50 text-xs font-bold flex items-center justify-center">${i + 1}</span>
          <p class="text-sm text-slate-600">${p}</p>
        </div>`).join("")}
    </div>

    <h2 class="text-xl font-bold text-slate-900 mb-4">Policy Tracker & Subsidies</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div>
        <h3 class="font-bold text-slate-800 mb-3">Policies</h3>
        <div class="space-y-3">
          ${policies.map((p) => `
            <div class="clima-card p-4">
              <p class="font-bold text-slate-800 text-sm">${p.name}</p>
              <div class="flex items-center justify-between mt-0.5">
                <p class="text-xs text-slate-400">${p.region}</p>
                <span class="status-pill bg-emerald-50 text-emerald-600"><span class="dot" style="background:#10b981"></span>${p.status}</span>
              </div>
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
                <span class="text-sky-600 font-extrabold text-sm">${s.value}</span>
              </div>
              <p class="text-xs text-slate-400">${s.region}</p>
              <p class="text-sm text-slate-500 mt-1">${s.description}</p>
            </div>`).join("")}
        </div>
      </div>
    </div>
  `;
}
