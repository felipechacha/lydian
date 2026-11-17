import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'reset-password/confirm', renderMode: RenderMode.Client },
  {
    path: 'practice-history',
    renderMode: RenderMode.Server,
  },
  {
    path: 'practice-session/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'practice-history/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'music-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'setlist-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'stage-mode/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
