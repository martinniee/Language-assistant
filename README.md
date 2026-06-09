# Language Assistant

Language Assistant 是一个 Obsidian 单词管理插件，使用 React + TypeScript 构建界面，并将词库数据保存到 Markdown 文件中。

## 项目结构

```text
.
├── src/                  # 插件源码
├── docs/                 # agent 说明文档、功能报告、使用指南和历史记录
├── manifest.json         # Obsidian 插件清单
├── main.js               # 打包后的插件入口
├── styles.css            # 插件样式
├── words.md              # 默认词库数据文件
├── data.json             # Obsidian 插件保存的本地设置
├── package.json          # 构建脚本和依赖
└── tsconfig*.json        # TypeScript 配置
```

根目录只保留运行、构建和入口说明所需文件。功能说明、修复报告、测试记录、使用指南等 agent 生成或辅助性文档统一放在 [docs](./docs/) 下。

## 核心功能

- 单词增删改查和详情管理
- Markdown 词库读写
- 自定义词库文件路径
- 词性、标签、分类、等级等元数据管理
- 间隔重复学习
- 数据统计
- 导入导出

## 开发

安装依赖：

```bash
npm install
```

类型检查：

```bash
npx tsc --noEmit -p tsconfig.app.json
```

构建 Obsidian 插件：

```bash
npm run build-app
```

## 入口文件

- 插件入口：[src/obsidian-plugin.ts](./src/obsidian-plugin.ts)
- React 主应用：[src/MainApp.tsx](./src/MainApp.tsx)
- Markdown 存储：[src/MarkdownWordStorage.ts](./src/MarkdownWordStorage.ts)
- 单词管理视图：[src/WordManagerMarkdownNew.tsx](./src/WordManagerMarkdownNew.tsx)

## 文档

查看 [docs/README.md](./docs/README.md) 获取完整文档索引。
