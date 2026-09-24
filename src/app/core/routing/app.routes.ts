import { Routes } from '@angular/router';
import { ShellLayout } from '../../shell/layout/shell-layout';
import { Deck } from '../../shell/deck/deck';
import { buildToolRoutes } from '../registry/tool-routes';

// The Pipelines and Smart Paste routes below are the deliberate exceptions to "never edit this
// file to wire up a feature" (DUDE_PRD.md §21 Phase 21 Items 2 and 3 explicitly sanction them —
// see shell/AGENTS.md). Nothing here names a specific tool by id; both are parallel,
// registry-adjacent features, never a 278th tool.
export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [
      { path: '', component: Deck },
      {
        path: 'smart-paste',
        loadComponent: () => import('../../shell/smart-paste/smart-paste').then((m) => m.SmartPaste),
      },
      {
        path: 'pipelines',
        loadComponent: () => import('../../shell/pipelines/pipeline-list/pipeline-list').then((m) => m.PipelineList),
      },
      {
        path: 'pipelines/new',
        loadComponent: () => import('../../shell/pipelines/pipeline-builder/pipeline-builder').then((m) => m.PipelineBuilder),
      },
      // The static 'pipelines/scripts...' routes must come before the wildcard 'pipelines/:id'
      // below, or Angular's first-match routing would treat "scripts" as a pipeline id.
      {
        path: 'pipelines/scripts',
        loadComponent: () => import('../../shell/pipelines/script-list/script-list').then((m) => m.ScriptList),
      },
      {
        path: 'pipelines/scripts/new',
        loadComponent: () => import('../../shell/pipelines/script-editor/script-editor').then((m) => m.ScriptEditor),
      },
      {
        path: 'pipelines/scripts/:id',
        loadComponent: () => import('../../shell/pipelines/script-editor/script-editor').then((m) => m.ScriptEditor),
      },
      {
        path: 'pipelines/:id',
        loadComponent: () => import('../../shell/pipelines/pipeline-builder/pipeline-builder').then((m) => m.PipelineBuilder),
      },
      ...buildToolRoutes(),
    ],
  },
];
