/**
 * ClimaPulse — Gas Detail page init
 */

import { getCurrent as getAQI } from "../services/airQualityService.js";
import { createSeededRandom, seedFromLocation, pickRandom } from "../seededRandom.js";
import { iconMarkup } from "../navigation.js";
import { toast } from "../toast.js";

const GAS_INFO = {
  co: {
    symbol: "CO", name: "Carbon Monoxide", unit: "ppb",
    category: "Combustion Byproduct",
    explanation: "Carbon monoxide is a colorless, odorless gas produced by incomplete combustion of fossil fuels, vehicle engines, and industrial processes. It binds to hemoglobin more readily than oxygen, reducing oxygen delivery to the body's tissues.",
    impacts: [
      { icon: "heart", title: "Health Impact", text: "Exposure impairs oxygen transport, aggravating cardiovascular and respiratory conditions. High levels cause headaches, dizziness, and impaired cognition." },
      { icon: "globe", title: "Atmospheric Impact", text: "CO reacts with hydroxyl radicals to form CO₂ and ozone precursors, reducing the atmosphere's self-cleaning capacity." },
      { icon: "leaf-icon", title: "Ecosystem Impact", text: "Elevated CO can suppress plant respiration and photosynthesis at high concentrations near source regions." },
      { icon: "dollar", title: "Economic/Social Impact", text: "Time lost to illness, healthcare costs, and reduced productivity rise with sustained exposure events." },
    ],
  },
  co2: {
    symbol: "CO₂", name: "Carbon Dioxide", unit: "ppm",
    category: "Greenhouse Gas",
    explanation: "Carbon dioxide is the principal long-lived greenhouse gas, released by fossil fuel combustion, deforestation, and industrial processes. It is the dominant driver of the enhanced greenhouse effect and global warming.",
    impacts: [
      { icon: "globe", title: "Atmospheric Impact", text: "CO₂ traps outgoing infrared radiation, warming the planet. Atmospheric concentration continues to rise, driving temperature anomalies." },
      { icon: "leaf-icon", title: "Ecosystem Impact", text: "Elevated CO₂ can stimulate plant growth (CO₂ fertilization) but also drives ocean acidification and shifts in species ranges." },
      { icon: "waves", title: "Ocean Impact", text: "Absorbed CO₂ lowers seawater pH, threatening calcifying marine organisms and coral reef ecosystems." },
      { icon: "dollar", title: "Economic/Social Impact", text: "Climate-related damages—sea-level rise, heat extremes, and weather volatility—impose growing economic costs." },
    ],
  },
  no2: {
    symbol: "NO₂", name: "Nitrogen Dioxide", unit: "ppb",
    category: "Traffic & Combustion",
    explanation: "Nitrogen dioxide forms during high-temperature combustion in vehicles, power plants, and industry. It is a respiratory irritant and a key precursor to ground-level ozone and particulate formation.",
    impacts: [
      { icon: "heart", title: "Health Impact", text: "Short-term exposure inflames airways, worsens asthma, and reduces lung function, especially in children and the elderly." },
      { icon: "globe", title: "Atmospheric Impact", text: "NO₂ drives photochemical smog and ozone formation and contributes to acid deposition and eutrophication." },
      { icon: "leaf-icon", title: "Ecosystem Impact", text: "Nitrogen deposition alters soil and water chemistry, shifting plant communities and harming sensitive ecosystems." },
      { icon: "dollar", title: "Economic/Social Impact", text: "Healthcare costs and lost days from respiratory illness increase near high-traffic corridors." },
    ],
  },
  so2: {
    symbol: "SO₂", name: "Sulfur Dioxide", unit: "ppb",
    category: "Industrial / Fossil Fuel",
    explanation: "Sulfur dioxide is released primarily by burning sulfur-containing fossil fuels—coal and oil—and by industrial smelting. It forms sulfuric acid and sulfate aerosols in the atmosphere.",
    impacts: [
      { icon: "heart", title: "Health Impact", text: "SO₂ irritates the respiratory system, causing wheezing, chest tightness, and aggravated asthma, especially among sensitive groups." },
      { icon: "globe", title: "Atmospheric Impact", text: "Sulfate aerosols scatter sunlight (cooling effects) and form acid rain that damages buildings and ecosystems." },
      { icon: "leaf-icon", title: "Ecosystem Impact", text: "Acid deposition acidifies soils and lakes, mobilizing heavy metals and harming forests and aquatic life." },
      { icon: "dollar", title: "Economic/Social Impact", text: "Acid rain damages infrastructure and crops; mitigation adds compliance and retrofit costs for industry." },
    ],
  },
  pm25: {
    symbol: "PM2.5", name: "Particulate Matter 2.5", unit: "µg/m³",
    category: "Particulate Matter",
    explanation: "PM2.5 refers to fine airborne particles under 2.5 micrometers that penetrate deep into the lungs and bloodstream. Sources include combustion, industry, dust, and secondary aerosol formation.",
    impacts: [
      { icon: "heart", title: "Health Impact", text: "Fine particles are linked to cardiovascular and respiratory disease, reduced lung function, and premature mortality." },
      { icon: "globe", title: "Atmospheric Impact", text: "PM2.5 affects visibility (haze), cloud formation, and regional and global radiation balance." },
      { icon: "leaf-icon", title: "Ecosystem Impact", text: "Deposited particles alter soil and water chemistry and can harm sensitive vegetation." },
      { icon: "dollar", title: "Economic/Social Impact", text: "PM2.5 pollution imposes large productivity and healthcare burdens and drives property-value differentials." },
    ],
  },
  pm10: {
    symbol: "PM10", name: "Particulate Matter 10", unit: "µg/m³",
    category: "Particulate Matter",
    explanation: "PM10 includes coarse and fine inhalable particles up to 10 micrometers, from road dust, construction, agriculture, and combustion. They are linked to respiratory irritation and cardiovascular effects.",
    impacts: [
      { icon: "heart", title: "Health Impact", text: "Coarse particles aggravate asthma, cause coughing and throat irritation, and worsen respiratory conditions." },
      { icon: "globe", title: "Atmospheric Impact", text: "PM10 contributes to haze and reduced visibility and interacts with cloud and precipitation processes." },
      { icon: "leaf-icon", title: "Ecosystem Impact", text: "Deposition can smother vegetation and alter soil nutrient and pH balance." },
      { icon: "dollar", title: "Economic/Social Impact", text: "Cleaning costs, health burdens, and degraded tourism and outdoor sectors follow high PM events." },
    ],
  },
};

