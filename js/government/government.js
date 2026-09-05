/**
 * ClimaPulse — Government Intelligence page init
 */

import { getScorecards, getPolicies, getAccountability, GOVERNMENT_SUGGESTIONS } from "../services/governmentService.js";
import { createLocationSearch } from "../dashboard/components.js";
import { iconMarkup } from "../navigation.js";
import { showLoading, showError, showEmpty } from "../utils.js";

const STATUS_STYLES = {
  "On Track": { color: "#059669", bg: "#ecfdf5" },
  Lagging: { color: "#d97706", bg: "#fffbeb" },
  "Non-Compliant": { color: "#dc2626", bg: "#fef2f2" },
  Enforced: { color: "#059669", bg: "#ecfdf5" },
  Pending: { color: "#d97706", bg: "#fffbeb" },
  Advisory: { color: "#0284c7", bg: "#f0f9ff" },
};

export default function initGovernment() {
  const scoreWrap = document.getElementById("scorecard-grid");
  const explorerWrap = document.getElementById("regulation-explorer");
  const accountabilityWrap = document.getElementById("industrial-accountability");

  // Scorecard
  getScorecards().then((countries) => renderScorecard(scoreWrap, countries));
  // Accountability
  getAccountability().then((measures) => renderAccountability(accountabilityWrap, measures));

  // Regulation explorer
  const searchContainer = document.getElementById("gov-location-search");
  createLocationSearch(searchContainer, {
    suggestions: GOVERNMENT_SUGGESTIONS.map((s) => ({ name: s.label })),
    onSelect: (loc) => renderExplorer(explorerWrap, loc.label || loc.name),
  });
  renderExplorer(explorerWrap, "NYC");
}

function scorePercentColor(score) {
  if (score >= 70) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#dc2626";
}

function renderScorecard(wrap, countries) {
  document.getElementById("gov-score-loading").remove();
  wrap.classList.remove("hidden");
  wrap.innerHTML = countries.map((c, i) => {
    const st = STATUS_STYLES[c.status] || { color: "#64748b", bg: "#f1f5f9" };
    const pc = scorePercentColor(c.score);
    return `
      <div class="clima-card clima-card-hover p-5 anim-slide-up anim-delay-${(i % 4) + 1}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl" aria-hidden="true">${c.flag}</span>
            <p class="font-bold text-slate-900">${c.name}</p>
          </div>
          <span class="status-pill" style="background:${st.bg};color:${st.color}"><span class="dot" style="background:${st.color}"></span>${c.status}</span>
        </div>
        <div class="flex items-baseline gap-2 mb-2">
          <span class="text-4xl font-extrabold" style="color:${pc}">${c.score}</span>
          <span class="text-slate-400 text-sm">/ 100</span>
        </div>
        <p class="text-xs text-slate-500 mb-3"><strong class="text-slate-700">Target:</strong> ${c.target}</p>
        <div class="progress-track mb-1"><div class="progress-fill" style="width:${c.score}%;background:${pc};--progress-value:${c.score}%"></div></div>
        <p class="text-xs font-medium text-slate-400 mb-2 mt-2">${c.score}% toward target</p>
        <p class="text-xs text-slate-500 leading-relaxed">${c.notes}</p>
      </div>`;
  }).join("");
}

