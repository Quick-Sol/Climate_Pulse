/**
 * ClimaPulse — Router
 *
 * Simple hash-based router for a multi-page static app.
 * Provides an API for per-page init functions keyed by page path.
 */

const routes = {};

export function register(page, handler) {
  routes[page] = handler;
}

export function currentPage() {
  const p = window.location.pathname.split("/").pop() || "index.html";
  return p;
}

/**
 * Initialize the router and run the handler for the current page.
 * Uses a small loading transition for SPA-like feel.
 */
export function init() {
  const page = currentPage();
  const handler = routes[page] || routes["404"];
  if (handler) {
    try {
      handler();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Page init error:", e);
    }
  }
}

/**
 * Parse URL query parameters into an object.
 */
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const out = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

/**
 * Navigate to a page (for programmatic navigation).
 */
export function navigate(href) {
  window.location.href = href;
}
