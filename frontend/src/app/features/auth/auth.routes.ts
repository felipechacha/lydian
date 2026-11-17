import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((module) => module.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then((module) => module.Register),
  },
  {
    path: 'reset-password/confirm',
    data: { confirm: true },
    loadComponent: () =>
      import('./reset-password/reset-password').then((module) => module.ResetPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password').then((module) => module.ResetPassword),
  },
];
