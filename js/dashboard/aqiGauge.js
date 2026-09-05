/**
 * ClimaPulse — AQI circular Gauge (SVG)
 */

export function renderAqiGauge(container, airQuality) {
  const { aqi, category, color, dominantPollutant } = airQuality;

  const R = 80;
  const C = 2 * Math.PI * R;
  const pct = Math.min(100, (aqi / 300) * 100);
  const offset = C - (C * pct) / 100;

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full py-4">
      <div class="relative">
        <svg width="200" height="200" viewBox="0 0 200 200" class="-rotate-90">
          <circle cx="100" cy="100" r="${R}" fill="none" stroke="#f1f5f9" stroke-width="16"/>
          <circle cx="100" cy="100" r="${R}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"
            stroke-dasharray="${C}" stroke-dashoffset="${C}" class="aqi-gauge-ring"
            style="stroke-dashoffset: ${offset};"></circle>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-5xl font-extrabold text-slate-900" style="color:${color}">${aqi}</span>
          <span class="text-sm font-semibold mt-1" style="color:${color}">${category}</span>
        </div>
      </div>
      <div class="mt-3 text-center">
        <p class="text-sm font-medium text-slate-600">Dominant Pollutant</p>
        <p class="text-lg font-bold text-slate-900 mono">${dominantPollutant}</p>
      </div>
      <div class="mt-4 flex flex-wrap justify-center gap-1.5 max-w-[240px]">
        ${[
          { l: "Good", c: "#10b981" },
          { l: "Moderate", c: "#f59e0b" },
          { l: "Sensitive", c: "#facc15" },
          { l: "Unhealthy", c: "#f97316" },
          { l: "Very", c: "#f43f5e" },
          { l: "Hazardous", c: "#dc2626" },
        ].map((s) => `
          <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600">
            <span class="w-2 h-2 rounded-full" style="background:${s.c}"></span>${s.l}
          </span>`).join("")}
      </div>
    </div>
  `;
}
