import { handleMessage } from './advanced-diff.worker';
import { WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { AdvancedDiffPayload } from './advanced-diff-payload';
import { NO_IGNORE_OPTIONS } from './diff-normalize';

function messageEvent(
  id: string,
  payload: AdvancedDiffPayload,
): MessageEvent<WorkerRequestMessage<AdvancedDiffPayload>> {
  return { data: { id, payload } } as MessageEvent<WorkerRequestMessage<AdvancedDiffPayload>>;
}

describe('advanced-diff.worker handleMessage', () => {
  let posted: unknown[];

  beforeEach(() => {
    posted = [];
    vi.stubGlobal(
      'postMessage',
      vi.fn((message: unknown) => posted.push(message)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('always computes the line diff, with no fineDiff for line granularity', () => {
    handleMessage(messageEvent('job-1', { left: 'a\nb', right: 'a\nc', granularity: 'line', ignoreOptions: NO_IGNORE_OPTIONS }));

    const message = posted[0] as { result: { lineDiff: unknown; fineDiff?: unknown } };
    expect(message.result.lineDiff).toBeDefined();
    expect(message.result.fineDiff).toBeUndefined();
  });

  it('includes a fineDiff for word granularity', () => {
    handleMessage(messageEvent('job-2', { left: 'the cat', right: 'the dog', granularity: 'word', ignoreOptions: NO_IGNORE_OPTIONS }));

    const message = posted[0] as { result: { fineDiff?: { segments: unknown[] } } };
    expect(message.result.fineDiff?.segments.length).toBeGreaterThan(0);
  });

  it('includes a fineDiff for char granularity', () => {
    handleMessage(messageEvent('job-3', { left: 'cat', right: 'car', granularity: 'char', ignoreOptions: NO_IGNORE_OPTIONS }));

    const message = posted[0] as { result: { fineDiff?: { segments: unknown[] } } };
    expect(message.result.fineDiff?.segments.length).toBeGreaterThan(0);
  });

  it('treats case-only differences as equal in the line diff when ignoreCase is set', () => {
    handleMessage(
      messageEvent('job-4', {
        left: 'Hello',
        right: 'hello',
        granularity: 'line',
        ignoreOptions: { ...NO_IGNORE_OPTIONS, ignoreCase: true },
      }),
    );

    const message = posted[0] as { result: { lineDiff: { summary: { unchanged: number } } } };
    expect(message.result.lineDiff.summary.unchanged).toBe(1);
  });

  it('feeds normalized text into the fine diff when ignore-options are active', () => {
    handleMessage(
      messageEvent('job-5', {
        left: 'Hello',
        right: 'hello',
        granularity: 'char',
        ignoreOptions: { ...NO_IGNORE_OPTIONS, ignoreCase: true },
      }),
    );

    const message = posted[0] as { result: { fineDiff?: { segments: { type: string }[] } } };
    expect(message.result.fineDiff?.segments.every((s) => s.type === 'equal')).toBe(true);
  });
});
