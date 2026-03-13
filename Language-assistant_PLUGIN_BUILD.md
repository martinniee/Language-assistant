# Obsidian Language Assistant 插件打包说明

1. 入口文件：manifest.json
2. 插件主文件：main.js（由 TypeScript 源码编译而来）
3. manifest.json 示例已生成。

## 构建 main.js

推荐使用 esbuild 或 tsc 进行 TypeScript -> JS 打包：

### 使用 esbuild

```bash
npx esbuild src/obsidian-plugin.ts --bundle --outfile=main.js --platform=node --format=cjs --target=es2020
```

### 使用 tsc

```bash
npx tsc src/obsidian-plugin.ts --outDir . --module commonjs --target es2020 --esModuleInterop
# 然后将输出的 obsidian-plugin.js 重命名为 main.js
```

## 插件目录结构

-   manifest.json
-   main.js

将这两个文件放入 Obsidian 插件目录即可加载。
