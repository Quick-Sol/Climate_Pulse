/**
 * ClimaPulse — Gas Breakdown widgets
 */

const GAS_META = {
  co: { name: "Carbon Monoxide", icon: "wind" },
  no2: { name: "Nitrogen Dioxide", icon: "cloud" },
  so2: { name: "Sulfur Dioxide", icon: "cloud-rain" },
  pm25: { name: "PM2.5", icon: "haze" },
  pm10: { name: "PM10", icon: "haze" },
};

export function renderGasBreakdown(container, pollutants) {
  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      ${pollutants.map((p) => {
        const meta = GAS_META[p.key] || { name: p.name, icon: "wind" };
        return `
          <div class="clima-card clima-card-hover p-4" data-gas="${p.key}" role="button" tabindex="0" aria-label="View ${p.name} detail">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-xl flex items-center justify-center text-sky-600" style="background:${p.severity?.color || "#e0f2fe"}1c">
                  <span style="color:${p.severity?.color || "#0284c7"}">${icon(meta.icon, 18)}</span>
                </span>
                <div>
                  <p class="font-bold text-slate-900 mono">${p.symbol}</p>
                  <p class="text-xs text-slate-500">${meta.name}</p>
                </div>
              </div>
              <span class="status-pill" style="background:${p.severity?.color || "#f1f5f9"}1c; color:${p.severity?.color || "#64748b"}">
                <span class="dot" style="background:${p.severity?.color}"></span>${p.severity?.label}
              </span>
            </div>
            <div class="flex items-baseline gap-1 mb-3">
              <span class="text-2xl font-extrabold text-slate-900">${p.value}</span>
              <span class="text-xs text-slate-500">${p.unit}</span>
            </div>
            <div class="progress-track mb-1"><div class="progress-fill" style="width:${p.percentage}%;background:${p.severity?.color || "#0284c7"};--progress-value:${p.percentage}%"></div></div>
            <p class="text-xs text-slate-400">${p.percentage}% of safe threshold</p>
          </div>`;
      }).join("")}
    </div>
  `;
}

import { icon } from "../navigation.js";
