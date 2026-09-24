import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { ToolRegistryService } from '../../core/registry/tool-registry.service';
import { PASTE_DETECTORS } from '../../core/paste-detect/paste-detectors';
import { detectShapes } from '../../core/paste-detect/paste-detect';
import { PasteHandoffService } from '../../core/paste-detect/paste-handoff.service';

/**
 * Smart Paste-Detection (`DUDE_PRD.md` §21 Phase 21 Item 3) — see `shell/AGENTS.md` for why this
 * is new shell surface area, sanctioned the same way `pipelines/` was for Item 2. Not a 278th
 * tool: no `TOOL_DEFINITIONS` entry, no category.
 */
@Component({
  selector: 'app-smart-paste',
  templateUrl: './smart-paste.html',
})
export class SmartPaste {
  private readonly persistence = inject(PersistenceService);
  private readonly registry = inject(ToolRegistryService);
  private readonly handoff = inject(PasteHandoffService);
  private readonly router = inject(Router);

  // 'none' policy: whatever is pasted here to be identified may be exactly the kind of sensitive
  // payload (JWT, token, private JSON) that DUDE_PRD.md §14.1 says should never persist by default.
  protected readonly input = this.persistence.signal('smart-paste', 'input', 'none', '');

  protected readonly matches = computed(() =>
    detectShapes(this.input(), PASTE_DETECTORS, (id) => this.registry.getById(id)),
  );

  protected onInputChange(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected clear(): void {
    this.input.set('');
  }

  protected open(toolId: string): void {
    const tool = this.registry.getById(toolId);
    if (!tool) return;

    this.handoff.offer(toolId, this.input());
    void this.router.navigate([tool.route]);
  }
}
