/**
 * ClimaPulse — Utility helpers
 */

import { pickRandom } from "./seededRandom.js";

/** Format a number with commas and optional decimals. */
export function formatNumber(value, decimals = 0) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format temperature with ° symbol. */
export function formatTemp(value) {
  return `${Math.round(value)}°`;
}

/** Format a percentage 0-100. */
export function formatPercent(value) {
  return `${Math.round(value)}%`;
}

/** Create an element quickly. */
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Escape HTML string to prevent injection. */
export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/** Show/hide a loading overlay or skeleton on a container. */
export function showLoading(container, show = true) {
  if (!container) return;
  let loader = container.querySelector("[data-loading-skeleton]");
  if (show) {
    if (!loader) {
      loader = el("div", "");
      loader.setAttribute("data-loading-skeleton", "");
      loader.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${'<div class="clima-card p-5"><div class="skeleton h-24 mb-3"></div><div class="skeleton h-4 w-2/3 mb-2"></div><div class="skeleton h-4 w-1/2"></div></div>'.repeat(6)}
        </div>`;
      container.appendChild(loader);
    }
    container.style.position = "relative";
    const content = container.querySelector("[data-content]");
    if (content) content.style.display = "none";
  } else {
    if (loader) loader.remove();
    const content = container.querySelector("[data-content]");
    if (content) content.style.display = "";
  }
}

/** Show an error block inside a container with a retry callback. */
export function showError(container, message, onRetry) {
  if (!container) return;
  const existing = container.querySelector("[data-error-block]");
  if (existing) existing.remove();
  const block = el("div", "text-center py-10");
  block.setAttribute("data-error-block", "");
  block.innerHTML = `
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500 mb-4 anim-scale-in">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <h3 class="text-lg font-bold text-slate-800 mt-4 mb-1">Something went wrong</h3>
    <p class="text-sm text-slate-500 mb-4">${escapeHtml(message || "Unable to load climate data.")}</p>
    <button class="btn btn-ghost" data-error-retry>Try Again</button>
  `;
  if (onRetry) {
    const btn = block.querySelector("[data-error-retry]");
    btn.addEventListener("click", onRetry);
  }
  const content = container.querySelector("[data-content]");
  if (content) content.style.display = "none";
  const loader = container.querySelector("[data-loading-skeleton]");
  if (loader) loader.remove();
  container.appendChild(block);
}

/** Show an empty state block. */
export function showEmpty(container, { icon, title, message, suggestion }) {
  if (!container) return;
  const block = el("div", "text-center py-12");
  block.innerHTML = `
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-50 text-sky-500 mb-4 anim-scale-in">
      ${icon || `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`}
    </div>
    <h3 class="text-lg font-bold text-slate-800 mb-1">${escapeHtml(title || "No results found")}</h3>
    <p class="text-sm text-slate-500 mb-1">${escapeHtml(message || "")}</p>
    ${suggestion ? `<p class="text-xs text-slate-400">${escapeHtml(suggestion)}</p>` : ""}
  `;
  container.appendChild(block);
}

/** Build an HTML email summary template (for future backend integration). */
export function buildEmailSummaryTemplate(location, data) {
  const { weather, airQuality, snapshot } = data;
  return `
    <!DOCTYPE html>
    <html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
      <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0284c7,#0d9488);color:#fff;padding:24px;">
          <h1 style="margin:0;font-size:22px;">☁️ ClimaPulse Daily Summary</h1>
          <p style="margin:6px 0 0;opacity:0.9;">${escapeHtml(location)}</p>
        </div>
        <div style="padding:24px;">
          <p style="color:#64748b;">Your personalized climate briefing for today.</p>
          <h3 style="margin:16px 0 8px;color:#0f172a;">Current Conditions</h3>
          <p><strong>${weather.condition}</strong> — ${Math.round(weather.temperature)}°C (feels like ${Math.round(weather.feelsLike)}°C)</p>
          <p>Humidity ${Math.round(weather.humidity)}% | Wind ${Math.round(weather.windSpeed)} km/h ${weather.windDirection}</p>
          <h3 style="margin:16px 0 8px;color:#0f172a;">Air Quality</h3>
          <p>AQI ${airQuality.aqi} (${airQuality.category}) — Dominant pollutant: ${airQuality.dominantPollutant}</p>
          <h3 style="margin:16px 0 8px;color:#0f172a;">Climate Snapshot</h3>
          <p>Temperature anomaly: <strong>${snapshot.anomaly}</strong> vs 20th-century baseline. ${snapshot.explanation}</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="font-size:12px;color:#94a3b8;">Phase 1 data is simulated for demonstration purposes.<br/>© 2026 ClimaPulse</p>
        </div>
      </div>
    </body></html>
  `;
}

/** Debounce a function. */
export function debounce(fn, wait = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/** Get active nav link path helper. */
export function currentPath() {
  return window.location.pathname.split("/").pop() || "index.html";
}

/** Convert "windDirection" degrees to a compass label. */
export function degreesToDirection(degrees) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((degrees % 360) + 360) % 360 / 45) % 8;
  return dirs[index];
}
