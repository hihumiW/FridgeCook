# 冰箱点菜 Web App

一个本地优先的 MVP。当前阶段只搭建项目框架，页面与业务实现后续再生成。

## 技术栈

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- React Router
- Zustand
- Framer Motion
- LocalStorage

## 本地启动

```bash
pnpm install
pnpm dev
```

当前开发地址：

```txt
http://localhost:5173/
```

## 路由

```txt
/              首页 / 今日点菜页
/ingredients   临时食材选择页
/seasonings    调料库管理页
/results       AI 生成结果页
/recipe/:id    菜谱详情页
```

## 目录结构

```txt
src/
  app/          App 级路由配置
  components/   布局组件与后续通用组件
  lib/          工具函数
  styles/       Tailwind 全局样式
```

## 当前实现策略

MVP 暂时全部本地实现。当前只保留可运行工程、基础路由、样式配置和目录约定；具体页面、状态管理、mock 数据、AI 接口替换点后续再补。
