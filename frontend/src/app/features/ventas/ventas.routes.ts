import { Routes } from '@angular/router';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ventas-list/ventas-list.component').then(
        (m) => m.VentasListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./ventas-form/ventas-form.component').then(
        (m) => m.VentasFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./ventas-form/ventas-form.component').then(
        (m) => m.VentasFormComponent,
      ),
  },
];
