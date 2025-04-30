import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";
import postcssPresetEnv from "postcss-preset-env";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons-ng";
import path from "node:path";
import prismjs from "vite-plugin-prismjs";

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/icons")],
    }),
    prismjs({
      languages: "all",
    }),
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
  css: {
    postcss: {
      plugins: [postcssPresetEnv()],
    },
  },
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