const STATUS_STYLES = {
  Enforced: { color: "#059669", bg: "#ecfdf5" },
  "On Track": { color: "#059669", bg: "#ecfdf5" },
  Pending: { color: "#d97706", bg: "#fffbeb" },
  Lagging: { color: "#f97316", bg: "#fff7ed" },
  Advisory: { color: "#0284c7", bg: "#f0f9ff" },
};

export default function initGasDetail() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("gas");
  const info = GAS_INFO[key];
  const container = document.getElementById("gas-detail-root");

  if (!info) {
    container.innerHTML = `
      <div class="text-center py-20">
        <p class="text-4xl mb-3">🤷</p>
        <h2 class="text-xl font-bold text-slate-800 mb-2">Gas not found</h2>
        <a class="btn btn-primary" href="gases.html">Back to Gas Intelligence</a>
      </div>`;
    return;
  }

  const salt = key;
  const rand = createSeededRandom(seedFromLocation("New York", salt));
  const baseValue = key === "co2" ? pickRandom(rand, [410, 420, 425, 415]) : randFromRange(rand, info, key);
  const safeMax = safeMaxFor(key);
  const pct = Math.min(100, (baseValue / safeMax) * 100);
  const severity = severityFor(pct);

  const level = {
    value: key === "co2" ? baseValue : Math.round(baseValue * 10) / 10,
    unit: info.unit,
    severity,
    pct: Math.round(pct),
    safeMax,
  };

  renderHeader(container, info, level);
  renderImpactEngine(container, info);
  renderTabs(container, key, rand);
}

