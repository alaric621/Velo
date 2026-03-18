import * as p from '@clack/prompts';
import { ScaffoldConfig } from './types';

const SKIP_INCLUDE_SELECTION = '__velo_skip_include__';

/**
 * 核心流程：第一步单选，后续根据 include 递归选择
 * single:
 * - false 或 undefined(默认): 多选
 * - true: 单选（包含一个“跳过”选项）
 */
export async function createWorkflow(rawConfigs: ScaffoldConfig[]): Promise<ScaffoldConfig[]> {
  // --- 1. 第一阶段：单选主模板 ---
  // 过滤掉以 atom: 开头的，作为起始入口
  const mainTemplates = rawConfigs.filter(c => !c.title.startsWith('atom:'));
  
  const baseTitle = await p.select({
    message: '🚀 请选择基础项目模板 (单选)：',
    options: mainTemplates.map(t => ({ 
      value: t.title, 
      label: t.title, 
      hint: t.description // 在这里展示描述
    })),
  });

  if (p.isCancel(baseTitle)) {
    p.cancel('操作已取消');
    process.exit(0);
  }

  // 初始化结果数组
  const baseConfig = rawConfigs.find(c => c.title === baseTitle)!;
  const finalSequence: ScaffoldConfig[] = [baseConfig];
  const seen = new Set<string>([baseConfig.title]);

  // --- 2. 递归函数：处理后续子模块 ---
  async function resolveSubModules(includeTitles: string[], single = false) {
    if (!includeTitles || includeTitles.length === 0) return;

    // 过滤掉已经存在于 finalSequence 中的配置，防止死循环
    const availableOptions = includeTitles.filter(t => !seen.has(t));
    if (availableOptions.length === 0) return;

    const promptOptions = availableOptions.map(t => {
      const conf = rawConfigs.find(c => c.title === t);
      return {
        value: t,
        label: t,
        hint: conf?.description
      };
    });

    let selectedList: string[] = [];
    if (single) {
      const selectedSubTitle = await p.select({
        message: `🧩 请选择要加载的子模块 (单选)：`,
        options: [
          ...promptOptions,
          { value: SKIP_INCLUDE_SELECTION, label: '跳过', hint: '不选择任何子模块' }
        ],
      });

      if (p.isCancel(selectedSubTitle)) {
        p.cancel('操作已取消');
        process.exit(0);
      }

      if (selectedSubTitle !== SKIP_INCLUDE_SELECTION) {
        selectedList = [selectedSubTitle as string];
      }
    } else {
      const selectedSubTitles = await p.multiselect({
        message: `🧩 请选择要加载的子模块 (多选/Space选中/Enter确认)：`,
        options: promptOptions,
        required: false,
      });

      if (p.isCancel(selectedSubTitles)) {
        p.cancel('操作已取消');
        process.exit(0);
      }

      selectedList = selectedSubTitles as string[];
    }

    // 遍历用户选中的每一个子模块
    for (const title of selectedList) {
      const subConfig = rawConfigs.find(c => c.title === title);
      if (subConfig) {
        seen.add(title);
        finalSequence.push(subConfig);

        // 如果这个子模块还有自己的 include，递归调用
        if (subConfig.include && subConfig.include.length > 0) {
          p.log.message(`\n  └─ 正在配置 ${title} 的扩展选项...`);
          await resolveSubModules(subConfig.include, subConfig.single ?? false);
        }
      }
    }
  }

  // --- 3. 启动递归流程 ---
  if (baseConfig.include && baseConfig.include.length > 0) {
    await resolveSubModules(baseConfig.include, baseConfig.single ?? false);
  }

  return finalSequence;
}
