# 组件库工作流程

使用`npm install postcss postcss-preset-env`安装 PostCSS 和所需插件来统一 CSS 环境。

在 defineConfig 中添加 css 参数：

```vite.config.ts
...
import postcssPresetEnv from "postcss-preset-env";
...
  css: {
    postcss: {
      plugins: [postcssPresetEnv()],
    },
  },
...
```

在对比过 lib.json 中的版本号后，将 Components 文件夹复制过去。

## 未来计划

- [ ] 考虑是否统一成 npm 包