function randFromRange(rand, info, key) {
  const ranges = {
    co: [150, 900], no2: [10, 60], so2: [4, 40], pm25: [8, 70], pm10: [15, 120], co2: [410, 425],
  };
  const [min, max] = ranges[key] || [10, 50];
  return min + rand() * (max - min);
}

function safeMaxFor(key) {
  return { co: 35, no2: 100, so2: 75, pm25: 35, pm10: 75, co2: 450 }[key] || 100;
}

function severityFor(pct) {
  if (pct <= 40) return { label: "Low", color: "#10b981", tone: "low" };
  if (pct <= 60) return { label: "Moderate", color: "#f59e0b", tone: "moderate" };
  if (pct <= 75) return { label: "Elevated", color: "#f97316", tone: "unhealthy" };
  if (pct <= 90) return { label: "High", color: "#f43f5e", tone: "very-unhealthy" };
  return { label: "Severe", color: "#dc2626", tone: "hazardous" };
}

function renderHeader(container, info, level) {
  const hazardous = level.severity.tone === "hazardous" || level.severity.tone === "very-unhealthy";
  container.innerHTML = `
    <div class="page-hero rounded-3xl p-8 bg-white border border-slate-200 relative mb-6">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="w-20 h-20 rounded-2xl hero-card-gradient-sky flex items-center justify-center">
            <span class="text-3xl font-extrabold text-sky-700 mono">${info.symbol}</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-sky-600">Gas Intelligence</p>
            <h1 class="text-3xl font-extrabold text-slate-900">${info.name}</h1>
            <span class="status-pill" style="background:${level.severity.color}1c;color:${level.severity.color}">
              <span class="dot" style="background:${level.severity.color}"></span>${level.severity.label}
            </span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm text-slate-500">Current Level</p>
          <div class="flex items-baseline gap-1">
            <span class="text-5xl font-extrabold text-slate-900">${level.value}</span>
            <span class="text-slate-500">${level.unit}</span>
          </div>
          <div class="progress-track w-48 ml-auto mt-2"><div class="progress-fill" style="width:${level.pct}%;background:${level.severity.color};--progress-value:${level.pct}%"></div></div>
          <p class="text-xs text-slate-400 mt-1">${level.pct}% of safe threshold (${level.safeMax} ${level.unit})</p>
        </div>
      </div>
    </div>
    ${hazardous ? `
      <div class="alert-banner mb-6" style="background:#fef2f2;border-color:#fecaca;color:#dc2626">
        <span>${iconMarkup("alert-triangle", 22)}</span>
        <div>
          <p class="font-bold">Hazardous Level Warning</p>
          <p class="text-sm">Current ${info.symbol} levels are elevated. Minimize outdoor exposure and follow the personal precautions below.</p>
        </div>
      </div>` : ""}
    <div class="clima-card p-6 mb-6">
      <h3 class="section-title mb-3">Scientific Explanation</h3>
      <p class="text-sm text-slate-600 leading-relaxed">${info.explanation}</p>
    </div>
  `;
}

function renderImpactEngine(container, info) {
  const wrap = document.createElement("div");
  wrap.id = "impact-root";
  container.appendChild(wrap);
  wrap.innerHTML = `
    <h2 class="text-xl font-bold text-slate-900 mb-4">Impact Engine</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      ${info.impacts.map((imp, i) => `
        <div class="clima-card p-5 anim-slide-up anim-delay-${i + 1}">
          <span class="w-10 h-10 rounded-xl flex items-center justify-center text-sky-600 hero-card-gradient-sky mb-3">${iconMarkup(imp.icon, 20)}</span>
          <h4 class="font-bold text-slate-800 mb-1.5">${imp.title}</h4>
          <p class="text-sm text-slate-500 leading-relaxed">${imp.text}</p>
        </div>`).join("")}
    </div>
  `;
}

