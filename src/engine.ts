import { execa } from 'execa';
import * as p from '@clack/prompts';
import fs from 'fs-extra';
import { ScaffoldConfig } from './types';

/**
 * 任务执行引擎
 * 传入：createWorkflow 返回的有序配置数组
 */
export async function executeWorkflow(workflow: ScaffoldConfig[]) {
  const s = p.spinner();

  // --- 阶段 1: Pre-Hooks (环境预检) ---
  // 通常用于检查 node, pnpm 等版本，任何一个失败则中断
  for (const config of workflow) {
    const preHooks = config.hook?.filter(h => h.event === 'pre') || [];
    for (const hook of preHooks) {
      s.start(`🔍 [${config.title}] ${hook.description || '正在预检...'}`);
      try {
        await execa(hook.command, { shell: true });
        s.stop(`✅ ${config.title}: ${hook.description || '检查通过'}`);
      } catch (err) {
        s.stop(`❌ ${config.title}: ${hook.description} 失败`);
        throw new Error(`预检失败: ${hook.command}`);
      }
    }
  }

  // --- 阶段 2: Copy (文件同步) ---
  // 按照数组顺序复制，后加入的插件可以覆盖主模板的同名文件
  s.start('📂 正在同步项目文件...');
  for (const config of workflow) {
    if (config.copy && config.copy.length > 0) {
      for (const sourcePath of config.copy) {
        // 假设复制到当前工作目录 process.cwd()
        await fs.copy(sourcePath, process.cwd(), { overwrite: true });
      }
    }
  }
  s.stop('✅ 文件同步完成');

  // --- 阶段 3: Post-Hooks (项目初始化) ---
  // 按照数组顺序执行，如 git init, pnpm install 等
  for (const config of workflow) {
    const postHooks = config.hook?.filter(h => h.event === 'post') || [];
    for (const hook of postHooks) {
      p.log.step(`🚀 [${config.title}] 执行: ${hook.description}`);
      try {
        // 使用 stdio: 'inherit' 可以直接在终端看到 pnpm install 的进度条
        await execa(hook.command, { shell: true, stdio: 'inherit' });
      } catch (err) {
        p.log.error(`❌ 执行失败: ${hook.command}`);
        // 这里的错误可以根据需求决定是否 throw（有的脚本失败不影响后续）
      }
    }
  }
}