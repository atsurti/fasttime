import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/fraunces/opsz.css";
import "@/index.css";
import Home from "@/pages/Home";
import { isNative } from "@/lib/native";

// Offline caching is for the web version; the Android app already has
// everything built in.
if (!isNative) {
  import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true }));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
