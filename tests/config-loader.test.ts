import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import defaultConfigs from '../src/config/velo.json';
import { initConfigFile, loadConfigs, resolveConfigPath } from '../src/config-loader';

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => fs.remove(root)));
});

describe('config-loader', () => {
  it('initializes a default config file in the user config directory on first run', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'velo-config-loader-'));
    tempRoots.push(root);

    const result = await loadConfigs({
      env: {},
      homedir: root,
      platform: 'linux',
    });

    expect(result.initialized).toBe(true);
    expect(result.configPath).toBe(path.join(root, '.config', 'velo', 'config.json'));
    expect(result.configs).toEqual(defaultConfigs);
    expect(await fs.readJson(result.configPath)).toEqual(defaultConfigs);
  });

  it('reuses an existing config file instead of overwriting it', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'velo-config-loader-'));
    tempRoots.push(root);

    const configPath = path.join(root, '.config', 'velo', 'config.json');
    const customConfigs = [{ title: 'custom-template', hook: [{ event: 'pre', command: 'echo ok' }] }];

    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, customConfigs, { spaces: 2 });

    const result = await loadConfigs({
      env: {},
      homedir: root,
      platform: 'linux',
    });

    expect(result.initialized).toBe(false);
    expect(result.configs).toEqual(customConfigs);
    expect(await fs.readJson(configPath)).toEqual(customConfigs);
  });

  it('prefers explicit config paths from argv and env', () => {
    expect(
      resolveConfigPath({
        argv: ['--config', './custom.json'],
        env: { VELO_CONFIG_PATH: '/ignored/by/arg.json' },
        homedir: '/tmp/home',
        platform: 'linux',
      }),
    ).toBe(path.resolve('./custom.json'));

    expect(
      resolveConfigPath({
        argv: [],
        env: { VELO_CONFIG_PATH: '/tmp/velo.json' },
        homedir: '/tmp/home',
        platform: 'linux',
      }),
    ).toBe(path.resolve('/tmp/velo.json'));
  });

  it('rewrites the config file when forced', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'velo-config-loader-'));
    tempRoots.push(root);

    const configPath = path.join(root, '.config', 'velo', 'config.json');
    const customConfigs = [{ title: 'custom-template', copy: ['./x'] }];

    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, customConfigs, { spaces: 2 });

    const result = await initConfigFile({
      env: {},
      force: true,
      homedir: root,
      platform: 'linux',
    });

    expect(result.initialized).toBe(true);
    expect(await fs.readJson(configPath)).toEqual(defaultConfigs);
  });
});
