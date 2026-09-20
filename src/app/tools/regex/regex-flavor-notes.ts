import { parse, traverse } from 'regexp-tree';
import type { AstRegExp } from 'regexp-tree/ast';

/**
 * Cross-language regex "flavor" compatibility notes — a static per-flavor
 * dataset, not a re-implementation of each engine. Detects feature usage by
 * reusing `regexp-tree`'s AST (the same library `regex-explain.ts` uses)
 * when it parses cleanly (named groups, lookbehind, backreferences), via
 * its `traverse` helper rather than a hand-rolled recursive walk — falls
 * back to simple presence checks against the raw pattern source if AST
 * parsing failed, avoiding the escaping fragility a from-scratch tokenizer
 * would reintroduce.
 */

export type RegexFlavor = 'js' | 'python' | 'java' | 'dotnet' | 'go';

export interface RegexFlavorNote {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly severity: 'info' | 'warning';
}

export const REGEX_FLAVORS: Record<RegexFlavor, string> = {
  js: 'JavaScript (PCRE-like)',
  python: 'Python re',
  java: 'Java',
  dotnet: '.NET',
  go: 'Go RE2',
};

interface DetectedFeatures {
  readonly hasNamedGroups: boolean;
  readonly hasLookbehind: boolean;
  readonly hasLookahead: boolean;
  readonly hasBackreference: boolean;
}

function detectFeatures(pattern: string, flags: string): DetectedFeatures {
  try {
    const ast: AstRegExp = parse(new RegExp(pattern, (flags.match(/[gimsuy]/g) ?? []).join('')));

    let hasNamedGroups = false;
    let hasLookahead = false;
    let hasLookbehind = false;
    let hasBackreference = false;

    traverse(ast, {
      Group(path) {
        if (path.node.capturing && path.node.name) hasNamedGroups = true;
      },
      Assertion(path) {
        if (path.node.kind === 'Lookahead') hasLookahead = true;
        if (path.node.kind === 'Lookbehind') hasLookbehind = true;
      },
      Backreference() {
        hasBackreference = true;
      },
    });

    return { hasNamedGroups, hasLookbehind, hasLookahead, hasBackreference };
  } catch {
    return {
      hasNamedGroups: /\(\?<[^=!]/.test(pattern),
      hasLookbehind: /\(\?<[=!]/.test(pattern),
      hasLookahead: /\(\?[=!]/.test(pattern),
      hasBackreference: /\\\d/.test(pattern) || /\\k</.test(pattern),
    };
  }
}

export function flavorNotesFor(pattern: string, flags: string, flavor: RegexFlavor): readonly RegexFlavorNote[] {
  if (pattern === '') return [];
  const features = detectFeatures(pattern, flags);
  const notes: RegexFlavorNote[] = [];

  if (flavor === 'go') {
    if (features.hasLookahead || features.hasLookbehind) {
      notes.push({
        id: 'go-no-lookaround',
        title: 'Lookaround is not supported',
        detail: "Go's RE2 engine does not support lookahead or lookbehind at all — this pattern will fail to compile in Go.",
        severity: 'warning',
      });
    }
    if (features.hasBackreference) {
      notes.push({
        id: 'go-no-backreference',
        title: 'Backreferences are not supported',
        detail: 'RE2 guarantees linear-time matching by disallowing backreferences entirely.',
        severity: 'warning',
      });
    }
  }

  if (flavor === 'python' && features.hasNamedGroups) {
    notes.push({
      id: 'python-named-group-syntax',
      title: 'Named group syntax differs',
      detail: "Python uses (?P<name>...) instead of (?<name>...), and (?P=name) instead of \\k<name> for backreferences.",
      severity: 'info',
    });
  }

  if (flavor === 'java' && features.hasLookbehind) {
    notes.push({
      id: 'java-fixed-length-lookbehind',
      title: 'Lookbehind must be bounded',
      detail: "Java's regex engine requires lookbehind to have a bounded (not unbounded *) length.",
      severity: 'warning',
    });
  }

  if (flavor === 'dotnet' && features.hasNamedGroups) {
    notes.push({
      id: 'dotnet-named-group-syntax',
      title: 'Named group syntax also accepts a variant',
      detail: ".NET accepts both (?<name>...) and (?'name'...); backreferences use \\k<name>, same as JavaScript.",
      severity: 'info',
    });
  }

  if (flavor === 'js' && features.hasLookbehind) {
    notes.push({
      id: 'js-lookbehind-support',
      title: 'Lookbehind requires a modern engine',
      detail: 'Lookbehind is supported in all current JS engines, but was historically missing in Safari before 2020.',
      severity: 'info',
    });
  }

  return notes;
}
