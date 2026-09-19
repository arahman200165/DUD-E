import { TestBed } from '@angular/core/testing';
import { ToolDefinition } from '../../shared/models/tool-definition.model';
import { ToolRegistryService, validateDefinitions } from './tool-registry.service';

describe('ToolRegistryService', () => {
  let service: ToolRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolRegistryService);
  });

  it('resolves getByRoute for both slash forms', () => {
    expect(service.getByRoute('/tools/json')?.id).toBe('json');
    expect(service.getByRoute('tools/json')?.id).toBe('json');
  });

  it('groups the JSON tool under the data category', () => {
    const grouped = service.groupedByCategory();
    expect(grouped['data'].map((t) => t.id)).toContain('json');
  });

  it('declares a nonpersistent policy for the JSON placeholder (no real preferences yet)', () => {
    expect(service.getById('json')?.persistence?.input).toBe('none');
  });

  it('returns an empty array for categories with no tools', () => {
    const grouped = service.groupedByCategory();
    expect(grouped['web']).toEqual([]);
  });

  it('requiresNetwork is false for tools with no declared network policy', () => {
    expect(service.requiresNetwork('json')).toBe(false);
    expect(service.requiresNetwork('worker-demo')).toBe(false);
  });

  it('requiresNetwork is false for an unknown tool id', () => {
    expect(service.requiresNetwork('does-not-exist')).toBe(false);
  });
});

describe('validateDefinitions', () => {
  const noop = () => Promise.resolve();

  it('logs an error for a duplicate id', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const duplicates: ToolDefinition[] = [
      { id: 'a', title: 'A', description: '', category: 'data', keywords: [], route: '/tools/a', load: noop },
      { id: 'a', title: 'A2', description: '', category: 'text', keywords: [], route: '/tools/a2', load: noop },
    ];

    validateDefinitions(duplicates);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs an error for a duplicate route', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const duplicates: ToolDefinition[] = [
      { id: 'a', title: 'A', description: '', category: 'data', keywords: [], route: '/tools/x', load: noop },
      { id: 'b', title: 'B', description: '', category: 'text', keywords: [], route: '/tools/x', load: noop },
    ];

    validateDefinitions(duplicates);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does not log for a valid definition set', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const valid: ToolDefinition[] = [
      { id: 'a', title: 'A', description: '', category: 'data', keywords: [], route: '/tools/a', load: noop },
    ];

    validateDefinitions(valid);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
