/**
 * Pure, framework-free regex matching used by the Regex Tester tool. Runs
 * inside `regex-match.worker.ts` — a genuinely pathological pattern (e.g.
 * catastrophic backtracking) can only be stopped by terminating the worker
 * that is running it, which is what the tool's timeout/Cancel does; this
 * function itself cannot interrupt a single synchronous `exec` call.
 */

export interface RegexMatchGroup {
  readonly index: number;
  readonly name?: string;
  readonly value: string | undefined;
}

export interface RegexMatchEntry {
  readonly match: string;
  readonly index: number;
  readonly groups: readonly RegexMatchGroup[];
}

export type RegexMatchResult =
  | { readonly ok: true; readonly matches: readonly RegexMatchEntry[] }
  | { readonly ok: false; readonly error: string };

/** Hard cap so a pattern that matches at every position of a huge input still terminates. */
const MAX_MATCHES = 10_000;

export function findMatches(pattern: string, flags: string, testText: string): RegexMatchResult {
  if (pattern === '') return { ok: false, error: 'Enter a regular expression.' };

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }

  const matches: RegexMatchEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(testText)) !== null && matches.length < MAX_MATCHES) {
    matches.push({ match: match[0], index: match.index, groups: buildGroups(match) });

    if (match[0] === '') regex.lastIndex++;
  }

  return { ok: true, matches };
}

function buildGroups(match: RegExpExecArray): readonly RegexMatchGroup[] {
  const groups: RegexMatchGroup[] = [];

  for (let i = 1; i < match.length; i++) {
    groups.push({ index: i, value: match[i] });
  }

  if (match.groups) {
    for (const [name, value] of Object.entries(match.groups)) {
      groups.push({ index: -1, name, value });
    }
  }

  return groups;
}
