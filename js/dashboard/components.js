/**
 * ClimaPulse — Shared UI components
 * Reusable location search + alert banner used across pages.
 */

import { search, getSuggestions, geocode } from "../services/geocodeService.js";
import { iconMarkup } from "../navigation.js";

/**
 * Build a location search input with suggestions + chips.
 * Returns a controller { getValue(), setValue(), onSelect(cb) }.
 * onSelect receives the resolved geocode object.
 */
export function createLocationSearch(container, { value = "", onSelect, suggestions = getSuggestions() } = {}) {
  let input;
  const ctrl = {
    getValue: () => input ? input.value : "",
    setValue: (v) => { if (input) { input.value = v; } },
    onSelect: (cb) => { ctrl._cb = cb; },
  };
  ctrl._cb = onSelect;

  container.innerHTML = `
    <div class="relative" data-search-wrap>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${iconMarkup("search", 18)}</span>
        <input type="search" class="form-input pl-10" placeholder="Search city, ZIP, or location…" aria-label="Search location" data-search-input value="${value}">
      </div>
      <div data-search-suggest class="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden hidden max-h-64 overflow-y-auto"></div>
    </div>
    <div class="flex flex-wrap gap-2 mt-3" data-search-chips></div>
  `;

  input = container.querySelector("[data-search-input]");
  const suggestBox = container.querySelector("[data-search-suggest]");
  const chipsWrap = container.querySelector("[data-search-chips]");

  const showSuggestions = (list) => {
    if (!list.length) {
      suggestBox.classList.add("hidden");
      return;
    }
    suggestBox.innerHTML = list
      .map((s, i) => `
        <button class="w-full text-left px-4 py-2.5 text-sm hover:bg-sky-50 flex items-center justify-between" data-suggest-item="${i}">
          <span class="font-medium text-slate-700">${s.name}</span>
          <span class="text-xs text-slate-400">${s.country || ""}</span>
        </button>`)
      .join("");
    suggestBox.classList.remove("hidden");
    suggestBox.querySelectorAll("[data-suggest-item]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = list[Number(btn.dataset.suggestItem)];
        input.value = item.name;
        suggestBox.classList.add("hidden");
        if (ctrl._cb) ctrl._cb(item);
      });
    });
  };

  input.addEventListener("input", (e) => {
    const q = e.target.value;
    if (!q.trim()) { suggestBox.classList.add("hidden"); return; }
    let results = search(q);
    // Always offer resolving the raw query at top
    if (!results.some((r) => r.name.toLowerCase() === q.trim().toLowerCase())) {
      results = [{ name: q.trim(), country: "Search…", lat: null, lon: null }, ...results];
    }
    showSuggestions(results.slice(0, 6));
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      suggestBox.classList.add("hidden");
      const resolved = resolveQuery(input.value);
      if (ctrl._cb) ctrl._cb(resolved);
    }
  });

  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) suggestBox.classList.add("hidden");
  });

  // Chips
  chipsWrap.innerHTML = (suggestions || [])
    .map((s, i) => `<button type="button" class="chip" data-chip="${i}">${s.name}</button>`)
    .join("");
  chipsWrap.querySelectorAll("[data-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const s = suggestions[Number(chip.dataset.chip)];
      input.value = s.name;
      const resolved = resolveQuery(s.name);
      if (ctrl._cb) ctrl._cb(resolved);
    });
  });

  return ctrl;
}

function resolveQuery(query) {
  return geocode(query);
}

export { resolveQuery };
