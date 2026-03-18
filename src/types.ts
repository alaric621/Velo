export interface Hook {
  event: 'pre' | 'post';
  command: string;
  description?: string;
}

export interface RunCopyTask {
  type: 'copy';
  paths?: string[];
}

export interface RunShellTask {
  type: 'shell';
  command: string;
  description?: string;
}

export type RunTask = RunCopyTask | RunShellTask;

export interface ScaffoldConfig {
  title: string;
  description?: string;
  include?: string[];
  run?: RunTask[];
  hook?: Hook[];
}
