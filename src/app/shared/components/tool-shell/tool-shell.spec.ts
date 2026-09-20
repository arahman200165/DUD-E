import { WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToolShell } from './tool-shell';
import { ConnectivityService } from '../../../core/connectivity/connectivity.service';

class FakeConnectivityService {
  readonly online: WritableSignal<boolean> = signal(true);
}

class FakeRouter {
  readonly url = '/tools/demo';
}

describe('ToolShell', () => {
  let online: WritableSignal<boolean>;

  beforeEach(() => {
    const fakeConnectivity = new FakeConnectivityService();
    online = fakeConnectivity.online;

    TestBed.configureTestingModule({
      providers: [
        { provide: ConnectivityService, useValue: fakeConnectivity },
        { provide: Router, useValue: new FakeRouter() },
      ],
    });
  });

  function createComponent(networkRequired: boolean) {
    const fixture = TestBed.createComponent(ToolShell);
    fixture.componentRef.setInput('title', 'Demo Tool');
    fixture.componentRef.setInput('networkRequired', networkRequired);
    fixture.detectChanges();
    return fixture;
  }

  it('hides the offline badge when the tool has no network requirement, even while offline', () => {
    online.set(false);
    const fixture = createComponent(false);

    expect(fixture.nativeElement.textContent).not.toContain('Offline');
  });

  it('hides the offline badge when the tool requires network but the app is online', () => {
    online.set(true);
    const fixture = createComponent(true);

    expect(fixture.nativeElement.textContent).not.toContain('Offline');
  });

  it('shows the offline badge when the tool requires network and the app is offline', () => {
    online.set(false);
    const fixture = createComponent(true);

    expect(fixture.nativeElement.textContent).toContain('Offline');
  });
});
