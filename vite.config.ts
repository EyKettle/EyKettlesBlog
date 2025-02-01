import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";

export default defineConfig({
  plugins: [
    devtools({
      autoname: true,
      locator: {
        targetIDE: "vscode",
        componentLocation: true,
        jsxLocation: true,
      },
    }),
    solidPlugin(),
  ],
  server: {
    port: 3000,
    hmr: {
      overlay: false,
      protocol: "ws",
      host: "localhost",
      port: 3001,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    fs: {
      strict: true,
      allow: [".."],
    },
    middlewareMode: false,
  },
  build: {
    target: "esnext",
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      "solid-js",
      "solid-markdown > micromark",
      "solid-markdown > unified",
    ],
    exclude: [],
  },
});
