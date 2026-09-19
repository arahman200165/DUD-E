import { handleMessage } from './hash-compute.worker';
import { WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { HashComputePayload } from './hash-compute-payload';

function messageEvent(id: string, payload: HashComputePayload): MessageEvent<WorkerRequestMessage<HashComputePayload>> {
  return { data: { id, payload } } as MessageEvent<WorkerRequestMessage<HashComputePayload>>;
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('hash-compute.worker handleMessage', () => {
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

  it('posts a result message with computed hashes for a valid payload', async () => {
    handleMessage(messageEvent('job-1', { text: 'hello', algorithms: ['MD5', 'SHA-256'] }));
    await flush();

    expect(posted).toHaveLength(1);
    const message = posted[0] as { id: string; kind: string; result: { algorithm: string; hex: string }[] };
    expect(message.id).toBe('job-1');
    expect(message.kind).toBe('result');
    expect(message.result.map((r) => r.algorithm)).toEqual(['MD5', 'SHA-256']);
    expect(message.result.every((r) => /^[0-9a-f]+$/.test(r.hex))).toBe(true);
  });

  it('posts an error message when hash computation rejects', async () => {
    const digestSpy = vi.spyOn(crypto.subtle, 'digest').mockRejectedValueOnce(new Error('digest failed'));

    handleMessage(messageEvent('job-2', { text: 'hello', algorithms: ['SHA-256'] }));
    await flush();

    expect(posted).toHaveLength(1);
    const message = posted[0] as { id: string; kind: string; error: { message: string } };
    expect(message.id).toBe('job-2');
    expect(message.kind).toBe('error');
    expect(message.error.message).toBe('digest failed');

    digestSpy.mockRestore();
  });
});
