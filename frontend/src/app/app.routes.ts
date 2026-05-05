import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'wallet',
    loadComponent: () =>
      import('./pages/wallet/wallet.component').then(
        (m) => m.WalletComponent
      ),
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics/analytics.component').then(
        (m) => m.AnalyticsComponent
      ),
  },
];
