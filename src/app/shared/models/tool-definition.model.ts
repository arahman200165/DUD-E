import { ToolCategory } from './tool-category.model';
import { PersistencePolicy } from './persistence-policy.model';
import { ToolIOCapabilities } from './tool-io.model';

export interface ToolPersistencePolicy {
  readonly input?: PersistencePolicy;
  readonly preferences?: PersistencePolicy;
}

export interface ToolExecutionPolicy {
  readonly worker?: 'none' | 'optional' | 'required';
}

export interface ToolNetworkPolicy {
  readonly required: boolean;
  readonly detail?: string;
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
  readonly io: ToolIOCapabilities;
  /** Desktop Explorer file/folder opening, interpreted generically by the platform bridge. */
  readonly desktopOpen?: { readonly extensions?: readonly string[]; readonly inputKey?: string; readonly directory?: boolean };
  readonly status?: 'stable' | 'experimental';
}
