# 🌍 ClimaPulse

**Hyper-Local Climate Intelligence Platform**

ClimaPulse is a complete, production-quality frontend web application for climate, air quality, gas, soil, water, government, and industrial environmental intelligence. It is built with **HTML5, CSS3, Vanilla JavaScript, and Tailwind CSS**, with **Chart.js**, **Lucide-style SVG icons**, and **Marked.js** used only where needed.

> ⚠️ **Phase 1 note:** All data is deterministically simulated for demonstration purposes. The same location always generates consistent mock data via a seeded pseudo-random generator.

---

## ✨ Features

- **Weather Dashboard** — live weather widget, AQI gauge, trend charts (daily/weekly), gas breakdown, climate snapshot, dynamic alert banners, email summary simulation
- **Location System** — browser geolocation with 5s timeout, city/ZIP search with suggestions, fallback to New York, deterministic data per location
- **Gas Intelligence** — pollutant cards + detail pages with Impact Engine, personal & systemic action tabs, policy tracker and subsidies
- **Soil Intelligence** — health indicator cards + localized explorer (pollution risk, regenerative planner, remediation guide, climate resilience)
- **Water Intelligence** — pH / dissolved oxygen / nitrate indicators + detail pages
- **Government Intelligence** — national compliance scorecards, local regulation explorer, industrial accountability
- **Industrial Zones** — summary cards + three zone reports with facility-level emissions and status
- **Climate Advisor** — AI chat with markdown rendering, typing animation, quick suggestions, tool-activity panel
- **Crop Adviser** — AI farming assistant with multi-image upload and FileReader previews
- **Polish** — sticky glass header, responsive/mobile nav, skeletons, error/empty states, toasts, animations, accessibility

---

## 🚀 Getting Started

You can open `index.html` directly, or run a simple local server:

```bash
# Python
python -m http.server 5500

# Node (alternative)
npx serve .
```

Then visit `http://localhost:5500`.

---

## 📁 Project Structure

```text
ClimaPulse/
├── index.html              Dashboard
├── gases.html              Gas Intelligence
├── gas-detail.html         Gas detail (?gas=co|no2|so2|pm25|pm10|co2)
├── soil.html               Soil Intelligence
├── soil-detail.html        Soil detail (?soil=moisture|ph|carbon)
├── water.html              Water Intelligence
├── water-detail.html       Water detail (?water=ph|do|nitrate)
├── government.html         Government Intelligence
├── industrial.html         Industrial Zones
├── crop-adviser.html       Crop Adviser
├── advisor.html            Climate Advisor
├── 404.html
├── css/
│   ├── style.css           Design system & base
│   ├── components.css      Reusable components
│   ├── animations.css      Keyframes & motion
│   └── responsive.css      Responsive rules
├── js/
│   ├── app.js              Entry point / page module loader
│   ├── router.js           Simple router
│   ├── navigation.js       Header/footer/mobile nav + SVG icons
│   ├── utils.js            Helpers (loading, error, email template)
│   ├── seededRandom.js     Deterministic PRNG
│   ├── toast.js            Toast notifications
│   ├── services/           Mock data + domain services
│   ├── dashboard/          Dashboard components
│   ├── gas/                Gas pages
│   ├── soil/               Soil pages
│   ├── water/              Water pages
│   ├── government/         Government page
│   ├── industrial/         Industrial page
│   └── advisors/           AI chat interfaces
├── assets/                 Images / icons (optional)
└── README.md
```

---

## 🧠 Deterministic Mock Data

Same location → stable data:

```
Location Name → Hash Function → Numeric Seed → PRNG → Climate Data
```

Seed logic lives in `js/seededRandom.js` and is used by `js/services/mockData.js`.

---

## 🛠 Tech

- HTML5 + CSS3 + Vanilla JavaScript (ES modules)
- Tailwind CSS (CDN)
- Chart.js (CDN)
- Marked.js (CDN, chat markdown)
- Native browser APIs: Geolocation, LocalStorage-ready, FileReader, Fetch

---

## 📜 License

Demonstration project. © 2026 ClimaPulse. Phase 1 data is simulated for demonstration purposes.
