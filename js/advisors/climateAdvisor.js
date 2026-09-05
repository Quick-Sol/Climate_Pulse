/**
 * ClimaPulse — Climate Advisor (AI chat interface)
 *
 * Demo AI generates contextual responses using current location,
 * weather, AQI and climate snapshot. Uses Marked.js for rendering.
 */

import { generateClimateData } from "../services/mockData.js";
import { iconMarkup } from "../navigation.js";

const QUICK_SUGGESTIONS = [
  "When is the safest time to exercise outdoors?",
  "I have asthma. What should I consider today?",
  "Create my climate-aware daily activity plan.",
  "Explain today's air quality.",
];

export default function initClimateAdvisor() {
  const container = document.getElementById("advisor-root");
  const location = "New York";
  const data = generateClimateData(location);

  container.innerHTML = `
    <div class="clima-card flex flex-col h-[70vh] overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="w-11 h-11 rounded-xl hero-card-gradient-sky flex items-center justify-center text-sky-600">${iconMarkup("sparkles", 24)}</span>
          <div>
            <p class="font-bold text-slate-900">Climate Advisor</p>
            <p class="text-xs text-slate-500 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500" style="animation:pulseSoft 2s infinite"></span>
              ${location} · Deterministic demo
            </p>
          </div>
        </div>
        <button class="collapsible-toggle w-auto" data-tool-toggle aria-expanded="false" aria-controls="tool-panel">
          <span class="inline-flex items-center gap-1.5">${iconMarkup("activity", 16)} Tool Activity</span>
        </button>
      </div>

      <div class="border-b border-slate-200" style="background:#f8fafc">
        <div id="tool-panel" class="collapsible-panel">
          <div class="p-3 space-y-2 text-xs text-slate-500 font-mono" id="tool-log">
            <div class="flex items-center gap-2"><span class="text-sky-600">→</span> Agent loaded current conditions for ${location}</div>
            <div class="flex items-center gap-2"><span class="text-sky-600">→</span> Retrieved weather, AQI and climate snapshot</div>
          </div>
        </div>
      </div>

      <div class="chat-container">
        <div class="chat-scroll" id="chat-scroll" aria-live="polite"></div>
        <div class="chat-input-bar">
          <div class="flex flex-wrap gap-2" id="quick-suggestions"></div>
          <div class="chat-input-row">
            <input type="text" id="chat-input" class="form-input" placeholder="Ask the Climate Advisor…" aria-label="Message Climate Advisor">
            <button class="btn btn-primary" id="chat-send" aria-label="Send message">${iconMarkup("send", 18)}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const chatScroll = container.querySelector("#chat-scroll");
  const input = container.querySelector("#chat-input");
  const sendBtn = container.querySelector("#chat-send");
  const quickWrap = container.querySelector("#quick-suggestions");
  const toolToggle = container.querySelector("[data-tool-toggle]");
  const toolPanel = container.querySelector("#tool-panel");

  // Quick suggestions
  quickWrap.innerHTML = QUICK_SUGGESTIONS.map((q) => `
    <button class="chip" data-quick>${q}</button>`).join("");
  quickWrap.querySelectorAll("[data-quick]").forEach((b) => {
    b.addEventListener("click", () => sendMessage(b.textContent));
  });

  // Tool activity toggle
  toolToggle.addEventListener("click", () => {
    const open = toolPanel.classList.toggle("open");
    toolToggle.setAttribute("aria-expanded", String(open));
  });

  // Send handlers
  const doSend = () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendMessage(text);
  };
  sendBtn.addEventListener("click", doSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSend();
  });

  addBotMessage(`👋 Hello! I'm your Climate Advisor for **${location}**.

I can help with:
- When to exercise outdoors safely
- Air quality explanations
- Personalized daily activity plans
- Asthma and sensitive-group considerations

Current snapshot: **${data.weather.condition}** at **${Math.round(data.weather.temperature)}°C**, AQI **${data.airQuality.aqi}** (${data.airQuality.category}).`);

  function sendMessage(text) {
    addUserMessage(text);
    logTool(`Processing: "${text}"`);
    const typingEl = addTyping();
    setTimeout(() => {
      typingEl.remove();
      const reply = generateReply(text, data);
      addBotMessage(reply);
      logTool("Response generated from context");
      chatScroll.scrollTop = chatScroll.scrollHeight;
    }, 600 + Math.random() * 700);
  }

  function generateReply(text, d) {
    const t = text.toLowerCase();
    const weather = d.weather;
    const aqi = d.airQuality;

    if (t.includes("exercise") || t.includes("safe") || t.includes("time")) {
      return exerciseReply(weather, aqi);
    }
    if (t.includes("asthma") || t.includes("sensitive")) {
      return asthmaReply(weather, aqi);
    }
    if (t.includes("plan") || t.includes("activity")) {
      return planReply(weather, aqi, d.snapshot);
    }
    if (t.includes("air quality") || t.includes("aqi") || t.includes("pollut")) {
      return aqiReply(aqi);
    }
    if (t.includes("uv") || t.includes("sun")) {
      return `## UV Guidance\n\nCurrent UV index is **${weather.uvIndex}** (${weather.uvLabel}).\n\n- ${weather.uvIndex >= 6 ? "Use SPF 30+ and limit direct sun between 10am–4pm." : "UV is manageable; light protection is still advised."}\n- Wear a hat and sunglasses if outdoors for extended periods.\n\nCheck the dashboard weather widget for live UV updates.`;
    }
    if (t.includes("temperature") || t.includes("temperatur") || t.includes("weather")) {
      return `## Current Weather in ${d.location}\n\n- **Condition:** ${weather.condition}\n- **Temperature:** ${Math.round(weather.temperature)}°C (feels like ${Math.round(weather.feelsLike)}°C)\n- **Humidity:** ${Math.round(weather.humidity)}%\n- **Wind:** ${Math.round(weather.windSpeed)} km/h ${weather.windDirection}\n- **UV:** ${weather.uvIndex} (${weather.uvLabel})\n- **Rain probability:** ${Math.round(weather.rainProbability)}%\n\n${weather.rainProbability >= 70 ? "Rain is likely — carry an umbrella." : "Rain risk is low today."}`;
    }
    return genericReply(d);
  }

  function exerciseReply(weather, aqi) {
    const best = aqi.aqi <= 60 ? "early morning (before 8am)" : aqi.aqi <= 100 ? "mid-afternoon (1–4pm)" : "indoors or overnight";
    return `## Safest Time to Exercise Outdoors\n\nIn current conditions, the **${best}** is generally the safest window.\n\n- **AQI ${aqi.aqi}** (${aqi.category}) — ${aqi.aqi >= 100 ? "this is elevated, so keep exertion light." : "reasonably good for outdoor activity."}\n- **Temperature** ${Math.round(weather.temperature)}°C — ${weather.temperature > 30 ? "stay hydrated and avoid peak heat." : "comfortable for activity."}\n- **UV** ${weather.uvIndex} (${weather.uvLabel}) — ${weather.uvIndex >= 6 ? "plan around peak sun hours." : "low sun risk."}\n- **Wind** ${Math.round(weather.windSpeed)} km/h — calm enough for outdoor sessions.\n\n> Tip: Check the dashboard trend chart for hourly AQI to time your workout around low-pollution hours.`;
  }

  function asthmaReply(weather, aqi) {
    const isBad = aqi.aqi >= 100 || weather.windSpeed >= 30;
    return `## Considerations for Asthma Today\n\nBased on current data in this region:\n\n- **Air Quality:** AQI **${aqi.aqi}** (${aqi.category}) — ${aqi.aqi >= 100 ? "elevated; limit outdoor exertion and keep reliever inhaler handy." : "generally acceptable; monitor for irritation."}\n- **Dominant pollutant:** ${aqi.dominantPollutant}\n- **Weather:** ${weather.condition}, ${Math.round(weather.temperature)}°C, ${Math.round(weather.humidity)}% humidity\n- **Wind:** ${Math.round(weather.windSpeed)} km/h\n\n**${isBad ? "⚠️ Take it easy today:" : "✅ Reasonable day, but:"}**\n1. Prefer indoor exercise when AQI exceeds 100.\n2. Keep windows closed near busy roads and use HEPA filtration.\n3. Carry your reliever inhaler and monitor early symptoms.\n4. If humidity is very high or conditions are windy, pollen/dust may also trigger symptoms.\n\nSeek medical help if symptoms worsen despite medication.`;
  }

  function planReply(weather, aqi) {
    const plan = [];
    plan.push({ t: "6:30 AM", act: weather.aqi <= 60 ? "Outdoor walk or light jog (good AQI window)" : "Indoor stretching / short outdoor errand", note: "AQI " + aqi.aqi });
    plan.push({ t: "9:00 AM", act: "Deep-work block; keep indoor air filtered", note: "Traffic AQI rising" });
    plan.push({ t: "12:30 PM", act: weather.temperature > 30 ? "Light indoor lunch break; hydrate" : "Outdoor lunch / short break", note: "Peak heat" });
    plan.push({ t: "5:00 PM", act: "Evening commute; consider mask if AQI high", note: "Evening traffic peak" });
    plan.push({ t: "7:30 PM", act: weather.uvIndex >= 6 ? "Indoor exercise or gentle evening walk" : "Outdoor activity", note: "UV " + weather.uvIndex });
    plan.push({ t: "10:00 PM", act: "Wind down; ventilate bedrooms from kitchen exhaust", note: "Lower AQI overnight" });
    return `## Climate-Aware Daily Activity Plan\n\nHere's a personalized routine tuned to today's conditions:\n\n| Time | Activity | Note |\n|---|---|---|\n${plan.map((p) => `| **${p.t}** | ${p.act} | ${p.note} |`).join("\n")}\n\n**Key signals:**\n- AQI **${aqi.aqi}** (${aqi.category}) — ${aqi.aqi >= 100 ? "keep exertion light outdoors." : "good for outdoor time."}\n- Temp **${Math.round(weather.temperature)}°C**, UV **${weather.uvIndex}**\n- Rain probability **${Math.round(weather.rainProbability)}%**\n\nStay flexible — adjust based on the live dashboard.`;
  }

  function aqiReply(aqi) {
    const top = aqi.pollutants.slice().sort((a, b) => b.percentage - a.percentage);
    return `## Today's Air Quality Explained\n\n- **AQI:** ${aqi.aqi} — **${aqi.category}**\n- **Dominant pollutant:** ${aqi.dominantPollutant}\n\n**Pollutant breakdown (as % of safe threshold):**\n${top.map((p) => `- **${p.symbol}** (${p.name}): ${p.value} ${p.unit} — ${p.percentage}% → **${p.severity.label}**`).join("\n")}\n\n${aqi.aqi >= 100 ? "**Recommendation:** Reduce outdoor exertion and use filtration indoors, especially for sensitive groups." : "**Recommendation:** Conditions are acceptable; ordinary outdoor activity is fine. Continue monitoring for evening shifts."}`;
  }

  function genericReply(d) {
    return `## Climate Summary for ${d.location}\n\nHere's a snapshot of local conditions:\n\n- **Weather:** ${d.weather.condition}, ${Math.round(d.weather.temperature)}°C (feels ${Math.round(d.weather.feelsLike)}°C)\n- **AQI:** ${d.airQuality.aqi} — ${d.airQuality.category}\n- **Temperature anomaly:** ${d.snapshot.anomaly} vs 20th-century baseline (${d.snapshot.direction})\n\n**${d.snapshot.context}**\n\nI can go deeper on **air quality**, **exercise timing**, **asthma guidance**, or a **full activity plan**. Just ask!`;
  }

  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "chat-msg user anim-slide-up";
    msg.innerHTML = `<div class="chat-bubble">${escapeText(text)}</div><span class="chat-time">${now()}</span>`;
    chatScroll.appendChild(msg);
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }

  function addBotMessage(md) {
    const msg = document.createElement("div");
    msg.className = "chat-msg bot anim-slide-up";
    const rendered = window.marked ? window.marked.parse(md) : escapeText(md);
    msg.innerHTML = `<div class="chat-bubble">${rendered}</div><span class="chat-time">${now()}</span>`;
    chatScroll.appendChild(msg);
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }

  function addTyping() {
    const msg = document.createElement("div");
    msg.className = "chat-msg bot";
    msg.innerHTML = `<div class="chat-bubble"><span class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span></div>`;
    chatScroll.appendChild(msg);
    chatScroll.scrollTop = chatScroll.scrollHeight;
    return msg;
  }

  function logTool(msg) {
    const log = container.querySelector("#tool-log");
    const line = document.createElement("div");
    line.className = "flex items-center gap-2 anim-fade-in";
    line.innerHTML = `<span class="text-sky-600">→</span> ${escapeText(msg)}`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function escapeText(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }
}
