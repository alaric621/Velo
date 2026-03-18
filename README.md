# velo ⚡

`velo` 是一个基于配置驱动的脚手架 CLI。首次运行时会自动在用户配置目录生成配置文件，随后优先读取用户配置；如果你显式传入配置路径，也会优先使用该路径。通过交互选择模板后按顺序执行：

1. `pre` hook（预检）
2. `run` 任务队列（按顺序执行 `copy` / `shell`）
3. `post` hook（初始化动作）

## 配置加载顺序 📚

1. `velo --config /path/to/config.json`
2. `VELO_CONFIG_PATH=/path/to/config.json velo`
3. 用户配置文件
4. 首次运行时由内置默认配置自动初始化用户配置文件

默认用户配置位置：

- Linux: `~/.config/velo/config.json`
- macOS: `~/Library/Application Support/velo/config.json`
- Windows: `%APPDATA%\\velo\\config.json`

## 当前默认配置模板 🧩

内置默认模板文件：`src/config/velo.json`

```json
[
  {
    "title": "vue-core",
    "description": "Vue 基础核心",
    "include": ["router", "pinia"],
    "run": [
      { "type": "copy", "paths": ["./mock_templates/core"] },
      { "type": "shell", "command": "echo '--- [POST] 正在安装 Vue 核心依赖 ---'", "description": "基础安装" }
    ],
    "hook": [{ "event": "pre", "command": "echo '--- [PRE] 检查 Node 环境 ---'", "description": "环境预检" }]
  },
  {
    "title": "router",
    "description": "路由插件",
    "run": [
      { "type": "copy", "paths": ["./mock_templates/router"] },
      { "type": "shell", "command": "echo '--- [POST] 配置路由表 ---'", "description": "路由初始化" }
    ]
  },
  {
    "title": "pinia",
    "description": "状态管理",
    "run": [
      { "type": "shell", "command": "echo '--- [POST] 安装 Pinia 并创建 Store ---'", "description": "状态机初始化" }
    ]
  },
  {
    "title": "error-test",
    "description": "故障模拟",
    "hook": [
      { "event": "pre", "command": "non-existent-command-123", "description": "故意报错的预检" }
    ]
  }
]
```

说明：
- 选择 `vue-core` 后，会出现 `router` 和 `pinia` 的子模块选择（默认多选，可通过 `single: true` 配置为单选）。
- `error-test` 用于验证熔断逻辑，`pre` 失败会直接终止流程。

## 配置字段 🛠️

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `title` | `string` | 是 | 模板唯一标识。 |
| `description` | `string` | 否 | 交互菜单中的提示信息。 |
| `include` | `string[]` | 否 | 子模块标题列表；在交互中递归选择。 |
| `single` | `boolean` | 否 | `include` 的选择方式；默认 `false`(多选)，`true` 为单选并支持“跳过”。 |
| `run` | `{ type, ... }[]` | 否 | 任务队列，支持 `type: "copy"`（`paths` 必填）和 `type: "shell"`（`command` 必填）。 |
| `hook` | `{ event, command, description? }[]` | 否 | 命令钩子，`event` 仅支持 `pre` 或 `post`。 |

## 运行方式 🚀

安装依赖：

```bash
pnpm install
```

构建：

```bash
pnpm run build
```

本地执行 CLI：

```bash
node dist/index.js
```

全局链接后执行：

```bash
pnpm link --global
velo
```

指定自定义配置：

```bash
velo --config ./velo.config.json
```

初始化默认配置：

```bash
velo config init
velo config init --force
```

编辑配置：

```bash
velo config edit
```

## 发布产物与安装 📦

每次 `main` 分支更新后会生成一个 dev 预发布，并自动附带以下安装包：

- Linux: `velo_<tag>_linux_amd64.deb`
- macOS: `velo_<tag>_darwin_universal.tar.gz`
- Windows: `velo_<tag>_windows_x64.exe`
- Windows: `velo_<tag>_windows_x64.zip`

下载入口 🔗：

- GitHub Releases: `https://github.com/alaric621/Velo/releases`

如果需要从 GitHub Packages 安装 npm 包，可使用：

```bash
npm i -g @alaric621/velo
```

## 项目结构 🗂️

```text
velo/
├── src/
│   ├── index.ts            # CLI 入口
│   ├── prompts.ts          # 交互式模板/子模块选择
│   ├── engine.ts           # hook 执行与 run 任务逻辑
│   ├── types.ts            # 配置类型定义
│   └── config/velo.json    # 默认配置
├── dist/                   # 编译产物
├── tests/                  # 测试
└── .github/workflows/      # CI / Release 工作流
```

## License 📄

MIT
