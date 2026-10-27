import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Regenerate the app icons from public/icon.svg with: npm run icons
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: "#08080C" } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: "#08080C" } },
  },
  images: ["public/icon.svg"],
});
