import { handleMessage } from './advanced-diff.worker';
import { WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { AdvancedDiffPayload } from './advanced-diff-payload';

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
    handleMessage(messageEvent('job-1', { left: 'a\nb', right: 'a\nc', granularity: 'line' }));

    const message = posted[0] as { result: { lineDiff: unknown; fineDiff?: unknown } };
    expect(message.result.lineDiff).toBeDefined();
    expect(message.result.fineDiff).toBeUndefined();
  });

  it('includes a fineDiff for word granularity', () => {
    handleMessage(messageEvent('job-2', { left: 'the cat', right: 'the dog', granularity: 'word' }));

    const message = posted[0] as { result: { fineDiff?: { segments: unknown[] } } };
    expect(message.result.fineDiff?.segments.length).toBeGreaterThan(0);
  });

  it('includes a fineDiff for char granularity', () => {
    handleMessage(messageEvent('job-3', { left: 'cat', right: 'car', granularity: 'char' }));

    const message = posted[0] as { result: { fineDiff?: { segments: unknown[] } } };
    expect(message.result.fineDiff?.segments.length).toBeGreaterThan(0);
  });
});
