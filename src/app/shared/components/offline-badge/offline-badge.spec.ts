import { TestBed } from '@angular/core/testing';
import { OfflineBadge } from './offline-badge';

describe('OfflineBadge', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('renders the offline label by default', () => {
    const fixture = TestBed.createComponent(OfflineBadge);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Offline');
  });

  it('renders nothing when show is false', () => {
    const fixture = TestBed.createComponent(OfflineBadge);
    fixture.componentRef.setInput('show', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
