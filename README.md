# velo

`velo` 是一个基于配置驱动的脚手架 CLI。当前项目默认读取 [`src/config/velo.json`](src/config/velo.json)，通过交互选择模板后按顺序执行：

1. `pre` hook（预检）
2. `copy`（复制模板文件到当前目录）
3. `post` hook（初始化动作）

## 当前内置配置

配置文件：`src/config/velo.json`

```json
[
  {
    "title": "vue-core",
    "description": "Vue 基础核心",
    "include": ["router", "pinia"],
    "copy": ["./mock_templates/core"],
    "hook": [
      { "event": "pre", "command": "echo '--- [PRE] 检查 Node 环境 ---'", "description": "环境预检" },
      { "event": "post", "command": "echo '--- [POST] 正在安装 Vue 核心依赖 ---'", "description": "基础安装" }
    ]
  },
  {
    "title": "router",
    "description": "路由插件",
    "copy": ["./mock_templates/router"],
    "hook": [
      { "event": "post", "command": "echo '--- [POST] 配置路由表 ---'", "description": "路由初始化" }
    ]
  },
  {
    "title": "pinia",
    "description": "状态管理",
    "hook": [
      { "event": "post", "command": "echo '--- [POST] 安装 Pinia 并创建 Store ---'", "description": "状态机初始化" }
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
- 选择 `vue-core` 后，会出现 `router` 和 `pinia` 的多选。
- `error-test` 用于验证熔断逻辑，`pre` 失败会直接终止流程。

## 配置字段

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `title` | `string` | 是 | 模板唯一标识。 |
| `description` | `string` | 否 | 交互菜单中的提示信息。 |
| `include` | `string[]` | 否 | 子模块标题列表；在交互中递归选择。 |
| `copy` | `string[]` | 否 | 需要复制到当前工作目录的源路径。 |
| `hook` | `{ event, command, description? }[]` | 否 | 命令钩子，`event` 仅支持 `pre` 或 `post`。 |

## 运行方式

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

## 项目结构

```text
velo/
├── src/
│   ├── index.ts            # CLI 入口
│   ├── prompts.ts          # 交互式模板/子模块选择
│   ├── engine.ts           # hook 执行与 copy 逻辑
│   ├── types.ts            # 配置类型定义
│   └── config/velo.json    # 默认配置
├── dist/                   # 编译产物
├── tests/                  # 测试
└── .github/workflows/      # CI / Release 工作流
```

## License

MIT
