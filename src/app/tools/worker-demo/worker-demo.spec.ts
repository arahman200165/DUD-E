import { WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WorkerDemo, buildAnalysisText } from './worker-demo';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob, WorkerJobStatus } from '../../core/workers/worker-job';
import { TextFrequencyResult } from './text-frequency';

describe('buildAnalysisText', () => {
  it('never allocates more than maxLength characters, even for a huge repeat count', () => {
    const result = buildAnalysisText('abc', 10_000_000, 100);

    expect(result.length).toBe(100);
  });

  it('repeats the base text the requested number of times when under maxLength', () => {
    expect(buildAnalysisText('ab', 3, 1000)).toBe('ababab');
  });

  it('returns an empty string for empty base text', () => {
    expect(buildAnalysisText('', 50, 1000)).toBe('');
  });
});

interface FakeJob {
  readonly job: WorkerJob<TextFrequencyResult>;
  readonly status: WritableSignal<WorkerJobStatus>;
  readonly result: WritableSignal<TextFrequencyResult | null>;
  readonly error: WritableSignal<string | null>;
  readonly cancel: ReturnType<typeof vi.fn>;
}

function createFakeJob(): FakeJob {
  const status = signal<WorkerJobStatus>('running');
  const progress = signal<number | null>(null);
  const result = signal<TextFrequencyResult | null>(null);
  const error = signal<string | null>(null);
  const cancel = vi.fn(() => status.set('cancelled'));

  return { job: { status, progress, result, error, cancel }, status, result, error, cancel };
}

describe('WorkerDemo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function findButton(fixture: ReturnType<typeof TestBed.createComponent>, label: string): HTMLButtonElement {
    return Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === label,
    ) as HTMLButtonElement;
  }

  it('renders the busy indicator while running and the result once the job completes', () => {
    const fake = createFakeJob();
    vi.spyOn(TestBed.inject(WorkerClientService), 'run').mockReturnValue(fake.job);

    const fixture = TestBed.createComponent(WorkerDemo);
    fixture.detectChanges();
    findButton(fixture, 'Run').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Running');

    fake.result.set({ wordCount: 3, charCount: 10, topWords: [['fox', 2]], topChars: [] });
    fake.status.set('done');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Done');
    expect(fixture.nativeElement.textContent).toContain('fox (2)');
  });

  it('renders the error panel when the job fails, without throwing', () => {
    const fake = createFakeJob();
    vi.spyOn(TestBed.inject(WorkerClientService), 'run').mockReturnValue(fake.job);

    const fixture = TestBed.createComponent(WorkerDemo);
    fixture.detectChanges();
    findButton(fixture, 'Run').click();
    fixture.detectChanges();

    expect(() => {
      fake.error.set('Deliberate worker failure triggered for testing.');
      fake.status.set('error');
      fixture.detectChanges();
    }).not.toThrow();

    expect(fixture.nativeElement.textContent).toContain('Deliberate worker failure triggered for testing.');
  });

  it('Cancel calls the job handle and reflects the cancelled status', () => {
    const fake = createFakeJob();
    vi.spyOn(TestBed.inject(WorkerClientService), 'run').mockReturnValue(fake.job);

    const fixture = TestBed.createComponent(WorkerDemo);
    fixture.detectChanges();
    findButton(fixture, 'Run').click();
    fixture.detectChanges();

    findButton(fixture, 'Cancel').click();
    fixture.detectChanges();

    expect(fake.cancel).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('Cancelled');
  });

  it('cancels any in-flight job on destroy so navigating away does not leak a worker', () => {
    const fake = createFakeJob();
    vi.spyOn(TestBed.inject(WorkerClientService), 'run').mockReturnValue(fake.job);

    const fixture = TestBed.createComponent(WorkerDemo);
    fixture.detectChanges();
    findButton(fixture, 'Run').click();
    fixture.detectChanges();

    fixture.destroy();

    expect(fake.cancel).toHaveBeenCalledTimes(1);
  });
});
