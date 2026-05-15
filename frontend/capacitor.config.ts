import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ru.marge.game",
  appName: "Лаборатория Синтеза",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    androidScheme: "http"
  }
};

export default config;

