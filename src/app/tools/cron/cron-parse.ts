import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';

export type CronTimezoneMode = 'local' | 'utc';

export interface CronNextRun {
  readonly date: Date;
  readonly display: string;
}

export type CronParseResult =
  | { readonly ok: true; readonly description: string; readonly nextRuns: readonly CronNextRun[] }
  | { readonly ok: false; readonly error: string };

/**
 * cronstrue understands `@`-macros (e.g. `@daily`) and 6-field
 * seconds-prefixed expressions natively, so the raw expression is passed to
 * both libraries as-is — no normalization step is needed.
 */
export function parseCronExpression(
  expression: string,
  options: { readonly count: number; readonly tz: CronTimezoneMode; readonly now?: Date },
): CronParseResult {
  const trimmed = expression.trim();
  if (trimmed === '') return { ok: false, error: 'Enter a cron expression.' };

  let interval;
  try {
    interval = CronExpressionParser.parse(trimmed, {
      currentDate: options.now ?? new Date(),
      tz: options.tz === 'utc' ? 'UTC' : undefined,
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }

  let description: string;
  try {
    description = cronstrue.toString(trimmed);
  } catch {
    description = 'Custom schedule';
  }

  const nextRuns: CronNextRun[] = [];
  for (let i = 0; i < options.count; i++) {
    const date = interval.next().toDate();
    nextRuns.push({
      date,
      display: options.tz === 'utc' ? date.toISOString() : date.toLocaleString(),
    });
  }

  return { ok: true, description, nextRuns };
}
