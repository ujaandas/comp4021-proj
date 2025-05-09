import { defineConfig } from "vite";

export default defineConfig({
  root: "./src/client",
  build: {
    outDir: "../../public",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/auth": "http://localhost:3000",
      "/leaderboard": "http://localhost:3000",
    },
  },
  assetsInclude: ["**/*.mp3"],
});
