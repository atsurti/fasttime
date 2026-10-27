import React, { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

const DISMISS_KEY = "fastline.installHint.dismissed";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function platform() {
  const ua = navigator.userAgent || "";
  const iOS =
    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

// A small, dismissible nudge to put Fastline on the home screen. It never
// shows once the app is running from the home screen.
export default function InstallHint() {
  const [hidden, setHidden] = useState(() => isStandalone() || readDismissed());
  const [promptEvent, setPromptEvent] = useState(null);
  const os = platform();

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden) return null;
  if (!promptEvent && os === "other") return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* fine — it just shows again next time */
    }
    setHidden(true);
  };

  const install = async () => {
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    if (outcome === "accepted") setHidden(true);
  };

  return (
    <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 pr-10 text-center">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-full p-1.5 text-white/30 transition hover:text-white/70"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {promptEvent ? (
        <>
          <p className="text-xs text-white/50">Keep Fastline one tap away.</p>
          <button
            onClick={install}
            className="mt-2 rounded-xl bg-white/10 px-4 py-2 text-xs text-white/90 transition hover:bg-white/20"
          >
            Add to home screen
          </button>
        </>
      ) : os === "ios" ? (
        <>
          <p className="text-xs leading-relaxed text-white/50">
            To install, tap <Share className="mx-0.5 inline h-3.5 w-3.5 -translate-y-px" /> Share in
            Safari, then <span className="text-white/80">Add to Home Screen</span>.
          </p>
          <p className="mt-1 text-[11px] text-white/30">
            The home-screen app keeps its own data, so install it before you start logging.
          </p>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-white/50">
          To install, open the browser menu <span className="text-white/80">⋮</span> and choose{" "}
          <span className="text-white/80">Add to Home screen</span>.
        </p>
      )}
    </div>
  );
}
