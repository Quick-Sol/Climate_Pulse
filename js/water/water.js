/**
 * ClimaPulse — Water Intelligence page init
 */

import { createSeededRandom, seedFromLocation, randBetween } from "../seededRandom.js";
import { geocode } from "../services/geocodeService.js";
import { createLocationSearch } from "../dashboard/components.js";
import { iconMarkup } from "../navigation.js";
import { showLoading, showError } from "../utils.js";

const DEFAULT_LOCATION = "New York";

export default function initWater() {
  const searchContainer = document.getElementById("water-location-search");
  const indicatorsWrap = document.getElementById("water-indicators");
  let currentLocation = DEFAULT_LOCATION;

  createLocationSearch(searchContainer, {
    onSelect: (loc) => {
      currentLocation = geocode(loc.name).name;
      load();
    },
  });

  load();

  async function load() {
    showLoading(indicatorsWrap.parentElement, true);
    document.getElementById("water-location-label").textContent = currentLocation;
    try {
      // Use a deterministic seeded dataset per location
      const indicators = getWaterIndicators(currentLocation);
      renderIndicators(indicatorsWrap, indicators);
      showLoading(indicatorsWrap.parentElement, false);
      indicatorsWrap.classList.remove("hidden");
    } catch (e) {
      showLoading(indicatorsWrap.parentElement, false);
      showError(indicatorsWrap.parentElement, "Unable to load water intelligence.", load);
    }
  }
}

export function getWaterIndicators(location) {
  const rand = createSeededRandom(seedFromLocation(location, "water"));
  const ph = randBetween(rand, 6.2, 8.6);
  const doValue = randBetween(rand, 4, 9.5);
  const nitrate = randBetween(rand, 0.5, 12);
  return [
    { key: "ph", label: "Water pH", value: Math.round(ph * 10) / 10, unit: "", range: "6.5–8.5 (typical fresh)", status: phStatus(ph), icon: "scale", desc: "Acidity/alkalinity of water, affecting aquatic life and treatment." },
    { key: "do", label: "Dissolved Oxygen", value: Math.round(doValue * 10) / 10, unit: "mg/L", range: "≥ 5 mg/L recommended", status: doStatus(doValue), icon: "activity", desc: "Oxygen available to aquatic organisms; critical for fish and decomposition." },
    { key: "nitrate", label: "Nitrate", value: Math.round(nitrate * 10) / 10, unit: "mg/L", range: "≤ 10 mg/L drinking standard", status: nitrateStatus(nitrate), icon: "droplets", desc: "Nutrient from agriculture and runoff; elevated levels impair water quality." },
  ];
}

export function waterStatusColor(status) {
  const map = { "Optimal": "#10b981", "Slightly High": "#d97706", "High": "#f97316", "Low": "#f97316", "Moderate": "#f59e0b", "Elevated": "#f97316", "Acceptable": "#10b981", "Good": "#10b981", "Critical": "#dc2626" };
  return map[status] || "#64748b";
}

function phStatus(p) { return (p >= 6.5 && p <= 8.5) ? "Acceptable" : "Elevated"; }
function doStatus(v) { return v >= 6 ? "Good" : v >= 5 ? "Moderate" : "Low"; }
function nitrateStatus(v) { return v <= 3 ? "Optimal" : v <= 6 ? "Slightly High" : "Elevated"; }

function renderIndicators(wrap, indicators) {
  wrap.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-5">` + indicators.map((i) => {
    const c = waterStatusColor(i.status);
    return `
      <a href="water-detail.html?water=${i.key}" class="clima-card clima-card-hover p-6 anim-slide-up block">
        <span class="w-11 h-11 rounded-xl hero-card-gradient-sky flex items-center justify-center text-sky-700 mb-4">${iconMarkup(i.icon, 22)}</span>
        <p class="text-sm font-medium text-slate-500">${i.label}</p>
        <div class="flex items-baseline gap-1 my-1">
          <span class="text-4xl font-extrabold text-slate-900">${i.value}</span>
          <span class="text-slate-500">${i.unit}</span>
        </div>
        <span class="status-pill" style="background:${c}1c;color:${c}"><span class="dot" style="background:${c}"></span>${i.status}</span>
        <p class="text-xs text-slate-400 mt-2">${i.range}</p>
        <p class="text-sm text-slate-500 mt-2">${i.desc}</p>
      </a>`;
  }).join("") + `</div>`;
}
