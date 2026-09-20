import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { routes } from '../../core/routing/app.routes';

describe('Sidebar', () => {
  let clearAllSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    clearAllSpy = vi.spyOn(TestBed.inject(PersistenceService), 'clearAll').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function clearAllButton(fixture: ReturnType<typeof TestBed.createComponent>): HTMLButtonElement {
    return Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Clear all DUDE data'),
    ) as HTMLButtonElement;
  }

  it('does not clear data when the confirm dialog is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();

    clearAllButton(fixture).click();

    expect(clearAllSpy).not.toHaveBeenCalled();
  });

  it('clears all data when the confirm dialog is accepted', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();

    clearAllButton(fixture).click();

    expect(clearAllSpy).toHaveBeenCalledTimes(1);
  });
});
