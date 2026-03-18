import { homedir } from 'os';
import { Hook, ScaffoldConfig } from './types';

/**
 * 递归平铺配置：处理 include 逻辑
 */
export function flattenConfig(
  config: ScaffoldConfig, 
  allConfigs: ScaffoldConfig[], 
  seen = new Set<string>()
): { copy: string[], hook: Hook[] } {
  if (seen.has(config.title)) return { copy: [], hook: [] };
  seen.add(config.title);

  let mergedCopy: string[] = [];
  let mergedHook: Hook[] = [];

  // 1. 处理 include 的子配置
  if (config.include) {
    for (const subTitle of config.include) {
      const subConfig = allConfigs.find(c => c.title === subTitle);
      if (subConfig) {
        const flatSub = flattenConfig(subConfig, allConfigs, seen);
        mergedCopy.push(...flatSub.copy);
        mergedHook.push(...flatSub.hook);
      }
    }
  }

  // 2. 加入当前内容
  if (config.copy) mergedCopy.push(...config.copy);
  if (config.hook) mergedHook.push(...config.hook);

  return {
    copy: [...new Set(mergedCopy)], // 去重
    hook: mergedHook
  };
}

export function resolvePath(pathStr: string): string {
  return pathStr.replace(/^~/, homedir());
}
