/**
 * Pure, framework-free text analysis used by the worker demo. Kept separate
 * from `worker-demo.worker.ts` so the algorithm is unit-testable without a
 * real `Worker`.
 */

export interface TextFrequencyOptions {
  readonly chunkSize?: number;
  readonly triggerError?: boolean;
  readonly onProgress?: (percent: number) => void;
}

export interface TextFrequencyResult {
  readonly wordCount: number;
  readonly charCount: number;
  readonly topWords: ReadonlyArray<readonly [string, number]>;
  readonly topChars: ReadonlyArray<readonly [string, number]>;
}

const DEFAULT_CHUNK_SIZE = 50;
const TOP_ENTRY_LIMIT = 10;
const ERROR_TRIGGER_PROGRESS = 40;

export function analyzeTextFrequency(text: string, options: TextFrequencyOptions = {}): TextFrequencyResult {
  const { chunkSize = DEFAULT_CHUNK_SIZE, triggerError = false, onProgress } = options;

  const words = text.split(/\s+/).filter(Boolean);
  const wordCounts = new Map<string, number>();
  const charCounts = new Map<string, number>();
  const totalChunks = Math.max(1, Math.ceil(words.length / chunkSize));

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const chunkWords = words.slice(start, start + chunkSize);

    for (const rawWord of chunkWords) {
      const normalized = rawWord.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
      if (normalized) wordCounts.set(normalized, (wordCounts.get(normalized) ?? 0) + 1);

      for (const char of rawWord.toLowerCase()) {
        charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
      }
    }

    const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
    onProgress?.(percent);

    if (triggerError && percent >= ERROR_TRIGGER_PROGRESS) {
      throw new Error('Deliberate worker failure triggered for testing.');
    }
  }

  return {
    wordCount: words.length,
    charCount: text.length,
    topWords: topEntries(wordCounts),
    topChars: topEntries(charCounts),
  };
}

function topEntries(counts: Map<string, number>): ReadonlyArray<readonly [string, number]> {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_ENTRY_LIMIT);
}
