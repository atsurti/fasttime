# FastTime

A phone-first intermittent fasting timer. Log when you finish dinner, then forget about it.

- No account, no server — everything is stored on the phone (`localStorage`, key `fastline.state.v1`).
- Installable to the home screen on Android and iPhone, and works fully offline after the first visit.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve dist/ to test the offline/installable build
```

## Install on a phone

The app must be served over **HTTPS** (any static host: Netlify, Vercel, Cloudflare Pages, GitHub Pages). Upload `dist/`.

- **Android (Chrome):** open the link, tap **Add to home screen** in the app (or ⋮ menu → *Install app*).
- **iPhone (Safari):** open the link, tap **Share → Add to Home Screen**. The home-screen app keeps its
  own storage, separate from Safari, so install before logging.

Updates install themselves in the background and apply the next time the app is opened.

## Code map

- `src/lib/fasting.js` — all fasting maths and storage (the one shared module).
- `src/pages/Home.jsx` — the single screen.
- `src/components/fasting/` — ring, dinner card, start-time adjust, weekly summary, history, settings.
- `src/components/InstallHint.jsx` — dismissible "add to home screen" nudge (hidden once installed).
- `vite.config.js` — PWA setup (manifest + service worker via `vite-plugin-pwa`).
- `public/icon.svg` — source for all app icons; regenerate PNGs with `npm run icons`.

## Android app (with home-screen widget)

The same web app wrapped with [Capacitor](https://capacitorjs.com) in `android/`, plus a native
widget (`android/app/src/main/java/com/alisurti/fasttime/FastWidgetProvider.java`) that counts down
with Android's own Chronometer, so it ticks without the app running. The web app tells the widget
about the current fast through a tiny plugin (`FastWidgetPlugin.java`, called from `src/lib/native.js`).

- **Built by GitHub Actions** (`.github/workflows/android.yml`) on every push to `main`; the signed APK
  is attached to the run as an artifact.
- **Signing key:** `android-signing/` (never committed). GitHub needs two repository secrets:
  `FASTTIME_KEYSTORE_BASE64` (the .jks, base64) and `FASTTIME_KEYSTORE_PASSWORD`.
  Every update must use the same key or it won't install over the existing app.
- After changing web code locally: `npm run android:sync`. Icons: `npm run android:icons`.
