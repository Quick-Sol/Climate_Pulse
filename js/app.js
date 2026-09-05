/**
 * ClimaPulse — Application entry point
 *
 * Boots shared layout (header/footer), initializes the router,
 * and registers page init functions.
 */

import { renderHeader, renderFooter } from "./navigation.js";
import { register, init, currentPage } from "./router.js";
import { toast } from "./toast.js";

async function boot() {
  renderHeader();
  renderFooter();

  const page = currentPage();

  // Prefer a statically-registered handler by importing the page module.
  try {
    const map = {
      "index.html": () => import("./dashboard/dashboard.js"),
      "gases.html": () => import("./gas/gases.js"),
      "gas-detail.html": () => import("./gas/gasDetail.js"),
      "soil.html": () => import("./soil/soil.js"),
      "soil-detail.html": () => import("./soil/soilDetail.js"),
      "water.html": () => import("./water/water.js"),
      "water-detail.html": () => import("./water/waterDetail.js"),
      "government.html": () => import("./government/government.js"),
      "industrial.html": () => import("./industrial/industrial.js"),
      "advisor.html": () => import("./advisors/climateAdvisor.js"),
      "crop-adviser.html": () => import("./advisors/cropAdviser.js"),
      "404.html": () => Promise.resolve({ default: () => {} }),
    };

    let loader = map[page];

    // If the current page isn't a known ClimaPulse page, serve the 404.
    if (!loader && !["", "index.html"].includes(page)) {
      location.replace("404.html");
      return;
    }

    if (loader) {
      const mod = await loader();
      if (mod.default) {
        register(page, mod.default);
      }
    }
  } catch (e) {
    // Module load failure — show a friendly message
    // eslint-disable-next-line no-console
    console.error("Failed to load page module:", e);
    toast.error("Something went wrong loading this page.", "Load Error");
    register(page, () => {});
  }

  init();
}

document.addEventListener("DOMContentLoaded", boot);
