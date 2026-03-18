import * as p from '@clack/prompts';
import { createWorkflow } from './prompts';
import type {ScaffoldConfig} from "./types"


export const rawConfigs:ScaffoldConfig[]= [
  {
    title: "atom",
    description: "🚀 核心基础框架：包含 Vite, TypeScript 及项目基础目录结构",
    include: [
      "aaa",
      "ccc"
    ],
    copy: ["/templates/base-core"], // 假设这是基础模板路径
    hook: [
      { 
        event: "pre", 
        command: "node -v", 
        description: "检查 Node.js 环境" 
      },
      { 
        event: "post", 
        command: "git init", 
        description: "初始化 Git 仓库" 
      }
    ]
  },
  {
    title: "aaa",
    description: "🛠️ 业务插件 A：集成 Axios 请求封装与统一错误处理",
    include: ['bbb'],
    copy: ["/templates/plugins/axios-module"],
    hook: [
      { 
        event: "post", 
        command: "npm install axios", 
        description: "安装 Axios 依赖" 
      }
    ]
  },
  {
    title: "bbb",
    description: "📦 辅助工具 B：常用 Utils 函数库 (Cookie, Storage, Format)",
    include: ['ccc'],
    copy: ["/templates/utils/common-tools"]
  },
  {
    title: "ccc",
    description: "🎨 UI 组件库 C：基于 Tailwind 的原子化组件预设",
    copy: ["/templates/ui/tailwind-presets"],
    hook: [
      { 
        event: "post", 
        command: "npm install -D tailwindcss postcss autoprefixer", 
        description: "安装 Tailwind 相关开发依赖" 
      },
      { 
        event: "post", 
        command: "npx tailwindcss init -p", 
        description: "生成 Tailwind 配置文件" 
      }
    ]
  }
];
async function main() {
  p.intro('✨ Velo Scaffolding Tool');

  try {
    // 1. 交互并获取有序的任务数组
    // 比如结果是：[atomConfig, aaaConfig, bbbConfig]
    const workflow = await createWorkflow(rawConfigs);
    console.log(workflow);
    
    // 2. 执行任务流
    // await executeWorkflow(workflow);

    p.outro('🎉 项目初始化成功！您可以开始编码了。');
  } catch (error: any) {
    p.cancel(`项目创建失败: ${error.message}`);
    process.exit(1);
  }
}

main();