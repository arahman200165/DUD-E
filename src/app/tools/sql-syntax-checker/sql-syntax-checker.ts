import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { checkSqlSyntax, SQL_CHECKER_DIALECTS, type SqlCheckerDialect } from './sql-syntax-checker-logic';

@Component({
  selector: 'app-sql-syntax-checker',
  imports: [ToolShell],
  templateUrl: './sql-syntax-checker.html',
})
export class SqlSyntaxChecker {
  private readonly persistence = inject(PersistenceService);

  protected readonly dialects = SQL_CHECKER_DIALECTS;

  protected readonly input = this.persistence.signal('sql-syntax-checker', 'input', 'session', 'SELECT a, b FROM t WHERE x = 1');
  protected readonly dialect = this.persistence.signal<SqlCheckerDialect>('sql-syntax-checker', 'dialect', 'local', 'postgresql');

  protected readonly result = computed(() => checkSqlSyntax(this.input(), this.dialect()));

  protected onInput(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected onDialectChange(event: Event): void {
    this.dialect.set((event.target as HTMLSelectElement).value as SqlCheckerDialect);
  }
}
