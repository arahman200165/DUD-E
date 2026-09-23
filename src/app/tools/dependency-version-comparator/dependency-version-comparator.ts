import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { diffDependencyLists } from './dependency-version-compare';

const SAMPLE_BEFORE = '"@angular/core": "^21.0.0"\n"rxjs": "~7.8.0"\n"left-pad": "1.0.0"';
const SAMPLE_AFTER = '"@angular/core": "^22.1.0"\n"rxjs": "~7.8.1"\n"right-pad": "1.0.0"';

@Component({
  selector: 'app-dependency-version-comparator',
  imports: [ToolShell],
  templateUrl: './dependency-version-comparator.html',
})
export class DependencyVersionComparator {
  private readonly persistence = inject(PersistenceService);

  protected readonly before = this.persistence.signal('dependency-version-comparator', 'before', 'session', SAMPLE_BEFORE);
  protected readonly after = this.persistence.signal('dependency-version-comparator', 'after', 'session', SAMPLE_AFTER);

  protected readonly diff = computed(() => diffDependencyLists(this.before(), this.after()));

  protected onBeforeChange(event: Event): void {
    this.before.set((event.target as HTMLTextAreaElement).value);
  }

  protected onAfterChange(event: Event): void {
    this.after.set((event.target as HTMLTextAreaElement).value);
  }

  protected kindLabel(kind: string): string {
    switch (kind) {
      case 'added':
        return 'Added';
      case 'removed':
        return 'Removed';
      case 'unchanged':
        return 'Unchanged';
      case 'upgraded-major':
        return 'Major upgrade';
      case 'upgraded-minor':
        return 'Minor upgrade';
      case 'upgraded-patch':
        return 'Patch upgrade';
      case 'downgraded':
        return 'Downgraded';
      default:
        return 'Changed';
    }
  }
}
