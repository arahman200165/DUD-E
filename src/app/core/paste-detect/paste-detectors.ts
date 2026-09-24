/**
 * Curated Smart Paste-Detection shape registry (`DUDE_PRD.md` §21 Phase 21 Item 3).
 *
 * A hand-maintained array, not a per-tool convention file — see `AGENTS.md` in this directory for
 * why. Each detector delegates to the owning tool's existing pure-logic export wherever one already
 * exists; only JSON's "is this JSON-shaped" check and the Snowflake/hex-color length/pattern gates
 * are new, since no existing tool exports a bare predicate for those.
 */
import { PasteDetector } from '../../shared/models/paste-detector.model';
import { decodeJwt } from '../../tools/jwt/jwt-decode';
import { inspectUuid } from '../../tools/uuid/uuid-tool';
import { decodeBase64 } from '../../../shared-logic/base64-codec';
import { resolveUnit } from '../../tools/unix-timestamp/timestamp-convert';
import { parseUrl } from '../../tools/url-inspector/url-parts';
import { inspectUlid } from '../../tools/ulid-tools/ulid-logic';
import { inspectKsuid } from '../../tools/ksuid-tools/ksuid-logic';
import { parseColor } from '../../tools/color-converter/color-convert';
import { inspectIpAddress } from '../../tools/ip-address-inspector/ip-address-inspector-logic';

const HEX_COLOR_LENGTHS = new Set([3, 4, 6, 8]);
const HEX_COLOR_PATTERN = /^#?[0-9a-f]{3,8}$/i;

export const PASTE_DETECTORS: readonly PasteDetector[] = [
  {
    toolId: 'jwt',
    test: (text) => (decodeJwt(text.trim()).ok ? 0.95 : null),
  },
  {
    toolId: 'uuid',
    test: (text) => (inspectUuid(text.trim()).valid ? 0.95 : null),
  },
  {
    toolId: 'ulid-tools',
    test: (text) => (inspectUlid(text.trim()).valid ? 0.9 : null),
  },
  {
    toolId: 'ksuid-tools',
    test: (text) => (inspectKsuid(text.trim()).ok ? 0.85 : null),
  },
  {
    toolId: 'ip-address-inspector',
    test: (text) => (inspectIpAddress(text.trim()) !== null ? 0.85 : null),
  },
  {
    toolId: 'json',
    test: (text) => {
      const trimmed = text.trim();
      if (trimmed === '') return null;
      try {
        const parsed: unknown = JSON.parse(trimmed);
        return typeof parsed === 'object' && parsed !== null ? 0.8 : null;
      } catch {
        return null;
      }
    },
  },
  {
    toolId: 'url-inspector',
    test: (text) => (parseUrl(text.trim()).ok ? 0.8 : null),
  },
  {
    toolId: 'unix-timestamp',
    test: (text) => {
      const trimmed = text.trim();
      if (!/^-?\d{9,}$/.test(trimmed)) return null;
      const unit = resolveUnit(trimmed, 'auto');
      if (!unit) return null;
      if (unit === 'seconds' || unit === 'milliseconds') return 0.85;
      return unit === 'microseconds' ? 0.6 : 0.5;
    },
  },
  {
    // Any decimal integer structurally qualifies, so this is deliberately low-confidence — it
    // should only outrank `unix-timestamp` when nothing more specific matches (see AGENTS.md).
    toolId: 'snowflake-id-tools',
    test: (text) => {
      const trimmed = text.trim();
      return /^\d{15,20}$/.test(trimmed) ? 0.35 : null;
    },
  },
  {
    toolId: 'color-converter',
    test: (text) => {
      const trimmed = text.trim();
      if (!HEX_COLOR_PATTERN.test(trimmed)) return null;
      if (!HEX_COLOR_LENGTHS.has(trimmed.replace(/^#/, '').length)) return null;
      return parseColor(trimmed).ok ? 0.75 : null;
    },
  },
  {
    toolId: 'base64',
    test: (text) => {
      const trimmed = text.trim();
      if (trimmed.length < 8 || trimmed.length % 4 !== 0) return null;
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) return null;
      return decodeBase64(trimmed).ok ? 0.5 : null;
    },
  },
];
