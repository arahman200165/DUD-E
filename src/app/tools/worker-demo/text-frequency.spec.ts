import { analyzeTextFrequency } from './text-frequency';

describe('analyzeTextFrequency', () => {
  it('counts words and characters for simple text', () => {
    const result = analyzeTextFrequency('the cat sat on the mat');

    expect(result.wordCount).toBe(6);
    expect(result.charCount).toBe('the cat sat on the mat'.length);
    expect(result.topWords[0]).toEqual(['the', 2]);
  });

  it('reports progress once per chunk, ending at 100', () => {
    const progressUpdates: number[] = [];
    const words = Array.from({ length: 25 }, (_, i) => `word${i}`).join(' ');

    analyzeTextFrequency(words, { chunkSize: 10, onProgress: (percent) => progressUpdates.push(percent) });

    expect(progressUpdates).toEqual([33, 67, 100]);
  });

  it('throws a deliberate error once triggerError is set and enough progress has been made', () => {
    const words = Array.from({ length: 25 }, (_, i) => `word${i}`).join(' ');

    expect(() => analyzeTextFrequency(words, { chunkSize: 10, triggerError: true })).toThrow(
      'Deliberate worker failure triggered for testing.',
    );
  });

  it('does not throw for empty text and returns zero counts', () => {
    const result = analyzeTextFrequency('');

    expect(result.wordCount).toBe(0);
    expect(result.topWords).toEqual([]);
  });
});
