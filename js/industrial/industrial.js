/**
 * ClimaPulse — Industrial Zones page init
 */

import { getIndustrialData } from "../services/industrialService.js";
import { geocode } from "../services/geocodeService.js";
import { createLocationSearch } from "../dashboard/components.js";
import { iconMarkup } from "../navigation.js";
import { showLoading, showError } from "../utils.js";

const DEFAULT_LOCATION = "New York";
let currentLocation = DEFAULT_LOCATION;

export default function initIndustrial() {
  const searchContainer = document.getElementById("industrial-location-search");
  const contentWrap = document.getElementById("industrial-content");

  createLocationSearch(searchContainer, {
    onSelect: (loc) => {
      currentLocation = geocode(loc.name).name;
      load();
    },
  });

  load();

  async function load() {
    showLoading(contentWrap.parentElement, true);
    document.getElementById("industrial-location-label").textContent = currentLocation;
    try {
      const data = getIndustrialData(currentLocation);
      renderContent(contentWrap, data);
      showLoading(contentWrap.parentElement, false);
      contentWrap.classList.remove("hidden");
    } catch (e) {
      showLoading(contentWrap.parentElement, false);
      showError(contentWrap.parentElement, "Unable to load industrial zone data.", load);
    }
  }
}

function renderContent(wrap, data) {
  wrap.innerHTML = `
    <h2 class="text-xl font-bold text-slate-900 mb-4">Summary</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      ${[
        { label: "Total CO₂", value: formatK(data.totals.co2), unit: "kt/yr", color: "#64748b", icon: "factory" },
        { label: "Total NO₂", value: formatK(data.totals.no2), unit: "t/yr", color: "#f97316", icon: "cloud" },
        { label: "Total SO₂", value: formatK(data.totals.so2), unit: "t/yr", color: "#f59e0b", icon: "cloud-rain" },
        { label: "Total PM2.5", value: formatK(data.totals.pm25), unit: "t/yr", color: "#dc2626", icon: "haze" },
        { label: "Facilities", value: data.totals.facilities, unit: "sites", color: "#0284c7", icon: "building" },
        { label: "Flagged Emitters", value: data.totals.flagged, unit: "facilities", color: "#e11d48", icon: "alert-triangle" },
      ].map((s, i) => `
        <div class="clima-card p-4 anim-slide-up anim-delay-${i + 1}">
          <span class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style="background:${s.color}1c;color:${s.color}">${iconMarkup(s.icon, 18)}</span>
          <p class="text-2xl font-extrabold text-slate-900">${s.value}</p>
          <p class="text-xs text-slate-400">${s.label} · ${s.unit}</p>
        </div>`).join("")}
    </div>

    <h2 class="text-xl font-bold text-slate-900 mb-4">Industrial Zones</h2>
    <div class="space-y-6">
      ${data.zones.map((z, i) => renderZone(z, i)).join("")}
    </div>
  `;
}

function renderZone(z, idx) {
  const complianceStyle = (c) => ({ High: "bg-emerald-50 text-emerald-600", Moderate: "bg-amber-50 text-amber-600", Screening: "bg-sky-50 text-sky-600" }[c] || "bg-slate-100 text-slate-600");
  const statusColor = (s) => ({ Compliant: "#10b981", Monitored: "#0284c7", Flagged: "#dc2626" }[s] || "#64748b");
  return `
    <div class="clima-card p-6 anim-slide-up anim-delay-${(idx % 2) + 1}">
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-11 h-11 rounded-xl hero-card-gradient-sky flex items-center justify-center text-slate-700">${iconMarkup("factory", 22)}</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">${z.name}</h3>
              <p class="text-sm text-slate-500">${z.type} · ${z.distance} away · ${z.facilityCount} facilities</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="status-pill ${complianceStyle(z.compliance)}"><span class="dot" style="background:currentColor"></span>${z.compliance} compliance</span>
          <span class="status-pill bg-slate-100 text-slate-600">Impact ${z.impactScore}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        ${[
          { l: "CO₂", v: `${formatK(z.emissions.co2)} kt`, c: "#64748b" },
          { l: "NO₂", v: `${formatK(z.emissions.no2)} t`, c: "#f97316" },
          { l: "SO₂", v: `${formatK(z.emissions.so2)} t`, c: "#f59e0b" },
          { l: "PM2.5", v: `${formatK(z.emissions.pm25)} t`, c: "#dc2626" },
        ].map((e) => `
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p class="text-xs font-semibold" style="color:${e.c}">${e.l}</p>
            <p class="text-lg font-extrabold text-slate-900">${e.v}</p>
          </div>`).join("")}
      </div>

      <p class="text-sm font-semibold text-slate-700 mb-3">Top Factories</p>
      <div class="space-y-2.5">
        ${z.factories.map((f) => `
          <div class="flex items-center justify-between border border-slate-100 rounded-xl p-3">
            <div>
              <p class="font-semibold text-slate-800 text-sm">${f.name}</p>
              <p class="text-xs text-slate-400">Output ${Math.round(f.output)} kt/yr · ${f.share}% of zone</p>
            </div>
            <span class="status-pill" style="background:${statusColor(f.status)}1c;color:${statusColor(f.status)}">
              <span class="dot" style="background:${statusColor(f.status)}"></span>${f.status}
            </span>
          </div>`).join("")}
      </div>
    </div>`;
}

function formatK(v) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v));
}
