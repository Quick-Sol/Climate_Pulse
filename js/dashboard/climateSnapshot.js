/**
 * ClimaPulse — Climate Snapshot widget
 */

import { iconMarkup } from "../navigation.js";

export function renderClimateSnapshot(container, snapshot) {
  const warming = snapshot.anomalyValue >= 0;
  const trendColor = warming ? "text-orange-500" : "text-sky-500";
  const trendIcon = warming ? "trending-up" : "trending-down";

  container.innerHTML = `
    <div class="clima-card clima-card-hover p-5 h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="section-title">${iconMarkup("globe", 20)} Climate Snapshot</h3>
        <span class="status-pill ${warming ? "bg-orange-50 text-orange-600" : "bg-sky-50 text-sky-600"}">
          ${warming ? "Warming" : "Cooling"}
        </span>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <span class="text-5xl font-extrabold ${trendColor}">${snapshot.anomaly}</span>
        <div class="text-sm text-slate-500 leading-snug">
          <p>vs 20th-century baseline</p>
          <span class="inline-flex items-center gap-1 font-medium ${trendColor}">${iconMarkup(trendIcon, 16)} ${snapshot.direction} trend</span>
        </div>
      </div>
      <p class="text-sm text-slate-600 mb-3">${snapshot.explanation}</p>
      <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
        <p class="text-xs text-slate-500 leading-relaxed"><strong class="text-slate-700">Context:</strong> ${snapshot.context}</p>
      </div>
    </div>
  `;
}
