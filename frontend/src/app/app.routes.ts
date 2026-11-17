import { Routes } from '@angular/router';

import { AUTH_ROUTES } from './features/auth/auth.routes';
import { DISCOVER_ROUTES } from './features/discover/discover.routes';
import { HOME_ROUTES } from './features/home/home.routes';
import { LANDING_ROUTES } from './features/landing/landing.routes';
import { LIBRARY_ROUTES } from './features/library/library.routes';
import { PRACTICE_ROUTES } from './features/practice/practice.routes';
import { PROFILE_ROUTES } from './features/profile/profile.routes';
import { SETLIST_ROUTES } from './features/setlists/setlists.routes';
import { SUBSCRIPTION_ROUTES } from './features/subscription/subscription.routes';

export const routes: Routes = [
  ...LANDING_ROUTES,
  ...AUTH_ROUTES,
  ...HOME_ROUTES,
  ...LIBRARY_ROUTES,
  ...SETLIST_ROUTES,
  ...PRACTICE_ROUTES,
  ...DISCOVER_ROUTES,
  ...PROFILE_ROUTES,
  ...SUBSCRIPTION_ROUTES,
];
