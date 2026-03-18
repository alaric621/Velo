import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clack/prompts', () => {
  return {
    select: vi.fn(),
    multiselect: vi.fn(),
    isCancel: vi.fn(() => false),
    cancel: vi.fn(),
    log: {
      message: vi.fn(),
    },
  };
});

import * as p from '@clack/prompts';
import { createWorkflow } from '../src/prompts';
import type { ScaffoldConfig } from '../src/types';

const prompts = p as unknown as {
  select: ReturnType<typeof vi.fn>;
  multiselect: ReturnType<typeof vi.fn>;
};

describe('createWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses multiselect by default when single is not configured', async () => {
    const configs: ScaffoldConfig[] = [
      { title: 'vue-core', include: ['router', 'pinia'] },
      { title: 'router' },
      { title: 'pinia' },
    ];

    prompts.select.mockResolvedValueOnce('vue-core');
    prompts.multiselect.mockResolvedValueOnce(['router', 'pinia']);

    const result = await createWorkflow(configs);

    expect(result.map((c) => c.title)).toEqual(['vue-core', 'router', 'pinia']);
    expect(prompts.multiselect).toHaveBeenCalledTimes(1);
  });

  it('uses select when single is true', async () => {
    const configs: ScaffoldConfig[] = [
      { title: 'vue-core', include: ['router', 'pinia'], single: true },
      { title: 'router' },
      { title: 'pinia' },
    ];

    prompts.select.mockResolvedValueOnce('vue-core');
    prompts.select.mockResolvedValueOnce('router');

    const result = await createWorkflow(configs);

    expect(result.map((c) => c.title)).toEqual(['vue-core', 'router']);
    expect(prompts.multiselect).not.toHaveBeenCalled();
  });

  it('supports skip option when single is true', async () => {
    const configs: ScaffoldConfig[] = [
      { title: 'vue-core', include: ['router', 'pinia'], single: true },
      { title: 'router' },
      { title: 'pinia' },
    ];

    prompts.select.mockResolvedValueOnce('vue-core');
    prompts.select.mockImplementationOnce(async (args: { options: Array<{ label: string; value: string }> }) => {
      return args.options.find((option) => option.label === '跳过')?.value;
    });

    const result = await createWorkflow(configs);

    expect(result.map((c) => c.title)).toEqual(['vue-core']);
  });

  it('respects each node single recursively', async () => {
    const configs: ScaffoldConfig[] = [
      { title: 'vue-core', include: ['router'] },
      { title: 'router', include: ['history', 'hash'], single: true },
      { title: 'history' },
      { title: 'hash' },
    ];

    prompts.select.mockResolvedValueOnce('vue-core');
    prompts.multiselect.mockResolvedValueOnce(['router']);
    prompts.select.mockResolvedValueOnce('history');

    const result = await createWorkflow(configs);

    expect(result.map((c) => c.title)).toEqual(['vue-core', 'router', 'history']);
  });
});
