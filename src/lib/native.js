// Bridges to the Android app. In the browser these are all no-ops.
import { Capacitor, registerPlugin } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();

const FastWidget = registerPlugin("FastWidget");

// Tell the home-screen widget about the current fast (or that there isn't one).
// The widget works out "fasting / eating / log dinner" and counts down by itself.
export function syncWidget(entry) {
  if (!isNative) return;
  const payload = entry
    ? { dinnerAt: String(new Date(entry.dinnerAt).getTime()), hours: String(entry.hours) }
    : {};
  FastWidget.update(payload).catch(() => {
    /* no widget support — nothing to do */
  });
}
