/**
 * ClimaPulse — Weather Widget
 */

import { iconMarkup } from "../navigation.js";

export function renderWeatherWidget(container, weather) {
  const rows = [
    { label: "Feels Like", value: `${Math.round(weather.feelsLike)}°`, icon: "thermometer" },
    { label: "Humidity", value: `${Math.round(weather.humidity)}%`, icon: "droplets" },
    { label: "Wind", value: `${Math.round(weather.windSpeed)} km/h`, icon: "wind" },
    { label: "Wind Direction", value: weather.windDirection, icon: "navigation" },
    { label: "UV Index", value: `${weather.uvIndex} · ${weather.uvLabel}`, icon: "sun" },
    { label: "Precipitation", value: `${weather.precipitation} mm`, icon: "cloud-rain" },
    { label: "Rain Probability", value: `${Math.round(weather.rainProbability)}%`, icon: "umbrella" },
    { label: "Visibility", value: `${weather.visibility} km`, icon: "eye" },
    { label: "Pressure", value: `${Math.round(weather.pressure)} hPa`, icon: "gauge" },
    { label: "Sunrise", value: weather.sunrise, icon: "sunrise" },
    { label: "Sunset", value: weather.sunset, icon: "sunset" },
  ];

  const conditionIcon = conditionIconFor(weather.condition);

  container.innerHTML = `
    <div class="hero-card-gradient-sky rounded-2xl p-6 h-full relative overflow-hidden anim-slide-up">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6 relative z-10">
        <div class="flex items-center gap-5">
          <div class="w-20 h-20 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center text-sky-600 shadow-inner">
            ${conditionIcon}
          </div>
          <div>
            <p class="text-slate-500 font-medium text-sm">${weather.condition}</p>
            <div class="flex items-baseline gap-2">
              <span class="text-6xl font-extrabold text-slate-900 leading-none">${Math.round(weather.temperature)}°</span>
              <span class="text-slate-500">C</span>
            </div>
            <p class="text-slate-500 text-sm mt-1">Feels like ${Math.round(weather.feelsLike)}°</p>
          </div>
        </div>
        <div class="text-sm text-slate-600 flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-500" style="animation: pulseSoft 2s infinite;"></span>
            Live conditions
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6 relative z-10">
        ${rows.map((r) => `
          <div class="flex items-center gap-2.5 bg-white/60 backdrop-blur rounded-xl px-3 py-2.5 border border-white/60">
            <span class="text-sky-600">${iconMarkup(r.icon, 18)}</span>
            <div class="leading-tight">
              <p class="text-[11px] text-slate-400 font-medium">${r.label}</p>
              <p class="text-sm font-semibold text-slate-800">${r.value}</p>
            </div>
          </div>`).join("")}
      </div>
    </div>
  `;
}

export function conditionIconFor(condition) {
  const map = {
    sunny: "sun",
    "clear skies": "moon",
    "partly cloudy": "cloud-sun",
    cloudy: "cloud",
    overcast: "cloud",
    "light rain": "cloud-rain",
    "rain showers": "cloud-rain",
    hazy: "haze",
    misty: "haze",
    foggy: "haze",
    "light wind": "wind",
    breezy: "wind",
  };
  const key = (condition || "").toLowerCase();
  const name = map[key] || "sun";
  return iconMarkup(name, 44);
}
