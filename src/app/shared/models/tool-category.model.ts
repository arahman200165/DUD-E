export type ToolCategory =
  | 'data'
  | 'text'
  | 'encoding'
  | 'security'
  | 'date-time'
  | 'web'
  | 'developer'
  | 'documents';

export interface ToolCategoryMeta {
  readonly label: string;
  /** Suffix used to build the `cat-*` Tailwind utilities/tokens, e.g. `cat-data`. */
  readonly colorToken: string;
}

export const CATEGORY_METADATA: Record<ToolCategory, ToolCategoryMeta> = {
  data: { label: 'Data', colorToken: 'cat-data' },
  text: { label: 'Text', colorToken: 'cat-text' },
  encoding: { label: 'Encoding', colorToken: 'cat-encoding' },
  security: { label: 'Security', colorToken: 'cat-security' },
  'date-time': { label: 'Date & Time', colorToken: 'cat-date-time' },
  web: { label: 'Web', colorToken: 'cat-web' },
  developer: { label: 'Developer', colorToken: 'cat-developer' },
  documents: { label: 'Documents', colorToken: 'cat-documents' },
};

export const TOOL_CATEGORIES: readonly ToolCategory[] = Object.keys(CATEGORY_METADATA) as ToolCategory[];
