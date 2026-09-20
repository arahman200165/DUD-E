import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PersistenceService } from './persistence.service';

describe('PersistenceService', () => {
  let service: PersistenceService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersistenceService);
  });

  async function stable(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  it('acceptance: a safe preference persisted with policy "local" survives a fresh service instance', async () => {
    const preference = service.signal('demoTool', 'indentSize', 'local', 2);
    preference.set(4);
    await stable();

    expect(localStorage.getItem('dude:v1:demoTool:indentSize')).toBe(JSON.stringify(4));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(PersistenceService);
    const reloaded = freshService.signal('demoTool', 'indentSize', 'local', 2);

    expect(reloaded()).toBe(4);
  });

  it('acceptance: a JWT-like payload set with policy "none" never reaches localStorage or sessionStorage', async () => {
    const token = service.signal('jwtTool', 'token', 'none', '');
    token.set('eyJhbGciOiJIUzI1NiJ9.fake.jwt-payload');
    await stable();

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('policy "session" writes to sessionStorage only', async () => {
    const value = service.signal('sessionTool', 'draft', 'session', '');
    value.set('hello');
    await stable();

    expect(sessionStorage.getItem('dude:v1:sessionTool:draft')).toBe(JSON.stringify('hello'));
    expect(localStorage.getItem('dude:v1:sessionTool:draft')).toBeNull();
  });

  it('policy "user-choice" defaults to session-only when consent has not been granted', async () => {
    const value = service.signal('choiceTool', 'layout', 'user-choice', 'grid');
    value.set('list');
    await stable();

    expect(sessionStorage.getItem('dude:v1:choiceTool:layout')).toBe(JSON.stringify('list'));
    expect(localStorage.getItem('dude:v1:choiceTool:layout')).toBeNull();
  });

  it('policy "user-choice" moves future writes to localStorage once consent is granted, without migrating the current value', async () => {
    const value = service.signal('choiceTool', 'layout', 'user-choice', 'grid');
    value.set('list');
    await stable();

    service.setConsent('choiceTool', 'layout', true);
    expect(localStorage.getItem('dude:v1:choiceTool:layout')).toBeNull();

    value.set('columns');
    await stable();

    expect(localStorage.getItem('dude:v1:choiceTool:layout')).toBe(JSON.stringify('columns'));
  });

  it('revoking consent deletes any existing local value immediately', async () => {
    const value = service.signal('choiceTool', 'layout', 'user-choice', 'grid');
    service.setConsent('choiceTool', 'layout', true);
    value.set('columns');
    await stable();
    expect(localStorage.getItem('dude:v1:choiceTool:layout')).toBe(JSON.stringify('columns'));

    service.setConsent('choiceTool', 'layout', false);
    expect(localStorage.getItem('dude:v1:choiceTool:layout')).toBeNull();
  });

  it('clearTool removes only that tool\'s keys, leaving a similarly-named tool untouched', async () => {
    service.signal('a', 'x', 'local', 1).set(10);
    service.signal('a2', 'x', 'local', 2).set(20);
    await stable();

    service.clearTool('a');

    expect(localStorage.getItem('dude:v1:a:x')).toBeNull();
    expect(localStorage.getItem('dude:v1:a2:x')).toBe(JSON.stringify(20));
  });

  it('clearAll empties every dude-prefixed key but leaves unrelated keys alone', async () => {
    service.signal('a', 'x', 'local', 1).set(10);
    service.signal('b', 'y', 'session', 1).set(20);
    localStorage.setItem('some-other-app:setting', 'keep-me');
    await stable();

    service.clearAll();

    expect(localStorage.getItem('dude:v1:a:x')).toBeNull();
    expect(sessionStorage.getItem('dude:v1:b:y')).toBeNull();
    expect(localStorage.getItem('some-other-app:setting')).toBe('keep-me');
  });

  it('does not throw and keeps the in-memory value when a storage write fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });

    const value = service.signal('demoTool', 'indentSize', 'local', 2);
    expect(() => value.set(4)).not.toThrow();
    await stable();

    expect(value()).toBe(4);

    vi.restoreAllMocks();
  });
});
