export interface Hook {
  event: 'pre' | 'post';
  command: string;
  description?: string;
}

export interface ScaffoldConfig {
  title: string;
  description?: string;
  include?: string[];
  copy?: string[];
  hook?: Hook[];
}