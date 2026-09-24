import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { validateEnv } from './env-validator-logic';

@Component({
  selector: 'app-env-validator',
  imports: [ToolShell],
  templateUrl: './env-validator.html',
})
export class EnvValidator {
  private readonly persistence = inject(PersistenceService);

  protected readonly envText = this.persistence.signal('env-validator', 'envText', 'session', 'PORT=8080\nNAME=app\n');
  protected readonly rulesText = this.persistence.signal('env-validator', 'rulesText', 'local', 'PORT:number\nDEBUG:boolean?\nNAME\nAPI_URL:url?');

  protected readonly issues = computed(() => validateEnv(this.envText(), this.rulesText()));

  protected onEnvInput(event: Event): void {
    this.envText.set((event.target as HTMLTextAreaElement).value);
  }

  protected onRulesInput(event: Event): void {
    this.rulesText.set((event.target as HTMLTextAreaElement).value);
  }
}
