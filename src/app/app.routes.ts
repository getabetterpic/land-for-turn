import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./users/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./users/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
