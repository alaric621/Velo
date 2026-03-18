#!/usr/bin/env node
import * as p from '@clack/prompts';
import { createWorkflow } from './prompts';
import rawConfigs from "./config/velo.json"
import {runCopy,runHooks} from "./engine"
async function main() {
  p.intro('✨ Velo Scaffolding Tool');

  try {
    // 1. 交互并获取有序的任务数组
    // 比如结果是：[atomConfig, aaaConfig, bbbConfig]
    const workflows = await createWorkflow(rawConfigs);

    for  (const workflow of workflows) {
      await   runHooks(workflow,'pre')
      await   runCopy(workflow)
      await   runHooks(workflow,'post')
    }   

    p.outro('🎉 项目初始化成功！您可以开始编码了。');
  } catch (error: any) {
    p.cancel(`项目创建失败: ${error.message}`);
    process.exit(1);
  }
}

main();