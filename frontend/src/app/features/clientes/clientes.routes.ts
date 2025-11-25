import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./clientes-list/clientes-list.component').then(m => m.ClientesListComponent) },
  { path: 'nuevo', loadComponent: () => import('./clientes-form/clientes-form.component').then(m => m.ClientesFormComponent) },
  { path: ':id', loadComponent: () => import('./clientes-form/clientes-form.component').then(m => m.ClientesFormComponent) },
];
