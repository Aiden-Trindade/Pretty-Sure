// Everything about installing Pretty Sure as an app.
// Ported from PET: use the browser's own install prompt when it offers one,
// otherwise work out the platform and show the right manual steps.

const INSTALLED_KEY = "pretty_sure_installed";
const DISMISSED_KEY = "pretty_sure_install_dismissed";

// localStorage can throw in private or locked-down modes; installing must never break the app
function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // nothing here is user data, so it's fine to lose
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// True when the app is open from the home screen rather than in a browser tab
export function isStandalone() {
  if (window.navigator.standalone === true) return true; // iPhone
  return ["standalone", "fullscreen", "minimal-ui"].some(
    (mode) => window.matchMedia?.(`(display-mode: ${mode})`).matches
  );
}

export function isInstalled() {
  return isStandalone() || safeGet(INSTALLED_KEY) === "1";
}

export function isDismissed() {
  return safeGet(DISMISSED_KEY) === "1";
}

export function dismiss() {
  safeSet(DISMISSED_KEY, "1");
  notify();
}

export function detectPlatform() {
  const ua = navigator.userAgent || "";

  // Social and messenger browsers can't install web apps
  if (/FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|Snapchat|Twitter|TikTok|musical_ly|Bytedance|LinkedInApp|Pinterest|WhatsApp|GSA\/|; wv\)/i.test(ua)) {
    return "inapp";
  }

  // iPadOS reports itself as a Mac
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    if (!/Safari\//.test(ua)) return "inapp"; // iOS web views have no "Safari/" token
    if (/CriOS|FxiOS|EdgiOS|OPiOS|OPT\//.test(ua)) return "ios_other";
    return "ios_safari";
  }

  if (/Android/i.test(ua)) {
    return /SamsungBrowser/i.test(ua) ? "android_samsung" : "android_chrome";
  }

  if (/Windows|Macintosh|Linux|CrOS/.test(ua)) return "desktop";
  return "generic";
}

// ---- The browser's own install prompt ----
// Chrome and Edge fire beforeinstallprompt once, often before React has rendered,
// so it's caught here as soon as this file loads and kept until a button uses it.

let promptEvent = null;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasPrompt() {
  return promptEvent !== null;
}

export async function promptInstall() {
  if (!promptEvent) return false;

  const event = promptEvent;
  promptEvent = null; // a prompt can only be used once
  event.prompt();

  const choice = await event.userChoice.catch(() => null);
  if (choice?.outcome === "accepted") safeSet(INSTALLED_KEY, "1");
  notify();
  return choice?.outcome === "accepted";
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault(); // keep it for our own button instead of the browser's mini bar
  promptEvent = event;
  safeRemove(INSTALLED_KEY); // it only fires when the app isn't installed
  notify();
});

window.addEventListener("appinstalled", () => {
  promptEvent = null;
  safeSet(INSTALLED_KEY, "1");
  notify();
});

window.matchMedia?.("(display-mode: standalone)").addEventListener?.("change", notify);
