import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TOOL_DEFINITIONS } from './tool-definitions';

describe('README tool count', () => {
  const readmePath = resolve(process.cwd(), 'README.md');
  const readme = readFileSync(readmePath, 'utf-8');

  // "Settings" is a desktop-only configuration page (Electron LLM proxy setup), not one of the
  // showcased developer micro-tools -- the PRD (§21 Phase 8) already treats it as not incrementing
  // the shipped-tool count, and README's Tools table deliberately omits it.
  const showcaseToolCount = TOOL_DEFINITIONS.filter((t) => t.id !== 'settings').length;

  it('matches the showcase tool count in the "N tools ship today" line', () => {
    const match = readme.match(/(\d+) tools ship today/);
    expect(match, 'README.md should contain an "N tools ship today" line').not.toBeNull();

    const statedCount = Number(match![1]);
    expect(
      statedCount,
      `README says ${statedCount} tools, registry has ${showcaseToolCount} showcase tools (excl. Settings) -- update README.md's "tools ship today" line`,
    ).toBe(showcaseToolCount);
  });

  it('has one Tools table row per registered tool', () => {
    const toolsSection = readme.split(/\n## Tools\n/)[1]?.split(/\n## Architecture\n/)[0] ?? '';
    const rows = toolsSection
      .split('\n')
      .filter((line) => line.trim().startsWith('|'))
      .filter((line) => !line.includes('---'))
      .filter((line) => !line.trim().startsWith('| Tool |'));

    expect(
      rows.length,
      `README's Tools table has ${rows.length} rows, registry has ${showcaseToolCount} showcase tools (excl. Settings) -- they should match`,
    ).toBe(showcaseToolCount);
  });
});
