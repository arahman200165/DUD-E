import { describe, expect, it } from 'vitest';
import { TOOL_DEFINITIONS } from '../registry/tool-definitions';
import { PASTE_DETECTORS } from './paste-detectors';
import { detectShapes } from './paste-detect';
import { encodeBase64 } from '../../../shared-logic/base64-codec';
import { generateUuid } from '../../tools/uuid/uuid-tool';
import { generateUlid } from '../../tools/ulid-tools/ulid-logic';
import { generateKsuid } from '../../tools/ksuid-tools/ksuid-logic';

const getTool = (id: string) => TOOL_DEFINITIONS.find((definition) => definition.id === id);

describe('PASTE_DETECTORS registry coverage', () => {
  it('every detector references a real, text-accepting tool', () => {
    for (const detector of PASTE_DETECTORS) {
      const tool = getTool(detector.toolId);
      expect(tool, `"${detector.toolId}" is not a real TOOL_DEFINITIONS id`).toBeDefined();
      expect(tool?.io.accepts, `"${detector.toolId}"'s io.accepts should include 'text'`).toContain('text');
    }
  });

  it('has no duplicate toolIds', () => {
    const ids = PASTE_DETECTORS.map((detector) => detector.toolId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/**
 * Sample-based regression check: feed one realistic value per shape through the full detector
 * set and assert the *intended* tool wins top rank. Guards against a future detector becoming
 * accidentally over-eager and drowning out a more specific match for the same input.
 *
 * `unix-timestamp` and `snowflake-id-tools` are deliberately excluded from the "wins top rank"
 * assertion below: any large decimal integer structurally satisfies both, and `snowflake-id-tools`
 * is intentionally scored low-confidence (see AGENTS.md) so it surfaces as a secondary candidate,
 * not the top match, for a plausibly-Snowflake-shaped number.
 */
describe('detectShapes sample regression', () => {
  it('returns [] for empty/whitespace input', () => {
    expect(detectShapes('', PASTE_DETECTORS, getTool)).toEqual([]);
    expect(detectShapes('   ', PASTE_DETECTORS, getTool)).toEqual([]);
  });

  const uuidSample = generateUuid('v4');
  const base64Sample = encodeBase64('Hello, DUDE! This is a paste-detection sample.');

  it.each<[string, string]>([
    ['jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'],
    ['uuid', uuidSample.ok ? uuidSample.value : ''],
    ['ulid-tools', generateUlid(false)],
    ['ksuid-tools', generateKsuid()],
    ['ip-address-inspector', '192.168.1.1'],
    ['json', '{"a":1,"b":[2,3]}'],
    ['url-inspector', 'https://example.com/path?x=1'],
    ['color-converter', '#3b82f6'],
    ['base64', base64Sample.ok ? base64Sample.value : ''],
    ['unix-timestamp', '1700000000'],
  ])('"%s" wins top rank for its sample value', (expectedId, sample) => {
    const matches = detectShapes(sample, PASTE_DETECTORS, getTool);
    expect(matches[0]?.toolId).toBe(expectedId);
  });

  it('surfaces snowflake-id-tools as a candidate (not necessarily top-ranked) for a plausible Snowflake id', () => {
    const matches = detectShapes('175928847299117063', PASTE_DETECTORS, getTool);
    expect(matches.some((match) => match.toolId === 'snowflake-id-tools')).toBe(true);
  });
});
