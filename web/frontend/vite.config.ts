// web/frontend/vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "#": fileURLToPath(new URL("../../shared", import.meta.url)),
        },
    },
    server: {
        fs: { allow: ["../.."] },
        proxy: { "/api": "http://localhost:8080" },
    },
});