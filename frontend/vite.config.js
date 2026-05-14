import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "android/launchericon-192x192.png",
                "android/launchericon-512x512.png",
                "ios/180.png",
                "ios/152.png"
            ],
            manifest: {
                name: "Лаборатория Синтеза",
                short_name: "ЛабСинтез",
                description: "Лаборатория синтеза: merge + idle",
                theme_color: "#0f172a",
                background_color: "#f8fafc",
                display: "standalone",
                icons: [
                    {
                        src: "/android/launchericon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any"
                    },
                    {
                        src: "/android/launchericon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any"
                    },
                    {
                        src: "/android/launchericon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable"
                    }
                ]
            }
        })
    ]
});
