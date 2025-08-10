# 组件库工作流程

## 前置包

- `pnpm i postcss postcss-preset-env`
- `pnpm i -d vite-plugin-svg-icons-ng`
- `pnpm i -d prismjs @types/prismjs vite-plugin-prismjs`

## 修改配置

```vite.config.ts
// ...
import postcssPresetEnv from "postcss-preset-env";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons-ng";
import path from "node:path";
import prismjs from "vite-plugin-prismjs";
// 添加引用

export default defineConfig({
  // ...
  plugin: [
    createSvgIconsPlugin({            // 添加
      iconDirs: [path.resolve(process.cwd(), "src/icons")],
    }),
    prismjs({
      languages: "all", // 或者 ["json", "typescript", ...]
    }),
    // ...
  ]
  css: {                              // 添加
    postcss: {
      plugins: [postcssPresetEnv()],
    },
  },
  // ...
})
```

```tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["vite-plugin-svg-icons-ng/client"], // 添加 "vite-plugin-svg-icons-ng/client"
    // ...
  }
}
```

```index.tsx
// ...
import "virtual:svg-icons/register";
// ...
```

> [SVG Sprite](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/zh/)

在对比过 lib.json 中的版本号后，将 Components 文件夹复制过去。
