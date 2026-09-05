/**
 * ClimaPulse — Climate Trend Chart (Chart.js)
 */

import { getHourlyTrends, getWeeklyTrends } from "../services/mockData.js";

let chart = null;

const COLORS = {
  temperature: { stroke: "#0284c7", fill: "rgba(2, 132, 199, 0.18)" },
  humidity: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.18)" },
  aqi: { stroke: "#f97316", fill: "rgba(249, 115, 22, 0.18)" },
};

const METRIC_CONFIG = {
  temperature: { label: "Temperature (°C)", key: "temperature", colors: COLORS.temperature },
  humidity: { label: "Humidity (%)", key: "humidity", colors: COLORS.humidity },
  aqi: { label: "AQI", key: "aqi", colors: COLORS.aqi },
};

/**
 * Render or update the trend chart within a container.
 * @param {HTMLElement} canvasWrap - element holding <canvas>
 * @param {string} location
 * @param {string} period - 'daily' | 'weekly'
 * @param {string} metric - 'temperature' | 'humidity' | 'aqi'
 */
export function renderTrendChart(canvasWrap, location, period = "daily", metric = "temperature") {
  const cfg = METRIC_CONFIG[metric] || METRIC_CONFIG.temperature;
  const data = period === "daily" ? getHourlyTrends(location) : getWeeklyTrends(location);
  const labels = period === "daily" ? data.map((d) => d.hourLabel) : data.map((d) => d.day);
  const values = data.map((d) => d[cfg.key]);

  // Create/ensure canvas
  let canvas = canvasWrap.querySelector("canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvasWrap.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  if (chart) chart.destroy();

  const ctx2 = document.createElement("canvas").getContext("2d");
  const grad = ctx2.createLinearGradient(0, 0, 0, 300);
  grad.addColorStop(0, cfg.colors.fill);
  grad.addColorStop(1, "rgba(255,255,255,0)");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: cfg.label,
        data: values,
        borderColor: cfg.colors.stroke,
        backgroundColor: grad,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: period === "daily" ? 2 : 4,
        pointBackgroundColor: cfg.colors.stroke,
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#94a3b8",
          bodyColor: "#fff",
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (item) => ` ${cfg.label}: ${item.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8", font: { size: 11 } },
        },
        y: {
          grid: { color: "rgba(148,163,184,0.12)" },
          ticks: { color: "#94a3b8", font: { size: 11 } },
        },
      },
    },
  });
}

export function destroyChart() {
  if (chart) { chart.destroy(); chart = null; }
}
