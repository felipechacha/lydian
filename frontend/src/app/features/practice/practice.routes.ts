import { Routes } from '@angular/router';

export const PRACTICE_ROUTES: Routes = [
  {
    path: 'practice-history',
    loadComponent: () =>
      import('./pages/practice-history/practice-history').then((module) => module.PracticeHistory),
  },
  {
    path: 'practice-history/:id',
    loadComponent: () =>
      import('./pages/practice-history-detail/practice-history-detail').then(
        (module) => module.PracticeHistoryDetail,
      ),
  },
  {
    path: 'practice-session/:id',
    loadComponent: () =>
      import('./pages/practice-session/practice-session').then((module) => module.PracticeSession),
  },
  {
    path: 'practice-session',
    redirectTo: 'musics',
    pathMatch: 'full',
  },
];
