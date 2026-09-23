import { flattenModel } from './model-generator-flatten';
import { inferFromJson } from './model-generator-infer';
import { emitCSharp } from './model-generator-emit-csharp';
import { emitGo } from './model-generator-emit-go';
import { emitJava } from './model-generator-emit-java';
import { emitKotlin } from './model-generator-emit-kotlin';
import { emitPython } from './model-generator-emit-python';
import { emitRust } from './model-generator-emit-rust';
import { emitSql } from './model-generator-emit-sql';
import { emitSwift } from './model-generator-emit-swift';
import { emitTypeScript } from './model-generator-emit-typescript';
import { EmitResult, FlattenedModel } from './model-generator-types';

export type ModelLanguage = 'typescript' | 'csharp' | 'java' | 'kotlin' | 'swift' | 'python' | 'rust' | 'go' | 'sql';

export const MODEL_LANGUAGES: Record<ModelLanguage, string> = {
  typescript: 'TypeScript',
  csharp: 'C#',
  java: 'Java',
  kotlin: 'Kotlin',
  swift: 'Swift',
  python: 'Python (dataclass)',
  rust: 'Rust',
  go: 'Go',
  sql: 'SQL (CREATE TABLE)',
};

const EMITTERS: Record<ModelLanguage, (model: FlattenedModel) => EmitResult> = {
  typescript: emitTypeScript,
  csharp: emitCSharp,
  java: emitJava,
  kotlin: emitKotlin,
  swift: emitSwift,
  python: emitPython,
  rust: emitRust,
  go: emitGo,
  sql: emitSql,
};

export type ModelGenerateResult = ({ readonly ok: true } & EmitResult) | { readonly ok: false; readonly error: string };

/** The one entry point the component calls: parse JSON, infer its shape, flatten it, emit code. */
export function generateModel(input: string, rootName: string, language: ModelLanguage): ModelGenerateResult {
  const inferred = inferFromJson(input);
  if (!inferred.ok) return { ok: false, error: inferred.error };

  const flattened = flattenModel(inferred.root, rootName.trim() === '' ? 'Root' : rootName);
  const emitted = EMITTERS[language](flattened);
  return { ok: true, ...emitted };
}
