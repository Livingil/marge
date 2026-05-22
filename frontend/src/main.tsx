import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Capacitor } from "@capacitor/core";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { store } from "./app/store";
import "./styles.css";

const isNativeApp = Capacitor.isNativePlatform();
if (!isNativeApp) {
  registerSW({ immediate: true });
}

const appVersion = import.meta.env.VITE_APP_VERSION ?? "dev";
if (typeof window !== "undefined") {
  (window as Window & { __APP_VERSION__?: string }).__APP_VERSION__ = appVersion;
  console.info(
    `[marge] viewport ${window.innerWidth}x${window.innerHeight} outer=${window.outerWidth}x${window.outerHeight} dpr=${window.devicePixelRatio} native=${isNativeApp} platform=${Capacitor.getPlatform()} mq420=${window.matchMedia("(max-width: 420px)").matches} mq640=${window.matchMedia("(max-width: 640px)").matches} portrait=${window.matchMedia("(orientation: portrait)").matches}`
  );
}
console.info(`[marge] app version: ${appVersion}`);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
