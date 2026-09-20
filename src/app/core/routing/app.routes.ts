import { Routes } from '@angular/router';
import { ShellLayout } from '../../shell/layout/shell-layout';
import { Deck } from '../../shell/deck/deck';
import { buildToolRoutes } from '../registry/tool-routes';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [{ path: '', component: Deck }, ...buildToolRoutes()],
  },
];