function renderTabs(container, key, rand) {
  const wrap = document.createElement("div");
  wrap.id = "action-tabs-root";
  wrap.className = "mt-8";
  container.appendChild(wrap);

  wrap.innerHTML = `
    <div class="flex border-b border-slate-200 mb-6">
      <button class="tab-btn active" data-tab="personal">Personal Precautions</button>
      <button class="tab-btn" data-tab="systemic">Systemic Actions</button>
    </div>
    <div data-tab-panel="personal"></div>
    <div data-tab-panel="systemic" class="hidden"></div>
  `;

  const panelPersonal = wrap.querySelector('[data-tab-panel="personal"]');
  const panelSystemic = wrap.querySelector('[data-tab-panel="systemic"]');

  renderPersonal(panelPersonal, key);
  renderSystemic(panelSystemic, key, rand);

  wrap.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      wrap.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b === btn));
      const which = btn.dataset.tab;
      panelPersonal.classList.toggle("hidden", which !== "personal");
      panelSystemic.classList.toggle("hidden", which !== "systemic");
    });
  });
}

function renderPersonal(wrap, key) {
  const precautions = {
    co: [
      { title: "Ventilation", text: "Ensure gas appliances and heating units are well-ventilated and functioning correctly." },
      { title: "CO Detector", text: "Install and maintain carbon monoxide detectors near sleeping and living areas." },
      { title: "Limit Exposure", text: "Avoid idling vehicles in enclosed garages and reduce time near high-traffic areas." },
      { title: "Seek Fresh Air", text: "Step outdoors briefly and ventilate indoor spaces if you feel drowsy or headachy." },
      { title: "Diet & Hydration", text: "Stay hydrated; oxygen-rich activity in clean air supports recovery of normal body function." },
    ],
    no2: [
      { title: "N95 Masks", text: "Wear a properly fitted N95 when commuting during peak traffic hours." },
      { title: "HEPA Purifier", text: "Run a HEPA air purifier indoors, especially near roadways." },
      { title: "Exercise Timing", text: "Schedule outdoor exercise early morning or late evening, away from traffic peaks." },
      { title: "Indoor Protection", text: "Keep windows closed toward busy roads and use kitchen/bathroom exhaust fans." },
      { title: "Diet & Hydration", text: "Antioxidant-rich foods and adequate hydration support respiratory resilience." },
    ],
    so2: [
      { title: "Limit Outdoors", text: "Reduce strenuous outdoor activity when SO₂ readings are elevated, especially near industry." },
      { title: "N95 Masks", text: "Use N95 masks if you must be outdoors near industrial or smelting sources." },
      { title: "HEPA Purifier", text: "Use HEPA filtration indoors with closed windows to exclude sulfurous fumes." },
      { title: "Exercise Timing", text: "Exercise indoors or after peak industrial emissions." },
      { title: "Monitor Symptoms", text: "Seek medical attention for persistent wheezing, chest tightness, or shortness of breath." },
    ],
    pm25: [
      { title: "N95 Masks", text: "Wear N95 (not cloth) masks during smoke or high-PM events to filter fine particles." },
      { title: "HEPA Purifier", text: "Run HEPA purifiers and keep windows closed to reduce indoor PM2.5." },
      { title: "Exercise Timing", text: "Avoid intense outdoor exertion when PM2.5 is elevated; exercise indoors if possible." },
      { title: "Indoor Protection", text: "Seal gaps, use recirculating HVAC with quality filters, and avoid burning indoors." },
      { title: "Diet & Hydration", text: "Hydration and anti-inflammatory foods support recovery; limit alcohol and smoking." },
    ],
    pm10: [
      { title: "Mask Up", text: "Use N95 masks during dust, construction, or windy high-PM conditions." },
      { title: "Indoor Protection", text: "Close windows during dust events and use HEPA filtration indoors." },
      { title: "Exercise Timing", text: "Avoid outdoor exercise during high-dust periods; choose indoor venues." },
      { title: "Clean Entry", text: "Use doormats and remove shoes to prevent tracking dust indoors." },
      { title: "Eye & Throat Care", text: "Rinse eyes and gargle after exposure to ease dust irritation." },
    ],
    co2: [
      { title: "Reduce Energy Use", text: "Improve home efficiency—insulation, LED lighting, and efficient appliances lower your CO₂ footprint." },
      { title: "Active Transport", text: "Walk, bike, or use transit to cut personal emissions." },
      { title: "Plant & Shade", text: "Support green spaces and urban trees that absorb CO₂." },
      { title: "Choose Renewables", text: "Switch to clean electricity suppliers where available." },
      { title: "Advocate", text: "Support policies, budgets, and investments that phase down fossil fuels." },
    ],
  };

  const items = precautions[key] || precautions.pm25;
  wrap.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${items.map((p, i) => `
        <div class="clima-card p-5 anim-slide-up anim-delay-${i + 1}">
          <span class="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-600" style="background:#ecfdf5;margin-bottom:0.75rem">${iconMarkup("shield", 18)}</span>
          <h4 class="font-bold text-slate-800 mb-1">${p.title}</h4>
          <p class="text-sm text-slate-500">${p.text}</p>
        </div>`).join("")}
    </div>
  `;
}

function renderSystemic(wrap, key, rand) {
  const policies = [
    { name: `${key.toUpperCase()} Emission Limits`, region: pickRandom(rand, ["National EPA", "EU Industrial Emissions Directive", "State Air Board"]), status: pickRandom(rand, ["Enforced", "On Track", "Enforced"]), summary: "Legally binding emission limit values for industrial and stationary sources using best available techniques." },
    { name: "Vehicle Emissions Standards", region: pickRandom(rand, ["EU Euro Standards", "EPA Tier 3", "Bharat Stage"]), status: "Enforced", summary: "Progressive tailpipe limits that cut NO₂, CO, and particulate emissions from new vehicles." },
    { name: "Clean Air Compliance Program", region: pickRandom(rand, ["City Air Quality Plan", "Regional Monitoring Network"]), status: pickRandom(rand, ["On Track", "Pending", "Advisory"]), summary: "Monitors ambient concentrations and holds major emitters accountable through reporting and penalties." },
  ];
  const subsidies = [
    { name: "Clean Vehicle Rebate", region: pickRandom(rand, ["Federal", "State/Municipal"]), value: pickRandom(rand, ["Up to $7,500", "Up to €6,000", "Up to ₹150,000"]), description: "Point-of-sale discount for low-emission and electric vehicles." },
    { name: "Home Efficiency Grant", region: pickRandom(rand, ["Municipal", "Regional"]), value: pickRandom(rand, ["Up to $4,000", "Up to €3,500"]), description: "Support for insulation, heat pumps, and electrified appliances." },
    { name: "Industrial Retrofit Subsidy", region: pickRandom(rand, ["State", "EU Fund"]), value: pickRandom(rand, ["Up to $2M", "Up to €1.5M"]), description: "Co-funding for abatement technology and clean-process upgrades." },
  ];

  wrap.innerHTML = `
    <h3 class="font-bold text-slate-900 mb-3">Policy Tracker</h3>
    <div class="space-y-3 mb-6">
      ${policies.map((p, i) => {
        const st = STATUS_STYLES[p.status] || { color: "#64748b", bg: "#f1f5f9" };
        return `
        <div class="clima-card p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 anim-slide-up anim-delay-${i + 1}">
          <div>
            <p class="font-bold text-slate-800">${p.name}</p>
            <p class="text-sm text-slate-500">${p.region}</p>
            <p class="text-sm text-slate-500 mt-1">${p.summary}</p>
          </div>
          <span class="status-pill shrink-0" style="background:${st.bg};color:${st.color}"><span class="dot" style="background:${st.color}"></span>${p.status}</span>
        </div>`; }).join("")}
    </div>

    <h3 class="font-bold text-slate-900 mb-3">Subsidies</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${subsidies.map((s, i) => `
        <div class="clima-card p-5 anim-slide-up anim-delay-${i + 1}">
          <p class="text-sm font-semibold text-slate-800">${s.name}</p>
          <p class="text-xs text-slate-400 mb-1">${s.region}</p>
          <p class="text-lg font-extrabold text-emerald-600 mb-2">${s.value}</p>
          <p class="text-sm text-slate-500">${s.description}</p>
        </div>`).join("")}
    </div>
  `;
}

// Expose for potential reuse
export { GAS_INFO };

// eslint-disable-next-line no-unused-vars
const __unused = toast;
