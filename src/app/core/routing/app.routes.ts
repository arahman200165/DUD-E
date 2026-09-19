import { Routes } from '@angular/router';
import { ShellLayout } from '../../shell/layout/shell-layout';
import { Dashboard } from '../../shell/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [
      { path: '', component: Dashboard },
      {
        path: 'tools/json',
        loadComponent: () =>
          import('../../tools/json/json-placeholder').then((m) => m.JsonPlaceholder),
      },
    ],
  },
];
