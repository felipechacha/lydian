import { Routes } from '@angular/router';

export const LIBRARY_ROUTES: Routes = [
  {
    path: 'library',
    loadComponent: () => import('./pages/library/library').then((module) => module.Library),
  },
  {
    path: 'musics',
    loadComponent: () => import('./pages/musics/musics').then((module) => module.Musics),
  },
  {
    path: 'setlists',
    redirectTo: 'musics',
    pathMatch: 'full',
  },
  {
    path: 'add-music',
    loadComponent: () => import('./pages/add-music/add-music').then((module) => module.AddMusic),
  },
  {
    path: 'music-details/:id',
    loadComponent: () =>
      import('./pages/music-details/music-details').then((module) => module.MusicDetails),
  },
  {
    path: 'music-details',
    redirectTo: 'musics',
    pathMatch: 'full',
  },
];
