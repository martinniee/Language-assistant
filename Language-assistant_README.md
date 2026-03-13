# Language Assistant

本项目基于 React + TypeScript + Vite 脚手架，旨在开发一个集成 Obsidian 插件与 SQLite 数据库的单词管理工具。

## 启动开发环境

```bash
npm run dev
```

## 功能规划

-   单词管理 CRUD
-   SQLite 数据存储
-   Obsidian 插件集成

## 目录结构

-   `src/`：前端源代码
-   `public/`：静态资源

## 插件开发说明

本项目已集成 Obsidian 插件开发环境：

-   插件主入口：`src/obsidian-plugin.ts`
-   依赖：已安装 `obsidian` 类型依赖
-   可在 `obsidian-plugin.ts` 中编写插件主逻辑

如需打包为 Obsidian 插件，请参考官方文档或后续集成说明。

## 后续计划

-   集成 Obsidian 插件 API
-   集成 SQLite 数据库
