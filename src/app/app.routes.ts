import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'quotes',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/quotes/quote-list.component').then(m => m.QuoteListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/quotes/quote-form.component').then(m => m.QuoteFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/quotes/quote-form.component').then(m => m.QuoteFormComponent)
          }
        ]
      },
      {
        path: 'invoices',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/invoices/invoice-list.component').then(m => m.InvoiceListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/invoices/invoice-form.component').then(m => m.InvoiceFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/invoices/invoice-form.component').then(m => m.InvoiceFormComponent)
          }
        ]
      },
      {
        path: 'checks',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/checks/check-list.component').then(m => m.CheckListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/checks/check-form.component').then(m => m.CheckFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/checks/check-form.component').then(m => m.CheckFormComponent)
          }
        ]
      },
      {
        path: 'clients',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/clients/client-list.component').then(m => m.ClientListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent)
          }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/task.component').then(m => m.TaskComponent)
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
