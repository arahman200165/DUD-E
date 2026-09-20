import { checkRange, compareVersions, sortVersions } from './semver-compare';

describe('compareVersions', () => {
  it('reports equal versions', () => {
    const result = compareVersions('1.2.3', '1.2.3');
    expect(result.ok).toBe(true);
    expect(result.ok && result.order).toBe(0);
    expect(result.ok && result.diffType).toBeNull();
  });

  it('reports a patch difference', () => {
    const result = compareVersions('1.2.3', '1.2.4');
    expect(result.ok).toBe(true);
    expect(result.ok && result.order).toBe(-1);
    expect(result.ok && result.diffType).toBe('patch');
  });

  it('reports a major difference in the other direction', () => {
    const result = compareVersions('2.0.0', '1.9.9');
    expect(result.ok).toBe(true);
    expect(result.ok && result.order).toBe(1);
    expect(result.ok && result.diffType).toBe('major');
  });

  it('parses prerelease and build metadata', () => {
    const result = compareVersions('1.0.0-alpha.1+build5', '1.0.0');
    expect(result.ok).toBe(true);
    expect(result.ok && result.a.prerelease).toEqual(['alpha', 1]);
    expect(result.ok && result.a.build).toEqual(['build5']);
  });

  it('reports an error for an invalid version', () => {
    const result = compareVersions('not-a-version', '1.0.0');
    expect(result.ok).toBe(false);
  });
});

describe('sortVersions', () => {
  it('sorts valid versions ascending and separates invalid lines', () => {
    const result = sortVersions(['2.0.0', '1.0.0', 'nope', '1.5.0', '']);
    expect(result.valid).toEqual(['1.0.0', '1.5.0', '2.0.0']);
    expect(result.invalid).toEqual(['nope']);
  });

  it('sorts descending when requested', () => {
    const result = sortVersions(['1.0.0', '2.0.0', '1.5.0'], 'desc');
    expect(result.valid).toEqual(['2.0.0', '1.5.0', '1.0.0']);
  });
});

describe('checkRange', () => {
  it('reports a version that satisfies a caret range', () => {
    const result = checkRange('1.2.5', '^1.2.0');
    expect(result.ok).toBe(true);
    expect(result.ok && result.satisfies).toBe(true);
  });

  it('reports a version that does not satisfy a range', () => {
    const result = checkRange('2.0.0', '^1.2.0');
    expect(result.ok).toBe(true);
    expect(result.ok && result.satisfies).toBe(false);
  });

  it('reports an error for an invalid version', () => {
    const result = checkRange('not-a-version', '^1.0.0');
    expect(result.ok).toBe(false);
  });

  it('reports an error for an invalid range', () => {
    const result = checkRange('1.0.0', 'not-a-range');
    expect(result.ok).toBe(false);
  });
});
