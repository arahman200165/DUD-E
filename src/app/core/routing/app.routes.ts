import { Routes } from '@angular/router';
import { ShellLayout } from '../../shell/layout/shell-layout';
import { Deck } from '../../shell/deck/deck';
import { buildToolRoutes } from '../registry/tool-routes';

// The Pipelines routes below are the one deliberate exception to "never edit this file to wire
// up a feature" (DUDE_PRD.md §21 Phase 21 Item 2 explicitly sanctions it — composing tools into
// a workflow changes what a ToolDefinition means, not just adds one). Nothing here names a
// specific tool by id; Pipelines are a parallel, registry-adjacent feature, not a 278th tool.
export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [
      { path: '', component: Deck },
      {
        path: 'pipelines',
        loadComponent: () => import('../../shell/pipelines/pipeline-list/pipeline-list').then((m) => m.PipelineList),
      },
      {
        path: 'pipelines/new',
        loadComponent: () => import('../../shell/pipelines/pipeline-builder/pipeline-builder').then((m) => m.PipelineBuilder),
      },
      {
        path: 'pipelines/:id',
        loadComponent: () => import('../../shell/pipelines/pipeline-builder/pipeline-builder').then((m) => m.PipelineBuilder),
      },
      ...buildToolRoutes(),
    ],
  },
];
