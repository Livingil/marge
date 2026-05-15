import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { store } from "./app/store";
import "./styles.css";

registerSW({ immediate: true });

const appVersion = import.meta.env.VITE_APP_VERSION ?? "dev";
if (typeof window !== "undefined") {
  (window as Window & { __APP_VERSION__?: string }).__APP_VERSION__ = appVersion;
}
console.info(`[marge] app version: ${appVersion}`);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
