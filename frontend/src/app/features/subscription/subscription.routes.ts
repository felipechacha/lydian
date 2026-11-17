import { Routes } from '@angular/router';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: 'subscription',
    loadComponent: () =>
      import('./pages/subscription/subscription').then((module) => module.Subscription),
  },
];
