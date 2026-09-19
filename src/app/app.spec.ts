import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './core/routing/app.routes';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the dashboard at the root route', async () => {
    const harness = await RouterTestingHarness.create('/');
    const compiled = harness.routeNativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard');
  });

  it('a worker failure on the demo tool does not break shell navigation', async () => {
    const harness = await RouterTestingHarness.create('/tools/worker-demo');
    const runButton = Array.from(harness.routeNativeElement!.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Run',
    ) as HTMLButtonElement;

    // jsdom has no Worker implementation, so this exercises the same
    // construction-failure path a real worker crash would take.
    expect(() => runButton.click()).not.toThrow();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Failed');

    await harness.navigateByUrl('/');
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Dashboard');
  });
});
