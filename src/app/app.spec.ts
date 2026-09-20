import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideServiceWorker } from '@angular/service-worker';
import { App } from './app';
import { routes } from './core/routing/app.routes';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideServiceWorker('ngsw-worker.js', { enabled: false })],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the deck at the root route', async () => {
    const harness = await RouterTestingHarness.create('/');
    const compiled = harness.routeNativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Deck');
  });

  it('a worker failure on a real tool does not break shell navigation', async () => {
    const harness = await RouterTestingHarness.create('/tools/diff');
    const runButton = Array.from(harness.routeNativeElement!.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Diff',
    ) as HTMLButtonElement;

    // jsdom has no Worker implementation, so this exercises the same
    // construction-failure path a real worker crash would take.
    expect(() => runButton.click()).not.toThrow();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Failed');

    await harness.navigateByUrl('/');
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Deck');
  });
});
