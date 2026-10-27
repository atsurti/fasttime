# AGENTS.md

Fastline is a single-screen, offline-first React + Vite PWA with no backend. See README.md.

- Keep it serverless: state lives in `localStorage` via `src/lib/fasting.js`; don't add accounts or network calls.
- Put fasting logic in `src/lib/fasting.js` so the ring, weekly summary and history stay consistent.
- Every asset must be bundled (no CDN fonts/scripts) so the service worker can cache it for offline use.
- After changing `public/icon.svg`, run `npm run icons`.
- Verify with `npm run build && npm run preview`, and `npm run lint`.
