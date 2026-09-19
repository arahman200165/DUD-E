import { ToolCategory } from './tool-category.model';

export interface ToolPersistencePolicy {
  readonly input?: 'none' | 'session' | 'local' | 'user-choice';
  readonly preferences?: 'none' | 'session' | 'local' | 'user-choice';
}

export interface ToolExecutionPolicy {
  readonly worker?: 'none' | 'optional' | 'required';
}

export interface ToolNetworkPolicy {
  readonly required: boolean;
}

export interface ToolDefinition {
  readonly id: string;
  readonly title: string;
  readonly shortTitle?: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly keywords: readonly string[];
  readonly route: string;
  readonly icon?: string;
  readonly load: () => Promise<unknown>;
  readonly persistence?: ToolPersistencePolicy;
  readonly execution?: ToolExecutionPolicy;
  readonly network?: ToolNetworkPolicy;
  readonly status?: 'stable' | 'experimental';
}
