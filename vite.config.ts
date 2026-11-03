import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      input: ["index.html", "name.html"],
    },
  },
  test: {
    environment: "happy-dom",
  },
});
