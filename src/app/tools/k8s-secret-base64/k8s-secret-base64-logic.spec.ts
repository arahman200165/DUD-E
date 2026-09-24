import { decodeSecretData, encodeSecretData, toSecretDataYaml } from './k8s-secret-base64-logic';

describe('encodeSecretData', () => {
  it('base64-encodes each pair\'s value', () => {
    const result = encodeSecretData([{ key: 'username', value: 'admin' }]);
    expect(result).toEqual([{ key: 'username', value: 'YWRtaW4=' }]);
  });
});

describe('decodeSecretData', () => {
  it('base64-decodes each pair\'s value', () => {
    const result = decodeSecretData([{ key: 'username', value: 'YWRtaW4=' }]);
    expect(result).toEqual([{ key: 'username', value: 'admin' }]);
  });

  it('reports an error for invalid base64', () => {
    const result = decodeSecretData([{ key: 'bad', value: 'not-valid-base64!!' }]);
    expect(result[0].error).toBeDefined();
  });
});

describe('toSecretDataYaml', () => {
  it('renders a data: block for successfully converted fields', () => {
    const fields = encodeSecretData([
      { key: 'username', value: 'admin' },
      { key: 'password', value: 'hunter2' },
    ]);
    expect(toSecretDataYaml(fields)).toBe('data:\n  username: YWRtaW4=\n  password: aHVudGVyMg==');
  });

  it('skips fields with an error', () => {
    const fields = decodeSecretData([{ key: 'bad', value: '!!!' }]);
    expect(toSecretDataYaml(fields)).toBe('');
  });

  it('returns an empty string for no fields', () => {
    expect(toSecretDataYaml([])).toBe('');
  });
});
