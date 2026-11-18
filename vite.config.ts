import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only: the browser talks to /api on the Vite server, which forwards to Spring Boot.
// Same origin from the browser's view, so no CORS config is needed yet.
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                rewrite: (path) => path.replace(/^\/api/, ""),
                configure: (proxy) => {
                    proxy.on("proxyReq", (proxyReq) =>
                        console.log("[proxy]", proxyReq.method, proxyReq.host, proxyReq.path),
                    );
                },

            },
        },
    },
});
