/**
 * ClimaPulse — Soil Intelligence page init
 *
 * Renders Soil Indicator cards (link to detail pages)
 * AND the Soil Intelligence Explorer (4 localized modules).
 */

import { getSoilIntelligence } from "../services/mockData.js";
import { geocode } from "../services/geocodeService.js";
import { createLocationSearch } from "../dashboard/components.js";
import { iconMarkup } from "../navigation.js";
import { showLoading, showError } from "../utils.js";

const SOIL_CHIPS = [
  { name: "Iowa", country: "USA", flag: "🇺🇸" },
  { name: "Punjab", country: "India", flag: "🇮🇳" },
  { name: "Nairobi", country: "Kenya", flag: "🇰🇪" },
  { name: "Andalusia", country: "Spain", flag: "🇪🇸" },
  { name: "São Paulo", country: "Brazil", flag: "🇧🇷" },
];

let currentLocation = "Iowa";

export default function initSoil() {
  const indicatorWrap = document.getElementById("soil-indicators");
  const explorerWrap = document.getElementById("soil-explorer");

  renderIndicators(indicatorWrap, currentLocation);
  renderExplorer(explorerWrap, currentLocation);
}

function renderIndicators(wrap, location) {
  const data = getSoilIntelligence(location);
  const inds = [
    { key: "moisture", label: "Soil Moisture", value: data.indicators.moisture.value, unit: data.indicators.moisture.unit, status: data.indicators.moisture.status, icon: "droplet", desc: "Water held in the soil profile, critical for crop growth and drought resilience." },
    { key: "ph", label: "Soil pH", value: data.indicators.ph.value, unit: "", status: data.indicators.ph.status, icon: "scale", desc: "Acidity or alkalinity of the soil, influencing nutrient availability and microbial activity." },
    { key: "carbon", label: "Soil Organic Carbon", value: data.indicators.carbon.value, unit: data.indicators.carbon.unit, status: data.indicators.carbon.status, icon: "leaf-icon", desc: "Organic carbon content supporting fertility, structure, and carbon sequestration." },
  ];

  wrap.innerHTML = `
    <h2 class="text-xl font-bold text-slate-900 mb-4">Soil Health Indicators in ${location}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      ${inds.map((i) => {
        const stColor = statusColor(i.status);
        return `
        <a href="soil-detail.html?soil=${i.key}" class="clima-card clima-card-hover p-6 anim-slide-up block">
          <span class="w-11 h-11 rounded-xl hero-card-gradient-sky flex items-center justify-center text-emerald-700 mb-4">${iconMarkup(i.icon, 22)}</span>
          <p class="text-sm font-medium text-slate-500">${i.label}</p>
          <div class="flex items-baseline gap-1 my-1">
            <span class="text-4xl font-extrabold text-slate-900">${i.value}</span>
            <span class="text-slate-500">${i.unit}</span>
          </div>
          <span class="status-pill" style="background:${stColor}1c;color:${stColor}"><span class="dot" style="background:${stColor}"></span>${i.status}</span>
          <p class="text-sm text-slate-500 mt-3">${i.desc}</p>
        </a>`; }).join("")}
    </div>
  `;
}

function renderExplorer(wrap, location) {
  wrap.innerHTML = `
    <div class="mt-12">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900">Soil Intelligence Explorer</h2>
          <p class="text-slate-500 mt-1">Localized analysis for <span class="font-semibold text-slate-700" data-explorer-loc>${location}</span></p>
        </div>
        <div id="soil-explorer-search" class="w-full md:w-72"></div>
      </div>
      <div data-explorer-content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="soil-module-1"></div>
          <div id="soil-module-2"></div>
          <div id="soil-module-3"></div>
          <div id="soil-module-4"></div>
        </div>
      </div>
    </div>
  `;

  const searchInner = document.createElement("div");
  document.getElementById("soil-explorer-search").replaceChildren(searchInner);
  createLocationSearch(searchInner, {
    value: location,
    suggestions: SOIL_CHIPS.map((c) => ({ name: c.name, country: c.country })),
    onSelect: (loc) => {
      currentLocation = geocode(loc.name).name;
      renderExplorer(wrap, currentLocation);
    },
  });

  const content = wrap.querySelector("[data-explorer-content]");
  showLoading(content, true);
  setTimeout(() => {
    try {
      const data = getSoilIntelligence(location);
      wrap.querySelector("[data-explorer-loc]").textContent = location;
      renderModule1(content.querySelector("#soil-module-1"), data);
      renderModule2(content.querySelector("#soil-module-2"), data);
      renderModule3(content.querySelector("#soil-module-3"), data);
      renderModule4(content.querySelector("#soil-module-4"), data);
      showLoading(content, false);
    } catch (e) {
      showLoading(content, false);
      showError(content, "Unable to load soil intelligence.", () => renderExplorer(wrap, currentLocation));
    }
  }, 300);
}

