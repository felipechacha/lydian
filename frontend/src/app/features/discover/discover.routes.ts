import { Routes } from '@angular/router';

export const DISCOVER_ROUTES: Routes = [
  {
    path: 'discover',
    loadComponent: () =>
      import('./pages/discover/discover').then((module) => module.Discover),
  },
];
