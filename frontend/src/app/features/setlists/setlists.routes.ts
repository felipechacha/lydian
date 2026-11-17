import { Routes } from '@angular/router';

export const SETLIST_ROUTES: Routes = [
  {
    path: 'setlist',
    loadComponent: () => import('./pages/setlist/setlist').then((module) => module.Setlist),
  },
  {
    path: 'setlist-details',
    redirectTo: 'setlist-details/1',
    pathMatch: 'full',
  },
  {
    path: 'setlist-details/:id',
    loadComponent: () =>
      import('./pages/setlist-details/setlist-details').then((module) => module.SetlistDetails),
  },
  {
    path: 'stage-mode/:id',
    loadComponent: () => import('./pages/stage-mode/stage-mode').then((module) => module.StageMode),
  },
];