function renderModule1(wrap, data) {
  const riskColor = (r) => ({ Low: "bg-emerald-50 text-emerald-600", Moderate: "bg-amber-50 text-amber-600", High: "bg-orange-50 text-orange-600", Severe: "bg-rose-50 text-rose-600" }[r] || "bg-slate-100 text-slate-600");
  wrap.innerHTML = `
    <div class="clima-card p-6 h-full">
      <h3 class="section-title mb-4">Localized Pollution Risk Tracker</h3>
      <div class="space-y-3 mb-4">
        ${data.module1.sources.map((s) => `
          <div class="border border-slate-100 rounded-xl p-3.5">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold text-slate-800 text-sm">${s.name}</p>
                <p class="text-xs text-slate-400">${s.type} · ${s.distance} away</p>
                <p class="text-xs text-slate-500 mt-1">Contaminants: ${s.contaminants}</p>
              </div>
              <span class="status-pill ${riskColor(s.risk)}"><span class="dot" style="background:currentColor"></span>${s.risk}</span>
            </div>
          </div>`).join("")}
      </div>
      <p class="text-sm font-medium text-slate-700 mb-2">Heavy metal risk:</p>
      <div class="flex flex-wrap gap-2 mb-4">
        ${data.module1.heavyMetals.map((m) => `
          <span class="chip ${m.status === "Elevated" ? "!bg-orange-50 !text-orange-600 !border-orange-200" : ""}">${m.metal}: ${m.status}</span>`).join("")}
      </div>
      <p class="text-sm text-slate-500 mb-2"><strong class="text-slate-700">Pesticide history:</strong> ${data.module1.pesticideHistory}</p>
      <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
        <p class="text-xs text-slate-600"><strong class="text-slate-700">Summary:</strong> ${data.module1.summary}</p>
      </div>
    </div>
  `;
}

function renderModule2(wrap, data) {
  const rot = data.module2.rotations[0];
  wrap.innerHTML = `
    <div class="clima-card p-6 h-full">
      <h3 class="section-title mb-4">Regenerative Action Planner</h3>
      <div class="space-y-5">
        <div>
          <p class="font-bold text-slate-800 text-sm mb-2">Crop Rotation</p>
          <div class="border border-emerald-100 rounded-xl p-3.5" style="background:#f0fdf4">
            <p class="text-sm font-semibold text-emerald-800">${rot.crops}</p>
            <p class="text-xs text-emerald-700 mt-1">Carbon benefit: ${rot.carbonBenefits}</p>
            <p class="text-xs text-emerald-700 mt-0.5">Pest-break: ${rot.pestBreak}</p>
          </div>
        </div>
        <div>
          <p class="font-bold text-slate-800 text-sm mb-2">Cover Cropping</p>
          <div class="border border-sky-100 rounded-xl p-3.5 bg-sky-50/50">
            <p class="text-sm font-semibold text-slate-800">${data.module2.coverCrops.species}</p>
            <p class="text-xs text-slate-500 mt-1">Planting window: ${data.module2.coverCrops.window}</p>
            <p class="text-xs text-slate-500 mt-0.5">Benefits: ${data.module2.coverCrops.benefits}</p>
          </div>
        </div>
        <div>
          <p class="font-bold text-slate-800 text-sm mb-2">Composting</p>
          <div class="border border-amber-100 rounded-xl p-3.5 bg-amber-50/50">
            <p class="text-sm text-slate-700">Materials: ${data.module2.composting.materials}</p>
            <p class="text-xs text-slate-500 mt-1">Application rate: ${data.module2.composting.applicationRate}</p>
            <p class="text-xs text-slate-500 mt-0.5">Carbon impact: ${data.module2.composting.carbonImpact}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderModule3(wrap, data) {
  wrap.innerHTML = `
    <div class="clima-card p-6 h-full">
      <h3 class="section-title mb-4">Contaminant Remediation Guide</h3>
      <div class="space-y-3">
        ${data.module3.map((m) => `
          <div class="border border-slate-100 rounded-xl p-4">
            <p class="font-bold text-slate-800 text-sm">${m.method}</p>
            <p class="text-xs text-slate-400 mt-0.5">Best for: ${m.bestFor}</p>
            <p class="text-xs text-slate-500 mt-1">${m.mechanism}</p>
            <p class="text-xs text-slate-500 mt-1">Species/material: ${m.material}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-slate-400">Timeline: ${m.timeline}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1"><strong class="text-slate-600">Steps:</strong> ${m.steps}</p>
          </div>`).join("")}
      </div>
    </div>
  `;
}

function renderModule4(wrap, data) {
  wrap.innerHTML = `
    <div class="clima-card p-6 h-full">
      <h3 class="section-title mb-4">Climate Resilience Advisor</h3>
      <div class="space-y-5">
        <div>
          <p class="font-bold text-amber-700 text-sm mb-2 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Drought Actions</p>
          <div class="space-y-2">
            ${data.resilience.drought.map((d, i) => `
              <div class="border border-amber-200 rounded-xl p-3 bg-amber-50/60 flex gap-3">
                <span class="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">${i + 1}</span>
                <p class="text-sm text-slate-700">${d}</p>
              </div>`).join("")}
          </div>
        </div>
        <div>
          <p class="font-bold text-sky-700 text-sm mb-2 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-sky-500 inline-block"></span> Heavy Rain Actions</p>
          <div class="space-y-2">
            ${data.resilience.rain.map((d, i) => `
              <div class="border border-sky-200 rounded-xl p-3 bg-sky-50/60 flex gap-3">
                <span class="w-6 h-6 shrink-0 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">${i + 1}</span>
                <p class="text-sm text-slate-700">${d}</p>
              </div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function statusColor(status) {
  const map = { Dry: "#f97316", Optimal: "#10b981", Saturated: "#0284c7", Acidic: "#f97316", Neutral: "#10b981", Alkaline: "#0284c7", Low: "#d97706", Moderate: "#f59e0b", Good: "#10b981" };
  return map[status] || "#64748b";
}
