import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ErrorPanel } from '../../../shared/components/error-panel/error-panel';
import { ToolDefinition } from '../../../shared/models/tool-definition.model';
import { DudeDataType } from '../../../shared/models/tool-io.model';
import { PipelineStep, PipelineValue } from '../../../shared/models/pipeline-step.model';
import { ToolRegistryService } from '../../../core/registry/tool-registry.service';
import { searchTools } from '../../../core/registry/tool-search';
import { PipelineStoreService } from '../../../core/pipeline/pipeline-store.service';
import { PipelineStepRegistryService } from '../../../core/pipeline/pipeline-step-registry.service';
import { PipelineRunnerService } from '../../../core/pipeline/pipeline-runner.service';
import { PipelineRun } from '../../../core/pipeline/pipeline-run';
import { canChain } from '../../../core/pipeline/pipeline-compatibility';
import { validatePipelineChain } from '../../../core/pipeline/pipeline-validation';
import { Pipeline, PipelineStepRef, createPipeline, createToolStep } from '../../../core/pipeline/pipeline.model';

const INITIAL_INPUT_TYPE = 'text' as const;

@Component({
  selector: 'app-pipeline-builder',
  imports: [ErrorPanel, NgTemplateOutlet, DecimalPipe],
  templateUrl: './pipeline-builder.html',
})
export class PipelineBuilder {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(PipelineStoreService);
  private readonly registry = inject(ToolRegistryService);
  private readonly stepRegistry = inject(PipelineStepRegistryService);
  private readonly runner = inject(PipelineRunnerService);

  protected readonly pipelineId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    initialValue: this.route.snapshot.paramMap.get('id'),
  });

  protected readonly pipeline = signal<Pipeline>(this.initPipeline());
  protected readonly resolvedSteps = signal<Readonly<Record<string, PipelineStep | undefined>>>({});
  protected readonly registryReady = signal(false);

  protected readonly inputText = signal('');
  protected readonly run = signal<PipelineRun | null>(null);

  protected readonly pickerInsertAt = signal<number | null>(null);
  protected readonly pickerQuery = signal('');

  protected readonly validation = computed(() =>
    validatePipelineChain(
      INITIAL_INPUT_TYPE,
      this.pipeline().steps.map((step) => ({ stepId: step.stepId, step: this.resolvedSteps()[step.stepId] })),
    ),
  );

  protected readonly canRun = computed(() => this.registryReady() && this.validation().valid && this.pipeline().steps.length > 0);

  protected readonly pickerResults = computed(() => {
    if (!this.registryReady()) return { compatible: [] as ToolDefinition[], incompatible: [] as ToolDefinition[] };

    const insertAt = this.pickerInsertAt();
    if (insertAt === null) return { compatible: [], incompatible: [] };

    const upstreamProduces = this.upstreamProducesAt(insertAt);
    const candidates = searchTools(this.registry.getAll(), this.pickerQuery());

    const compatible: ToolDefinition[] = [];
    const incompatible: ToolDefinition[] = [];

    for (const definition of candidates) {
      const step = this.stepRegistry.get(definition.id);
      if (!step) continue; // not pipeline-eligible yet

      if (upstreamProduces === null || canChain({ accepts: [], produces: upstreamProduces }, step)) {
        compatible.push(definition);
      } else {
        incompatible.push(definition);
      }
    }

    return { compatible: compatible.slice(0, 30), incompatible: incompatible.slice(0, 10) };
  });

  constructor() {
    effect(() => {
      const steps = this.pipeline().steps;
      void this.stepRegistry.ensureLoaded().then(() => {
        const resolved: Record<string, PipelineStep | undefined> = {};
        for (const step of steps) {
          resolved[step.stepId] = step.kind === 'tool' ? this.stepRegistry.get(step.toolId) : undefined;
        }
        this.resolvedSteps.set(resolved);
        this.registryReady.set(true);
      });
    });
  }

  private initPipeline(): Pipeline {
    const id = this.route.snapshot.paramMap.get('id');
    const existing = id ? this.store.getById(id) : undefined;
    return existing ?? createPipeline('Untitled pipeline');
  }

  /** The type(s) available just before array index `insertAt` — null means "unfiltered" (the very first step). */
  private upstreamProducesAt(insertAt: number): readonly DudeDataType[] | null {
    if (insertAt === 0) return null;
    const previous = this.pipeline().steps[insertAt - 1];
    return this.resolvedSteps()[previous.stepId]?.produces ?? null;
  }

  private persist(next: Pipeline): void {
    this.pipeline.set(next);
    this.store.save(next);
    if (this.pipelineId() !== next.id) {
      void this.router.navigate(['/pipelines', next.id], { replaceUrl: true });
    }
  }

  protected rename(name: string): void {
    this.persist({ ...this.pipeline(), name });
  }

  protected openPicker(insertAt: number): void {
    this.pickerInsertAt.set(insertAt);
    this.pickerQuery.set('');
  }

  protected closePicker(): void {
    this.pickerInsertAt.set(null);
  }

  protected addStep(toolId: string): void {
    const insertAt = this.pickerInsertAt();
    if (insertAt === null) return;

    const steps = [...this.pipeline().steps];
    steps.splice(insertAt, 0, createToolStep(toolId, this.registry.getById(toolId)?.title));
    this.persist({ ...this.pipeline(), steps });
    this.closePicker();
  }

  protected removeStep(stepId: string): void {
    this.persist({ ...this.pipeline(), steps: this.pipeline().steps.filter((step) => step.stepId !== stepId) });
  }

  protected moveStep(stepId: string, direction: -1 | 1): void {
    const steps = [...this.pipeline().steps];
    const index = steps.findIndex((step) => step.stepId === stepId);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= steps.length) return;

    [steps[index], steps[target]] = [steps[target], steps[index]];
    this.persist({ ...this.pipeline(), steps });
  }

  protected stepLabel(ref: PipelineStepRef): string {
    if (ref.kind === 'script') return ref.label ?? 'Script step';
    return ref.label ?? this.registry.getById(ref.toolId)?.title ?? ref.toolId;
  }

  protected runPipeline(): void {
    const initialInput: PipelineValue = { type: INITIAL_INPUT_TYPE, value: this.inputText() };
    const run = this.runner.runPipeline(this.pipeline(), initialInput, async (ref) =>
      ref.kind === 'tool' ? this.stepRegistry.get(ref.toolId) : undefined,
    );
    this.run.set(run);
  }

  protected formatOutput(output: unknown): string {
    if (typeof output === 'string') return output;
    return JSON.stringify(output, null, 2);
  }
}
