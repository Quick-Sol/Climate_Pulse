/**
 * ClimaPulse — Dashboard page init
 */

import { getCurrent as getWeather } from "../services/weatherService.js";
import { getCurrent as getAQI, getClimateSnapshot } from "../services/airQualityService.js";
import { generateClimateData } from "../services/mockData.js";
import { geocode } from "../services/geocodeService.js";
import { renderWeatherWidget } from "./weatherWidget.js";
import { renderAqiGauge } from "./aqiGauge.js";
import { renderTrendChart } from "./trendChart.js";
import { renderGasBreakdown } from "./gasBreakdown.js";
import { renderClimateSnapshot } from "./climateSnapshot.js";
import { createLocationSearch } from "./components.js";
import { showLoading, showError, buildEmailSummaryTemplate } from "../utils.js";
import { iconMarkup } from "../navigation.js";
import { toast } from "../toast.js";

const DEFAULT_LOCATION = "New York";

let currentLocation = DEFAULT_LOCATION;
let currentData = null;
let userSelected = false;

export default function initDashboard() {
  const locationLabel = document.getElementById("location-label");
  const searchContainer = document.getElementById("location-search");
  const alertBanner = document.getElementById("alert-banner");
  const weatherWrap = document.getElementById("weather-widget");
  const gaugeWrap = document.getElementById("aqi-gauge");
  const chartWrap = document.getElementById("trend-chart");
  const gasWrap = document.getElementById("gas-breakdown");
  const snapshotWrap = document.getElementById("climate-snapshot");

  // Location search
  createLocationSearch(searchContainer, {
    value: "",
    onSelect: (loc) => {
      userSelected = true;
      const resolved = geocode(loc.name);
      setLocation(resolved.name);
    },
  });

  // Geolocate (never overrides a location the user has explicitly chosen)
  detectLocation().then((resolved) => {
    if (userSelected) return;
    currentLocation = resolved.name;
    setLocation(currentLocation);
  });

  // Trend chart controls
  let period = "daily";
  let metric = "temperature";
  const periodBtns = document.querySelectorAll("[data-period]");
  const metricBtns = document.querySelectorAll("[data-metric]");
  periodBtns.forEach((b) => b.addEventListener("click", () => {
    period = b.dataset.period;
    periodBtns.forEach((x) => x.classList.toggle("btn-primary", x === b));
    periodBtns.forEach((x) => x.classList.toggle("btn-ghost", x !== b));
    renderTrendChart(chartWrap, currentLocation, period, metric);
  }));
  metricBtns.forEach((b) => b.addEventListener("click", () => {
    metric = b.dataset.metric;
    metricBtns.forEach((x) => x.classList.toggle("btn-primary", x === b));
    metricBtns.forEach((x) => x.classList.toggle("btn-ghost", x !== b));
    renderTrendChart(chartWrap, currentLocation, period, metric);
  }));

  // Email summary
  const emailBtn = document.getElementById("email-summary-btn");
  emailBtn.addEventListener("click", handleEmailSummary);

  function setLocation(name) {
    currentLocation = name;
    if (locationLabel) locationLabel.textContent = name;
    loadAll();
  }

  async function loadAll() {
    showLoading(document.getElementById("dashboard-content"), true);
    try {
      const [weather, airQuality, snapshot] = await Promise.all([
        getWeather(currentLocation),
        getAQI(currentLocation),
        getClimateSnapshot(currentLocation),
      ]);
      currentData = { weather, airQuality, snapshot };

      renderWeatherWidget(weatherWrap, weather);
      renderAqiGauge(gaugeWrap, airQuality);
      renderTrendChart(chartWrap, currentLocation, period, metric);
      renderGasBreakdown(gasWrap, airQuality.pollutants);
      renderClimateSnapshot(snapshotWrap, snapshot);
      renderAlerts(alertBanner, weather, airQuality);

      showLoading(document.getElementById("dashboard-content"), false);
      document.getElementById("dashboard-content").classList.remove("hidden");
    } catch (e) {
      showLoading(document.getElementById("dashboard-content"), false);
      showError(document.getElementById("dashboard-content"), "Unable to load climate data.", loadAll);
    }
  }
}

function detectLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(geocode(DEFAULT_LOCATION));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        resolve({ name: DEFAULT_LOCATION, lat: latitude, lon: longitude, isKnown: true });
      },
      () => resolve(geocode(DEFAULT_LOCATION)),
      { timeout: 5000, maximumAge: 0 }
    );
  });
}

function renderAlerts(container, weather, airQuality) {
  const alerts = [];
  const aqiInfo = { Good: 0, Moderate: 1, "Unhealthy for Sensitive Groups": 2, Unhealthy: 3, "Very Unhealthy": 4, Hazardous: 5 };

  if (weather.uvIndex >= 6) {
    alerts.push({ level: "warning", color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", title: "High UV Warning", msg: `UV index is ${weather.uvIndex} (${weather.uvLabel}). Limit direct sun exposure between 10am–4pm and use SPF 30+.` });
  }
  if (weather.rainProbability >= 70) {
    alerts.push({ level: "info", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", title: "Rain Warning", msg: `${weather.rainProbability}% chance of rain. Carry an umbrella and allow extra travel time.` });
  }
  if (weather.windSpeed >= 30) {
    alerts.push({ level: "warning", color: "#f97316", bg: "#fff7ed", border: "#fdba74", title: "Strong Wind Advisory", msg: `Winds of ${Math.round(weather.windSpeed)} km/h. Secure loose outdoor items and expect travel delays.` });
  }

  const aqiLevel = aqiInfo[airQuality.category] ?? 0;
  if (aqiLevel >= 3) {
    alerts.push({ level: "danger", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", title: `Air Quality Warning — ${airQuality.category}`, msg: `Reduce prolonged or strenuous outdoor exertion. Sensitive groups should stay indoors when possible.` });
  } else if (aqiLevel === 2) {
    alerts.push({ level: "warning", color: "#f97316", bg: "#fffbeb", border: "#fcd34d", title: "Air Quality Advisory", msg: `AQI is ${airQuality.aqi} (${airQuality.category}). Sensitive groups should limit outdoor exertion.` });
  }

  if (!alerts.length) {
    container.innerHTML = `
      <div class="alert-banner" style="background:#f0fdf4;border-color:#bbf7d0;color:#166534">
        <span>${iconMarkup("check-circle", 22)}</span>
        <div>
          <p class="font-bold">No active alerts</p>
          <p class="text-sm opacity-90">Conditions are generally favorable today. Stay aware of any evening air quality shifts.</p>
        </div>
      </div>`;
    return;
  }

  container.innerHTML = alerts.map((a) => `
    <div class="alert-banner" style="background:${a.bg};border-color:${a.border};color:${a.color}">
      <span>${a.level === "danger" ? iconMarkup("alert-triangle", 22) : iconMarkup("cloud-rain", 22)}</span>
      <div>
        <p class="font-bold">${a.title}</p>
        <p class="text-sm">${a.msg}</p>
      </div>
    </div>`).join("");
}

function handleEmailSummary() {
  const btn = document.getElementById("email-summary-btn");
  if (!currentData) return;
  btn.disabled = true;
  const original = btn.innerHTML;
  btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" style="animation:spin 0.8s linear infinite"></span> Preparing…`;

  setTimeout(() => {
    // Build the HTML email template for future backend integration
    const template = buildEmailSummaryTemplate(currentLocation, currentData);
    // (In production, POST this template to an email API.)

    btn.disabled = false;
    btn.innerHTML = original;
    document.getElementById("email-preview-template").value = template;
    toast.success("Daily climate summary prepared successfully.", "Email Ready");
  }, 1400);
}
