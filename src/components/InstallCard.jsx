import { useState, useSyncExternalStore } from "react";
import {
  subscribe,
  hasPrompt,
  promptInstall,
  isInstalled,
  isDismissed,
  dismiss,
  detectPlatform,
} from "../utils/install";

// One string so React can tell when anything about the install state changes
function getSnapshot() {
  return `${hasPrompt()}|${isInstalled()}|${isDismissed()}`;
}

// Small icons that match what people see in their browser
const ICONS = {
  share: <path d="M12 3v12M8 7l4-4 4 4M5 11v9h14v-9" />,
  add: <path d="M4 4h16v16H4zM12 8v8M8 12h8" />,
  dots: (
    <g fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </g>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  install: <path d="M12 4v11M8 11l4 4 4-4M5 20h14" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
};

function Icon({ name }) {
  return (
    <svg className="install-icon" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const PLATFORMS = {
  ios_safari: {
    tag: "iPhone · Safari",
    steps: [
      <>Tap <b>Share</b> <Icon name="share" /> at the bottom of Safari.</>,
      <>Scroll down and tap <b>Add to Home Screen</b> <Icon name="add" />.</>,
      <>Tap <b>Add</b>. Pretty Sure now opens from your home screen.</>,
    ],
  },
  ios_other: {
    tag: "iPhone",
    steps: [
      <>Tap <b>Share</b> <Icon name="share" /> in the address bar.</>,
      <>Tap <b>Add to Home Screen</b> <Icon name="add" />, then <b>Add</b>.</>,
      <>Not there? Copy the link below and open it in <b>Safari</b>.</>,
    ],
    copy: true,
  },
  android_chrome: {
    tag: "Android",
    steps: [
      <>Tap the <b>three dots</b> <Icon name="dots" /> in the top corner.</>,
      <>Tap <b>Install app</b> <Icon name="install" /> or <b>Add to Home screen</b>.</>,
      <>Tap <b>Install</b>. Pretty Sure appears with your other apps.</>,
    ],
  },
  android_samsung: {
    tag: "Samsung Internet",
    steps: [
      <>Tap the <b>menu</b> <Icon name="menu" /> at the bottom right.</>,
      <>Tap <b>Add page to</b>, then <b>Home screen</b> <Icon name="add" />.</>,
      <>Tap <b>Add</b>.</>,
    ],
  },
  inapp: {
    tag: "In-app browser",
    steps: [
      <>This browser can't install apps. Open the <b>menu</b> <Icon name="dots" />.</>,
      <>Choose <b>Open in Chrome</b> or <b>Open in Safari</b> <Icon name="external" />.</>,
      <>Then come back to this card and follow the steps there.</>,
    ],
    copy: true,
  },
  desktop: {
    tag: "Desktop",
    steps: [
      <>In Chrome or Edge, click the <b>install icon</b> <Icon name="install" /> at the end of the address bar.</>,
      <>No icon? Open the browser menu <Icon name="dots" /> and choose <b>Install Pretty Sure</b>.</>,
    ],
  },
  generic: {
    tag: "Your browser",
    steps: [
      <>Open your browser's menu <Icon name="dots" /> or Share button <Icon name="share" />.</>,
      <>Look for <b>Install app</b> or <b>Add to Home screen</b> <Icon name="add" />.</>,
    ],
  },
};

export default function InstallCard() {
  useSyncExternalStore(subscribe, getSnapshot);
  const [copied, setCopied] = useState("");

  if (isInstalled() || isDismissed()) return null;

  const native = hasPrompt();
  const platform = PLATFORMS[detectPlatform()];

  async function copyLink() {
    const link = window.location.origin + "/";
    try {
      await navigator.clipboard.writeText(link);
      setCopied("Link copied");
    } catch {
      setCopied(`Press and hold to copy: ${link}`);
    }
    setTimeout(() => setCopied(""), 2500);
  }

  return (
    <section className="slip install-card">
      <div className="slip-head">
        <span className="title">Keep the deck on your phone</span>
        {!native && <span className="label">{platform.tag}</span>}
      </div>

      <p className="install-copy">
        Install Pretty Sure to open it from your home screen, full screen,
        even offline.
      </p>

      {native ? (
        <div className="actions">
          <button className="btn solid" type="button" onClick={promptInstall}>
            Install app
          </button>
          <button className="btn" type="button" onClick={dismiss}>
            Not now
          </button>
        </div>
      ) : (
        <>
          <ol className="install-steps">
            {platform.steps.map((step, i) => (
              <li key={i}>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="actions">
            {platform.copy && (
              <button className="btn solid" type="button" onClick={copyLink}>
                Copy app link
              </button>
            )}
            <button className="btn" type="button" onClick={dismiss}>
              Not now
            </button>
            {copied && <span className="install-status">{copied}</span>}
          </div>
        </>
      )}
    </section>
  );
}
