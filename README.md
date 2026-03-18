# 🚀 velo

**velo** 是一个轻量级、面向配置的项目脚手架引擎。它不仅支持基础的项目克隆，更通过 **原子化嵌套 (Atomic Composition)** 和 **双钩子系统 (Pre/Post Hooks)**，让你像搭积木一样构建复杂的开发环境。



---

## ✨ 核心特性

* **💅 优雅交互**：基于 `@clack/prompts`，提供丝滑的终端动画与交互体验。
* **🧩 原子化嵌套**：支持 `include` 字段，实现配置片段的复用（如：`git-init` + `pnpm-install` = `base-project`）。
* **⚡️ 双钩子系统**：
    * **Pre-Hook**: 环境预检、清理旧文件，失败即熔断，保护磁盘。
    * **Post-Hook**: 依赖安装、自动构建、初始化 Git，交付即运行。
* **📂 智能路径**：自动解析 `~/` 用户目录，跨设备无缝同步配置。
* **🛡️ 类型安全**：全量使用 TypeScript 编写，支持现代 ESM 模块。

---

## 📦 安装与运行

### 1. 安装依赖
```bash
pnpm install
```

### 2. 编译并运行
```bash
# 开发模式
npx tsx src/index.ts

# 编译并链接到全局
npm run build && npm link
```

---

## 🛠️ 配置指南 (`scaffold.json`)

velo 的强大之处在于其 **原子化设计**。建议将通用动作定义为 `atom:` 开头的模板：

```json
[
  {
    "title": "atom:git-init",
    "hook": [{ "event": "post", "command": "git init && git add .", "description": "初始化 Git 仓库" }]
  },
  {
    "title": "atom:pnpm-install",
    "hook": [{ "event": "post", "command": "pnpm install", "description": "执行依赖安装" }]
  },
  {
    "title": "H5-Vant-Template",
    "description": "Vue3 + Uniapp + Vant 移动端全功能模板",
    "include": [
      "atom:git-init", 
      "atom:pnpm-install"
    ],
    "copy": ["~/templates/uniapp-h5"],
    "hook": [
      { "event": "pre", "command": "node -v", "description": "环境预检" },
      { "event": "post", "command": "echo '🚀 项目已准备就绪！'", "description": "输出成功提示" }
    ]
  }
]
```

---

## 📖 配置字段详解

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `title` | `string` | 是 | 模板唯一标识。以 `atom:` 开头将不会出现在选择菜单中。 |
| `description` | `string` | 否 | 模板的详细描述，显示在菜单旁。 |
| `include` | `string[]` | 否 | 需要引用的其他配置 `title` 列表，支持多层嵌套。 |
| `copy` | `string[]` | 否 | 需要复制的源目录路径（支持 `~`）。 |
| `hook` | `Object[]` | 否 | 包含 `event` (pre/post), `command` 和 `description`。 |

---

## 🏗️ 项目架构

```text
velo/
├── src/
│   ├── index.ts      # CLI 交互与核心调度逻辑
│   └── parser.ts     # 递归解析 include 的扁平化引擎
├── dist/             # 编译产物
├── tsconfig.json     # TS 配置 (NodeNext 模式)
└── package.json      # 项目元数据与依赖
```

---

## 📝 许可证

MIT © 2026 YourName

---
