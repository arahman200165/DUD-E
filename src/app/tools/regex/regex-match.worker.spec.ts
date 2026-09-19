import { handleMessage } from './regex-match.worker';
import { WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { RegexMatchPayload } from './regex-match-payload';

function messageEvent(id: string, payload: RegexMatchPayload): MessageEvent<WorkerRequestMessage<RegexMatchPayload>> {
  return { data: { id, payload } } as MessageEvent<WorkerRequestMessage<RegexMatchPayload>>;
}

describe('regex-match.worker handleMessage', () => {
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

  it('posts a result message with matches for a valid pattern', () => {
    handleMessage(messageEvent('job-1', { pattern: 'a', flags: '', testText: 'banana' }));

    expect(posted).toHaveLength(1);
    const message = posted[0] as { id: string; kind: string; result: { ok: boolean; matches: unknown[] } };
    expect(message.id).toBe('job-1');
    expect(message.kind).toBe('result');
    expect(message.result.ok).toBe(true);
    expect(message.result.matches).toHaveLength(3);
  });

  it('posts an error message for an invalid pattern', () => {
    handleMessage(messageEvent('job-2', { pattern: '(', flags: '', testText: 'x' }));

    expect(posted).toHaveLength(1);
    const message = posted[0] as { id: string; kind: string; result: { ok: boolean; error?: string } };
    expect(message.id).toBe('job-2');
    expect(message.kind).toBe('result');
    expect(message.result.ok).toBe(false);
  });
});