function renderExplorer(wrap, location) {
  wrap.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <h2 class="text-xl font-bold text-slate-900">Global Regulation Explorer</h2>
      <p class="text-sm text-slate-500">Exploring <span class="font-semibold text-slate-700" data-explorer-loc>${location}</span></p>
    </div>
    <div data-explorer-content>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-policy-col></div>
        <div data-init-col></div>
      </div>
    </div>
  `;

  const content = wrap.querySelector("[data-explorer-content]");
  showLoading(content, true);
  getPolicies(location).then((policies) => {
    try {
      wrap.querySelector("[data-explorer-loc]").textContent = location;
      renderPolicies(content.querySelector("[data-policy-col]"), location, policies);
      renderInitiatives(content.querySelector("[data-init-col]"), location);
      showLoading(content, false);
    } catch (e) {
      showLoading(content, false);
      showError(content, "Unable to load regulations.", () => renderExplorer(wrap, location));
    }
  });
}

function renderPolicies(wrap, location, policies) {
  wrap.innerHTML = `
    <div class="clima-card p-6 h-full">
      <h3 class="section-title mb-4">Active Local Climate Policies</h3>
      <div class="space-y-3">
        ${policies.map((p) => {
          const st = STATUS_STYLES[p.status] || { color: "#64748b", bg: "#f1f5f9" };
          return `
            <div class="border border-slate-100 rounded-xl p-4">
              <div class="flex items-start justify-between gap-2">
                <p class="font-bold text-slate-800 text-sm">${p.name}</p>
                <span class="status-pill shrink-0" style="background:${st.bg};color:${st.color}"><span class="dot" style="background:${st.color}"></span>${p.status}</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">${p.jurisdiction} · ${p.category} · ${p.year}</p>
              <p class="text-sm text-slate-500 mt-2">${p.summary}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                <div class="bg-slate-50 rounded-lg p-2"><strong class="text-slate-600">Scope:</strong> <span class="text-slate-500">${p.scope}</span></div>
                <div class="bg-slate-50 rounded-lg p-2"><strong class="text-slate-600">Target:</strong> <span class="text-slate-500">${p.target}</span></div>
              </div>
              <p class="text-xs text-slate-500 mt-2"><strong class="text-slate-600">Penalties:</strong> ${p.penalties}</p>
            </div>`; }).join("")}
      </div>
    </div>
  `;
}

function renderInitiatives(wrap, location) {
  const initiatives = [
    { name: `${location} Industrial Emission Cap`, category: "Industrial", status: "On Track", summary: `Binding emission caps on large stationary emitters in ${location} with declining allowances.` },
    { name: "Green Procurement Policy", category: "Public", status: "Advisory", summary: `Municipal purchasing preference for low-emission goods and renewable energy in ${location}.` },
    { name: "Retrofit Acceleration Fund", category: "Buildings", status: "Pending", summary: `Grants to accelerate energy retrofits across aging building stock in ${location}.` },
  ];
  const st = (s) => STATUS_STYLES[s] || { color: "#64748b", bg: "#f1f5f9" };
  wrap.innerHTML = `
    <div class="clima-card p-6 h-full">
      <h3 class="section-title mb-4">Industrial Initiatives</h3>
      <div class="space-y-3">
        ${initiatives.map((i) => {
          const c = st(i.status);
          return `
            <div class="border border-slate-100 rounded-xl p-4">
              <div class="flex items-start justify-between gap-2">
                <p class="font-bold text-slate-800 text-sm">${i.name}</p>
                <span class="status-pill shrink-0" style="background:${c.bg};color:${c.color}"><span class="dot" style="background:${c.color}"></span>${i.status}</span>
              </div>
              <p class="text-xs text-slate-400">${i.category} · ${location}</p>
              <p class="text-sm text-slate-500 mt-2">${i.summary}</p>
            </div>`; }).join("")}
      </div>
    </div>
  `;
}

function renderAccountability(wrap, measures) {
  wrap.innerHTML = `
    <h2 class="text-xl font-bold text-slate-900 mb-4">Industrial Accountability</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      ${measures.map((m, i) => `
        <div class="clima-card p-6 anim-slide-up anim-delay-${(i % 2) + 1}">
          <p class="font-bold text-slate-800">${m.name}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="status-pill bg-emerald-50 text-emerald-600"><span class="dot" style="background:#10b981"></span>${m.status}</span>
            <span class="text-xs text-slate-400">${m.jurisdiction}</span>
          </div>
          <p class="text-xs text-slate-500 mt-1"><strong>Target:</strong> ${m.target}</p>
          <p class="text-sm text-slate-500 mt-2 leading-relaxed">${m.summary}</p>
          <div class="bg-slate-50 rounded-lg p-3 mt-3 border border-slate-100">
            <p class="text-xs text-slate-600"><strong class="text-slate-700">Outcome:</strong> ${m.outcome}</p>
          </div>
        </div>`).join("")}
    </div>
  `;
}
