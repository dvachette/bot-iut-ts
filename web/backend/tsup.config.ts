import { defineConfig } from "tsup";
import path from "node:path";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs"],
    minify: true,
    esbuildOptions(options) {
        options.alias = {
            "@": path.resolve(__dirname, "src"),
            "#": path.resolve(__dirname, "../../shared"),
        };
    },
});