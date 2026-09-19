import { ToolDefinition } from '../../shared/models/tool-definition.model';

export const TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  {
    id: 'json',
    title: 'JSON Formatter',
    description: 'Validate, format, and minify JSON.',
    category: 'data',
    keywords: ['json', 'format', 'validate', 'pretty', 'minify'],
    route: '/tools/json',
    load: () => import('../../tools/json/json-placeholder').then((m) => m.JsonPlaceholder),
    status: 'experimental',
    persistence: { input: 'none', preferences: 'none' },
  },
  {
    id: 'worker-demo',
    title: 'Worker Demo',
    description: 'Runs a chunked text-frequency analysis in a background Worker.',
    category: 'developer',
    keywords: ['worker', 'background', 'cancel', 'demo', 'frequency'],
    route: '/tools/worker-demo',
    load: () => import('../../tools/worker-demo/worker-demo').then((m) => m.WorkerDemo),
    status: 'experimental',
    persistence: { input: 'none', preferences: 'none' },
    execution: { worker: 'required' },
  },
];
