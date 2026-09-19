import { ToolDefinition } from '../../shared/models/tool-definition.model';
import { buildToolRoutes, toRoutePath } from './tool-routes';

describe('toRoutePath', () => {
  it('strips a leading slash', () => {
    expect(toRoutePath('/tools/json')).toBe('tools/json');
  });

  it('leaves a path with no leading slash unchanged', () => {
    expect(toRoutePath('tools/json')).toBe('tools/json');
  });
});

describe('buildToolRoutes', () => {
  const definitions: ToolDefinition[] = [
    {
      id: 'json',
      title: 'JSON Formatter',
      description: 'Validate, format, and minify JSON.',
      category: 'data',
      keywords: ['json'],
      route: '/tools/json',
      load: () => Promise.resolve({}),
    },
  ];

  it('produces a route path with the leading slash stripped', () => {
    const [route] = buildToolRoutes(definitions);
    expect(route.path).toBe('tools/json');
  });

  it('keeps loadComponent lazy instead of eagerly resolving the import', () => {
    const [route] = buildToolRoutes(definitions);
    expect(typeof route.loadComponent).toBe('function');
  });
});
