import { Routes } from '@angular/router';

export const COMPRAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./compras-list/compras-list.component').then(
        (m) => m.ComprasListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./compras-form/compras-form.component').then(
        (m) => m.ComprasFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./compras-form/compras-form.component').then(
        (m) => m.ComprasFormComponent,
      ),
  },
];
