import { Routes } from '@angular/router';
import { ShellLayout } from '../../shell/layout/shell-layout';
import { Dashboard } from '../../shell/dashboard/dashboard';
import { buildToolRoutes } from '../registry/tool-routes';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [{ path: '', component: Dashboard }, ...buildToolRoutes()],
  },
];
