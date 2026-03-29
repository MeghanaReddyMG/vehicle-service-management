import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'user-dashboard', loadComponent: () => import('./pages/user-dashboard/user-dashboard').then(m => m.UserDashboardComponent) },
      { path: 'customers', loadComponent: () => import('./pages/customers/customers').then(m => m.CustomersComponent) },
      { path: 'service-entry', loadComponent: () => import('./pages/service-entry/service-entry').then(m => m.ServiceEntryComponent) },
      { path: 'service-history', loadComponent: () => import('./pages/service-history/service-history').then(m => m.ServiceHistoryComponent) },
      { path: 'billing', loadComponent: () => import('./pages/billing/billing').then(m => m.BillingComponent) },
      { path: 'my-bills', loadComponent: () => import('./pages/my-bills/my-bills').then(m => m.MyBillsComponent) },
      { path: 'cost-estimator', loadComponent: () => import('./pages/cost-estimator/cost-estimator').then(m => m.CostEstimatorComponent) },
      { path: 'predict', loadComponent: () => import('./pages/predict/predict').then(m => m.PredictComponent) },
      { path: 'reminders', loadComponent: () => import('./pages/reminders/reminders').then(m => m.RemindersComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
