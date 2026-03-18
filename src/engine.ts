import { execa } from 'execa';
import * as p from '@clack/prompts';
import fs from 'fs-extra';
import { ScaffoldConfig } from './types';

/**
 * 通用 Hook 执行器
 */
export async function runHooks(config: ScaffoldConfig, type: 'pre' | 'all' | 'post' = 'pre') {
  const hooks = config.hook?.filter(h => h.event === type) || [];
  if (hooks.length === 0) return;

  const s = p.spinner();

  for (const hook of hooks) {
    const label = type === 'pre' ? '预检' : '初始化';
    
    if (type === 'pre') {
      s.start(`🔍 [${config.title}] ${hook.description || '正在验证...'}`);
      try {
        await execa(hook.command, { shell: true });
        s.stop(`✅ ${config.title}: ${hook.description || '通过'}`);
      } catch (err: any) {
        s.stop(`❌ ${config.title}: ${label}失败`);
        // 抛出错误给外层捕获，附带详细终端输出
        throw new Error(`[${config.title}] ${label}失败: ${err.stderr || err.message}`);
      }
    } else {
      p.log.step(`🚀 [${config.title}] 正在执行: ${hook.description}`);
      try {
        await execa(hook.command, { 
          shell: true, 
          stdio: 'inherit', 
          cwd: process.cwd() 
        });
      } catch (err: any) {
        // 直接抛错，外层会进入 catch 块
        throw new Error(`[${config.title}] ${label}指令执行失败: ${hook.command}`);
      }
    }
  }
}

/**
 * 执行单个配置任务的文件复制
 */
export async function runCopy(config: ScaffoldConfig) {
  if (!config.copy || config.copy.length === 0) return;

  const s = p.spinner();
  s.start(`📂 [${config.title}] 正在同步文件...`);
  
  for (const sourcePath of config.copy) {
    try {
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, process.cwd(), { overwrite: true });
      } else {
        throw new Error(`找不到路径: ${sourcePath}`);
      }
    } catch (err: any) {
      s.stop(`❌ [${config.title}] 文件同步失败`);
      // 这里的 err 会被抛出并在 main 函数中被捕获
      throw err; 
    }
  }
  s.stop(`✅ [${config.title}] 文件同步完成`);
}