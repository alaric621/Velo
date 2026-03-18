#!/usr/bin/env node
import * as p from '@clack/prompts';
import { loadConfigs } from './config-loader';
import { runCopy, runHooks } from './engine';
import { createWorkflow } from './prompts';

async function main() {
  p.intro('✨ Velo Scaffolding Tool');

  try {
    const { configs, configPath, initialized } = await loadConfigs();
    if (initialized) {
      p.log.message(`已初始化用户配置: ${configPath}`);
    }

    // 1. 交互并获取有序的任务数组
    // 比如结果是：[atomConfig, aaaConfig, bbbConfig]
    const workflows = await createWorkflow(configs);

    for (const workflow of workflows) {
      await runHooks(workflow, 'pre');
      await runCopy(workflow);
      await runHooks(workflow, 'post');
    }

    p.outro('🎉 项目初始化成功！您可以开始编码了。');
  } catch (error: any) {
    p.cancel(`项目创建失败: ${error.message}`);
    process.exit(1);
  }
}

main();
