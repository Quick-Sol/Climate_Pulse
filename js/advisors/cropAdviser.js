/**
 * ClimaPulse — Crop Adviser (AI farming assistant)
 *
 * Chat interface with text input, multiple image upload with FileReader
 * previews, and a demo AI that responds to farming keywords.
 */

import { iconMarkup } from "../navigation.js";

const UPLOADED_IMAGES = [];

export default function initCropAdviser() {
  const container = document.getElementById("crop-adviser-root");

  container.innerHTML = `
    <div class="clima-card flex flex-col h-[75vh] overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex items-center gap-3">
        <span class="w-11 h-11 rounded-xl hero-card-gradient-sky flex items-center justify-center text-emerald-600">${iconMarkup("leaf", 24)}</span>
        <div>
          <p class="font-bold text-slate-900">Crop Adviser</p>
          <p class="text-xs text-slate-500">Upload photos or describe crop issues · Demo AI</p>
        </div>
      </div>

      <div class="chat-container">
        <div class="chat-scroll" id="crop-chat-scroll" aria-live="polite"></div>
        <div class="chat-input-bar">
          <div class="flex flex-wrap gap-2" id="crop-previews"></div>
          <div class="chat-input-row">
            <label class="icon-btn" title="Upload images" aria-label="Upload crop images">
              ${iconMarkup("image", 22)}
              <input type="file" id="crop-file" accept="image/*" multiple hidden>
            </label>
            <input type="text" id="crop-input" class="form-input" placeholder="Describe your crop issue or type a question…" aria-label="Describe crop issue">
            <button class="btn btn-primary" id="crop-send" aria-label="Send message">${iconMarkup("send", 18)}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const chatScroll = container.querySelector("#crop-chat-scroll");
  const input = container.querySelector("#crop-input");
  const sendBtn = container.querySelector("#crop-send");
  const fileInput = container.querySelector("#crop-file");
  const previewsWrap = container.querySelector("#crop-previews");

  // File upload
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      const id = "img-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
      reader.onload = (ev) => {
        UPLOADED_IMAGES.push({ id, name: file.name, dataUrl: ev.target.result });
        renderPreview(id, ev.target.result, file.name);
      };
      reader.readAsDataURL(file);
    });
    fileInput.value = "";
  });

  function renderPreview(id, dataUrl, name) {
    const card = document.createElement("div");
    card.className = "image-preview-card anim-scale-in";
    card.dataset.previewId = id;
    card.style.width = "5.5rem";
    card.innerHTML = `
      <img src="${dataUrl}" alt="${name}" class="w-full h-20 object-cover">
      <button type="button" class="remove-image" aria-label="Remove image ${name}">${iconMarkup("x", 14)}</button>
    `;
    card.querySelector(".remove-image").addEventListener("click", () => {
      const idx = UPLOADED_IMAGES.findIndex((i) => i.id === id);
      if (idx >= 0) UPLOADED_IMAGES.splice(idx, 1);
      card.remove();
    });
    previewsWrap.appendChild(card);
  }

  // Send
  const doSend = () => {
    const text = input.value.trim();
    if (!text) return;
    const attachments = [...UPLOADED_IMAGES];
    const attachCopy = attachments.map((a) => `![${a.name}](${a.dataUrl})`).join("\n");
    UPLOADED_IMAGES.length = 0;
    previewsWrap.innerHTML = "";
    input.value = "";
    addUserMessage(text, attachCopy);
    const typingEl = addTyping();
    setTimeout(() => {
      typingEl.remove();
      const reply = generateCropReply(text);
      addBotMessage(reply);
      chatScroll.scrollTop = chatScroll.scrollHeight;
    }, 700 + Math.random() * 800);
  };
  sendBtn.addEventListener("click", doSend);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSend(); });

  addBotMessage(`🌾 Welcome to the **Crop Adviser**.

I can help diagnose common crop issues. Describe what you're seeing (for example: *"yellow leaves on tomatoes"*), or upload photos and ask a question.

Try keywords like **yellow leaves**, **brown spots**, **aphids**, **fungus**, **wilting**, **water stress**, or **nitrogen deficiency**.`);

  function addUserMessage(text, images) {
    const msg = document.createElement("div");
    msg.className = "chat-msg user anim-slide-up";
    const imgHtml = images ? `<div class="flex flex-wrap gap-1.5 max-w-full">${images.split("\n").map((i) => `<img src="${i.match(/\]\((.*)\)/)[1]}" class="w-16 h-16 object-cover rounded-lg border" alt="Uploaded crop image">`).join("")}</div>` : "";
    msg.innerHTML = `<div class="chat-bubble">${escapeText(text)}${imgHtml}</div><span class="chat-time">${now()}</span>`;
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

  function generateCropReply(text) {
    const t = text.toLowerCase();

    if (t.includes("yellow") || t.includes("nitrogen")) {
      return cropResponse("Nitrogen Deficiency / Yellowing", "Moderate", [
        "Immediate treatment: apply a balanced nitrogen fertilizer (e.g., urea or ammonium sulfate) at label-recommended rates.",
        "Organic solution: side-dress with composted manure, blood meal, or fish emulsion.",
        "Chemical solution: use a foliar nitrogen spray (2% urea) for rapid green-up.",
        "Dosage guidance: 1–2 kg nitrogen per 100 m², split into two applications to avoid burn.",
        "Prevention: rotate crops, maintain soil organic matter, and test soil nitrogen annually.",
        "Contact an agricultural extension expert if yellowing persists after correction or spreads rapidly.",
      ]);
    }
    if (t.includes("brown spot") || t.includes("blight") || t.includes("fungus")) {
      return cropResponse("Fungal Leaf Spot / Blight", "Moderate", [
        "Immediate treatment: remove and destroy affected leaves; improve air circulation around plants.",
        "Organic solution: apply a copper-based or sulfur fungicide at the first sign of spread.",
        "Chemical solution: use a labeled systemic fungicide (e.g., chlorothalonil) at recommended intervals.",
        "Dosage guidance: follow label rates—typically 1.5–2 g/L—and reapply every 7–14 days during wet weather.",
        "Prevention: avoid overhead watering, space plants properly, and rotate crops away from solanaceous hosts.",
        "Contact an expert if lesions spread to stems/fruit or if >30% of foliage is affected.",
      ]);
    }
    if (t.includes("aphid")) {
      return cropResponse("Aphid Infestation", "Low to Moderate", [
        "Immediate treatment: strong water spray to dislodge colonies; introduce or conserve natural predators.",
        "Organic solution: apply insecticidal soap or neem oil, coating undersides of leaves thoroughly.",
        "Chemical solution: use a low-impact insecticide (e.g., pyrethrin) only if infestation is severe.",
        "Dosage guidance: follow label—commonly 1–2% solution—and reapply weekly until controlled.",
        "Prevention: monitor weekly, use reflective mulch, and encourage ladybirds/lacewings.",
        "Contact an expert if aphids persist or virus symptoms (stunted, mottled growth) appear.",
      ]);
    }
    if (t.includes("wilt") || t.includes("wilting")) {
      return cropResponse("Wilting / Water Stress or Vascular Wilt", "Moderate", [
        "Immediate treatment: check soil moisture; irrigate deeply if dry, or improve drainage if waterlogged.",
        "Organic solution: mulch to retain moisture; apply compost tea to support root health.",
        "Chemical solution: treat confirmed fungal wilts (e.g., fusarium) with labeled fungicides or soil fumigants.",
        "Dosage guidance: irrigate 25–40 mm per week depending on crop; adjust to avoid overwatering.",
        "Prevention: choose tolerant varieties, amend soil with organic matter, and rotate crops.",
        "Contact an expert if whole-plant wilting persists despite water correction (may indicate disease).",
      ]);
    }
    if (t.includes("water") || t.includes("stress") || t.includes("drought")) {
      return cropResponse("Water Stress / Drought", "Moderate to High", [
        "Immediate treatment: prioritize deep irrigation at the root zone during early morning or evening.",
        "Organic solution: apply mulch and increase soil organic matter to improve moisture retention.",
        "Chemical solution: consider anti-transpirant coatings or soil wetting agents per label.",
        "Dosage guidance: monitor soil moisture; irrigate to field capacity (about 25–40 mm) as needed.",
        "Prevention: install drip irrigation, plant drought-tolerant cultivars, and use deficit irrigation.",
        "Contact an expert if crops show permanent leaf scorch or prolonged stress affecting yield.",
      ]);
    }
    if (t.includes("hello") || t.includes("hi ") || t === "hi" || t.includes("help")) {
      return "Hi! I'm your **Crop Adviser**. Describe a symptom (e.g., *\"yellow leaves\"*, *\"brown spots\"*, *\"aphids\"*) or upload a photo and ask a question. I'll provide identification, severity, and recommended actions.";
    }
    return cropResponse("General Crop Assessment", "Low", [
      "Immediate treatment: inspect plants regularly for pests, disease, and moisture stress.",
      "Organic solution: maintain balanced fertility through compost and crop rotation.",
      "Chemical solution: apply pesticides/fungicides only after confirming the specific issue.",
      "Dosage guidance: always follow product labels and local application regulations.",
      "Prevention: healthy soil, proper spacing, and resistant varieties prevent most problems.",
      "Contact a local agricultural extension agent for species-specific guidance.",
    ]);
  }

  function cropResponse(issue, severity, actions) {
    return `## Crop Identification\nBased on your description, I've assessed the crop condition.\n\n## Diagnosed Issue\n**${issue}**\n\n## Severity\n**${severity}**\n\n## Recommended Actions\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\n---\n*This is a demonstration response. For precise diagnosis, consult an agronomist and provide clear photos.*`;
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
