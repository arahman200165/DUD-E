import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { routes } from '../../core/routing/app.routes';
import { CommandPaletteService } from './command-palette.service';

describe('CommandPalette', () => {
  let service: CommandPaletteService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    service = TestBed.inject(CommandPaletteService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    service.close();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  async function stable(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  it('opens with the search input auto-focused', async () => {
    service.open();
    await stable();

    const input = document.querySelector<HTMLInputElement>('input');
    expect(input).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  it('filters results as the query changes', async () => {
    service.open();
    await stable();

    const input = document.querySelector<HTMLInputElement>('input')!;

    input.value = 'json';
    input.dispatchEvent(new Event('input'));
    await stable();
    expect(document.querySelectorAll('button').length).toBeGreaterThan(0);

    input.value = 'zzz-nonexistent';
    input.dispatchEvent(new Event('input'));
    await stable();
    expect(document.querySelectorAll('button').length).toBe(0);
  });

  it('navigates to the selected tool and closes on Enter', async () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.open();
    await stable();

    const input = document.querySelector<HTMLInputElement>('input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await stable();

    expect(navigateSpy).toHaveBeenCalledWith('/tools/json');
    expect(document.querySelector('input')).toBeNull();
  });

  it('closes without navigating on Escape', async () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    service.open();
    await stable();

    const input = document.querySelector<HTMLInputElement>('input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await stable();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(document.querySelector('input')).toBeNull();
  });
});
