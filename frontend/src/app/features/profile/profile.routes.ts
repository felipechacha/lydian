import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((module) => module.Profile),
  },
];
