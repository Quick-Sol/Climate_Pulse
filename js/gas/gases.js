/**
 * ClimaPulse — Gas Intelligence page init
 */

import { getCurrent as getAQI } from "../services/airQualityService.js";
import { geocode } from "../services/geocodeService.js";
import { createLocationSearch } from "../dashboard/components.js";
import { iconMarkup } from "../navigation.js";
import { showLoading, showError } from "../utils.js";

const DEFAULT_LOCATION = "New York";
let currentLocation = DEFAULT_LOCATION;

export default function initGases() {
  const searchContainer = document.getElementById("gas-location-search");
  const cardsWrap = document.getElementById("gas-cards");

  createLocationSearch(searchContainer, {
    onSelect: (loc) => {
      currentLocation = geocode(loc.name).name;
      load();
    },
  });

  load();

  async function load() {
    showLoading(cardsWrap.parentElement, true);
    document.getElementById("gas-location-label").textContent = currentLocation;
    try {
      const aq = await getAQI(currentLocation);
      renderCards(cardsWrap, aq);
      showLoading(cardsWrap.parentElement, false);
      cardsWrap.classList.remove("hidden");
    } catch (e) {
      showLoading(cardsWrap.parentElement, false);
      showError(cardsWrap.parentElement, "Unable to load gas intelligence.", load);
    }
  }
}

function renderCards(wrap, aq) {
  wrap.innerHTML = aq.pollutants.map((p, i) => {
    const meta = {
      co: { category: "Combustion Byproduct" },
      no2: { category: "Traffic & Combustion" },
      so2: { category: "Industrial / Fossil Fuel" },
      pm25: { category: "Particulate Matter" },
      pm10: { category: "Particulate Matter" },
    }[p.key] || { category: "Atmospheric Pollutant" };

    return `
      <a href="gas-detail.html?gas=${p.key}" class="clima-card clima-card-hover p-6 anim-slide-up anim-delay-${(i % 5) + 1} block">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-3xl font-extrabold text-slate-900 mono">${p.symbol}</p>
            <p class="font-semibold text-slate-700 mt-1">${p.name}</p>
            <p class="text-xs text-slate-400">${meta.category}</p>
          </div>
          <span class="status-pill" style="background:${p.severity?.color}1c; color:${p.severity?.color}">
            <span class="dot" style="background:${p.severity?.color}"></span>${p.severity?.label}
          </span>
        </div>
        <div class="flex items-baseline gap-1 mb-3">
          <span class="text-3xl font-extrabold text-slate-900">${p.value}</span>
          <span class="text-sm text-slate-500">${p.unit}</span>
        </div>
        <div class="progress-track mb-2"><div class="progress-fill" style="width:${p.percentage}%;background:${p.severity?.color};--progress-value:${p.percentage}%"></div></div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400">${p.percentage}% of threshold</span>
          <span class="inline-flex items-center gap-1 text-sm font-semibold text-sky-600">Details ${iconMarkup("chevron-right", 16)}</span>
        </div>
      </a>`;
  }).join("");
}
