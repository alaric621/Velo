#!/usr/bin/env node
import * as p from '@clack/prompts';
import { execa } from 'execa';
import { initConfigFile, loadConfigs } from './config-loader';
import { runHooks, runTasks } from './engine';
import { createWorkflow } from './prompts';

async function main() {
  try {
    const argv = process.argv.slice(2);
    if (argv[0] === 'config') {
      await handleConfigCommand(argv.slice(1));
      return;
    }

    p.intro('✨ Velo Scaffolding Tool');

    const { configs, configPath, initialized } = await loadConfigs();
    if (initialized) {
      p.log.message(`已初始化用户配置: ${configPath}`);
    }

    // 1. 交互并获取有序的任务数组
    // 比如结果是：[atomConfig, aaaConfig, bbbConfig]
    const workflows = await createWorkflow(configs);

    for (const workflow of workflows) {
      await runHooks(workflow, 'pre');
      await runTasks(workflow);
      await runHooks(workflow, 'post');
    }

    p.outro('🎉 项目初始化成功！您可以开始编码了。');
  } catch (error: any) {
    p.cancel(`项目创建失败: ${error.message}`);
    process.exit(1);
  }
}

async function handleConfigCommand(args: string[]) {
  const [subcommand, ...rest] = args;

  switch (subcommand) {
    case 'init':
      await runConfigInit(rest);
      return;
    case 'edit':
      await runConfigEdit();
      return;
    default:
      throw new Error('支持的命令: velo config init [--force], velo config edit');
  }
}

async function runConfigInit(args: string[]) {
  const force = args.includes('--force');
  const result = await initConfigFile({ force });

  if (force) {
    p.log.success(`已重建默认配置: ${result.configPath}`);
    return;
  }

  if (result.initialized) {
    p.log.success(`已初始化默认配置: ${result.configPath}`);
    return;
  }

  p.log.message(`配置已存在: ${result.configPath}`);
}

async function runConfigEdit() {
  const { configPath } = await initConfigFile();
  const { command, commandArgs } = resolveSystemEditorCommand(configPath);
  await execa(command, commandArgs, { stdio: 'inherit' });
  p.log.success(`已调用系统默认编辑器: ${configPath}`);
}

function resolveSystemEditorCommand(configPath: string) {
  switch (process.platform) {
    case 'darwin':
      return { command: 'open', commandArgs: [configPath] };
    case 'win32':
      return { command: 'cmd', commandArgs: ['/c', 'start', '', configPath] };
    default:
      return { command: 'xdg-open', commandArgs: [configPath] };
  }
}

main();
