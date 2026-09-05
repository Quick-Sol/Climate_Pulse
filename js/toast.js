/**
 * ClimaPulse — Toast notification system
 */

let container = null;

function getContainer() {
  if (container) return container;
  container = document.createElement("div");
  container.id = "toast-container";
  container.setAttribute("aria-live", "polite");
  document.body.appendChild(container);
  return container;
}

let counter = 0;

export function showToast({ title = "Notification", message = "", type = "info", duration = 3500 } = {}) {
  const wrap = getContainer();
  const id = `toast-${++counter}`;

  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.id = id;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div>
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ""}
    </div>
  `;
  wrap.appendChild(toast);

  const close = () => {
    toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => toast.remove(), 250);
  };

  toast.addEventListener("click", close);

  setTimeout(close, duration);
  return id;
}

export const toast = {
  success: (msg, title = "Success") => showToast({ message: msg, title, type: "success" }),
  error: (msg, title = "Error") => showToast({ message: msg, title, type: "error" }),
  info: (msg, title = "Info") => showToast({ message: msg, title, type: "info" }),
  warning: (msg, title = "Heads up") => showToast({ message: msg, title, type: "warning" }),
};
