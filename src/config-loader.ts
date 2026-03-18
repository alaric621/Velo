import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import defaultConfigs from './config/velo.json';
import type { ScaffoldConfig } from './types';

const APP_NAME = 'velo';
const CONFIG_FILE_NAME = 'config.json';

export interface LoadConfigOptions {
  argv?: string[];
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
  homedir?: string;
}

export interface LoadConfigResult {
  configs: ScaffoldConfig[];
  configPath: string;
  initialized: boolean;
}

export function resolveConfigPath(options: LoadConfigOptions = {}): string {
  const argv = options.argv ?? process.argv.slice(2);
  const env = options.env ?? process.env;
  const platform = options.platform ?? process.platform;
  const homedir = options.homedir ?? os.homedir();

  const argPath = readConfigArg(argv);
  if (argPath) {
    return path.resolve(argPath);
  }

  if (env.VELO_CONFIG_PATH) {
    return path.resolve(env.VELO_CONFIG_PATH);
  }

  const baseDir = resolveConfigBaseDir({ env, platform, homedir });
  return path.join(baseDir, APP_NAME, CONFIG_FILE_NAME);
}

export async function loadConfigs(options: LoadConfigOptions = {}): Promise<LoadConfigResult> {
  const configPath = resolveConfigPath(options);
  const initialized = await ensureConfigFile(configPath);
  const configs = await fs.readJson(configPath);

  return {
    configs: configs as ScaffoldConfig[],
    configPath,
    initialized,
  };
}

function readConfigArg(argv: string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === '--config') {
      return argv[index + 1];
    }

    if (current.startsWith('--config=')) {
      return current.slice('--config='.length);
    }
  }

  return undefined;
}

function resolveConfigBaseDir({
  env,
  platform,
  homedir,
}: {
  env: NodeJS.ProcessEnv;
  platform: NodeJS.Platform;
  homedir: string;
}): string {
  if (platform === 'win32') {
    return env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
  }

  if (platform === 'darwin') {
    return path.join(homedir, 'Library', 'Application Support');
  }

  return env.XDG_CONFIG_HOME || path.join(homedir, '.config');
}

async function ensureConfigFile(configPath: string): Promise<boolean> {
  if (await fs.pathExists(configPath)) {
    return false;
  }

  await fs.ensureDir(path.dirname(configPath));
  await fs.writeJson(configPath, defaultConfigs, { spaces: 2 });
  return true;
}
